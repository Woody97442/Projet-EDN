import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// ─────────────────────────────────────────────────────────────
//  Simple in-memory cache (TTL: 60s) — cleared on mutations
// ─────────────────────────────────────────────────────────────
const apiCache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60_000;

function fromCache<T>(key: string): T | null {
  const e = apiCache.get(key);
  return e && Date.now() - e.ts < CACHE_TTL ? (e.data as T) : null;
}
function toCache(key: string, data: unknown) {
  apiCache.set(key, { data, ts: Date.now() });
}
export function clearCache() {
  apiCache.clear();
}

// ─────────────────────────────────────────────────────────────
//  Mappers — backend (French) → app types (English)
// ─────────────────────────────────────────────────────────────
function mapFormation(raw: FormationRaw): Formation {
  return { id: raw.id, title: raw.titre, isActive: raw.isActive };
}

function mapModule(raw: ModuleRaw): Module {
  return {
    id: raw.id,
    formationId: raw.id_formation,
    title: raw.titre,
    subtitle: raw.sousTitre,
    text: raw.texte,
    video: raw.video,
    image: raw.image,
    order: raw.order ?? 0,
  };
}

function mapQuestion(raw: QuestionRaw): Question {
  return {
    text: raw.texte,
    answers: raw.reponses.map((r) => ({ text: r.texte, isCorrect: r.estCorrecte })),
  };
}

function mapQuizRaw(raw: QuizRaw): QuizDetails {
  return {
    id: raw.id,
    formationId: raw.id_formation,
    title: raw.titre,
    content: { questions: raw.contenu.questions.map(mapQuestion) },
    passThreshold: raw.passThreshold ?? 80,
  };
}

function quizDetailsToQuiz(qd: QuizDetails): Quiz {
  return {
    id: qd.id,
    title: qd.title,
    numberOfQuestions: qd.content.questions.length,
    questions: qd.content.questions,
    passThreshold: qd.passThreshold,
  };
}

// Reverse mappers: app → backend
function questionsToRaw(questions: Question[]): QuestionRaw[] {
  return questions.map((q) => ({
    texte: q.text,
    reponses: q.answers.map((a) => ({ texte: a.text, estCorrecte: a.isCorrect })),
  }));
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────
export async function Login({ email, password }: LoginCredentials): Promise<LoginResponse> {
  try {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    return { ok: true, token: data.token, user: data.user };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.message || "Erreur lors de la connexion" };
  }
}

export async function GetUserInfo(token: string): Promise<User> {
  const { data } = await axios.get(`${API_URL}/auth/me`, {
    headers: authHeader(token),
  });
  return data;
}

export async function Register({ email, password }: { email: string; password: string }): Promise<RegisterResponse> {
  try {
    const { data } = await axios.post(`${API_URL}/auth/register`, { email, password });
    return { ok: true, token: data.token, user: data.user };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.message || "Erreur lors de l'inscription" };
  }
}

// ─────────────────────────────────────────────────────────────
//  FORMATIONS
// ─────────────────────────────────────────────────────────────
type FormationField = "title" | "isActive";
const formationFieldMap: Record<FormationField, string> = { title: "titre", isActive: "isActive" };

export async function createFormation(title: string): Promise<ApiResult<Formation>> {
  try {
    const { data } = await axios.post(`${API_URL}/formations`, { titre: title });
    clearCache();
    return { ok: true, data: mapFormation(data) };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur création formation" };
  }
}

export async function updateFormation(id: number, field: FormationField, value: unknown): Promise<ApiResult<Formation>> {
  try {
    const { data } = await axios.put(`${API_URL}/formations/${id}`, { [formationFieldMap[field]]: value });
    clearCache();
    return { ok: true, data: mapFormation(data) };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur mise à jour formation" };
  }
}

export async function deleteFormation(id: number): Promise<ApiResult> {
  try {
    await axios.delete(`${API_URL}/formations/${id}`);
    clearCache();
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur suppression formation" };
  }
}

export async function GetAllFormations(): Promise<Formation[]> {
  const cached = fromCache<Formation[]>("formations");
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${API_URL}/formations`);
    const result = Array.isArray(data) ? data.map(mapFormation) : [];
    toCache("formations", result);
    return result;
  } catch { return []; }
}

export async function GetFormation(id: string): Promise<Formation> {
  const { data } = await axios.get(`${API_URL}/formations/${id}`);
  return mapFormation(data);
}

export async function GetFormationModules(id: string): Promise<Module[]> {
  const key = `modules-${id}`;
  const cached = fromCache<Module[]>(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(`${API_URL}/formations/${id}/modules`);
    const result = Array.isArray(data) ? data.map(mapModule) : [];
    toCache(key, result);
    return result;
  } catch { return []; }
}

export async function GetFormationQuiz(id: string): Promise<QuizDetails | null> {
  const key = `quiz-${id}`;
  const cached = fromCache<QuizDetails | null>(key);
  if (cached !== null) return cached;
  try {
    const { data } = await axios.get(`${API_URL}/formations/${id}/quizz`);
    const result = data ? mapQuizRaw(data as QuizRaw) : null;
    toCache(key, result);
    return result;
  } catch { return null; }
}

export async function GetInfoDashboardFormation(): Promise<InfoDashboard[]> {
  try {
    const formations = await GetAllFormations();
    return Promise.all(
      formations.map(async (f) => {
        const [modules, quiz] = await Promise.all([
          GetFormationModules(f.id.toString()),
          GetFormationQuiz(f.id.toString()),
        ]);
        return {
          id: f.id,
          title: f.title,
          nbModule: modules.length,
          nbQuestions: quiz?.content?.questions?.length ?? 0,
          isActive: f.isActive,
        };
      })
    );
  } catch { return []; }
}

export async function GetFormationDetails(id: string): Promise<Formation | null> {
  try {
    const [formation, modules, quizDetails] = await Promise.all([
      GetFormation(id),
      GetFormationModules(id),
      GetFormationQuiz(id),
    ]);
    return { ...formation, modules, quiz: quizDetails ? quizDetailsToQuiz(quizDetails) : null };
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────
//  MODULES
// ─────────────────────────────────────────────────────────────
interface ModulePayload {
  title: string;
  subtitle: string;
  text: string;
  video?: string | null;
  image?: string | null;
}

export async function createModule(formationId: number, payload: ModulePayload): Promise<ApiResult<Module>> {
  try {
    const { data } = await axios.post(`${API_URL}/modules`, {
      titre: payload.title,
      sousTitre: payload.subtitle,
      texte: payload.text,
      video: payload.video || null,
      image: payload.image || null,
      id_formation: formationId,
    });
    clearCache();
    return { ok: true, data: mapModule(data) };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur création module" };
  }
}

export async function deleteModule(moduleId: number): Promise<ApiResult> {
  try {
    await axios.delete(`${API_URL}/modules/${moduleId}`);
    clearCache();
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur suppression module" };
  }
}

export async function updateModule(moduleId: number, payload: ModulePayload): Promise<ApiResult<Module>> {
  try {
    const { data } = await axios.put(`${API_URL}/modules/${moduleId}`, {
      titre: payload.title,
      sousTitre: payload.subtitle,
      texte: payload.text,
      video: payload.video || null,
      image: payload.image || null,
    });
    clearCache();
    return { ok: true, data: mapModule(data) };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur mise à jour module" };
  }
}

export async function reorderModules(orderedIds: number[]): Promise<ApiResult> {
  try {
    await axios.put(`${API_URL}/modules/reorder`, { orderedIds });
    clearCache();
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur réorganisation modules" };
  }
}

// ─────────────────────────────────────────────────────────────
//  QUIZ
// ─────────────────────────────────────────────────────────────
export async function GetQuiz(formationId: string): Promise<QuizDetails | null> {
  try {
    const { data } = await axios.get(`${API_URL}/quizz/formation/${formationId}`);
    return data ? mapQuizRaw(data as QuizRaw) : null;
  } catch { return null; }
}

interface SaveQuizPayload {
  formationId: number | string;
  title: string;
  questions: Question[];
  passThreshold?: number;
}

export async function createQuiz(payload: SaveQuizPayload): Promise<ApiResult<QuizDetails>> {
  try {
    const { data } = await axios.post(`${API_URL}/quizz`, {
      id_formation: payload.formationId,
      titre: payload.title,
      contenu: { questions: questionsToRaw(payload.questions) },
      passThreshold: payload.passThreshold ?? 80,
    });
    clearCache();
    return { ok: true, data: mapQuizRaw(data as QuizRaw) };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur création quiz" };
  }
}

export async function updateQuiz(quizId: number, payload: SaveQuizPayload): Promise<ApiResult<QuizDetails>> {
  try {
    const { data } = await axios.put(`${API_URL}/quizz/${quizId}`, {
      id_formation: payload.formationId,
      titre: payload.title,
      contenu: { questions: questionsToRaw(payload.questions) },
      passThreshold: payload.passThreshold ?? 80,
    });
    clearCache();
    return { ok: true, data: mapQuizRaw(data as QuizRaw) };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur mise à jour quiz" };
  }
}

export async function submitQuiz(
  quizId: number,
  score: number,
  passed: boolean,
  token: string
): Promise<ApiResult<QuizAttempt>> {
  try {
    const { data } = await axios.post(
      `${API_URL}/quizz/${quizId}/submit`,
      { score, passed },
      { headers: authHeader(token) }
    );
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur soumission quiz" };
  }
}

export async function getMyAttempts(token: string): Promise<QuizAttempt[]> {
  try {
    const { data } = await axios.get(`${API_URL}/quizz/attempts/me`, {
      headers: authHeader(token),
    });
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

// ─────────────────────────────────────────────────────────────
//  PROGRESS
// ─────────────────────────────────────────────────────────────
export async function markModuleVisited(
  moduleId: number,
  formationId: number,
  token: string
): Promise<ApiResult> {
  try {
    await axios.post(
      `${API_URL}/progress`,
      { moduleId, formationId },
      { headers: authHeader(token) }
    );
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur progression" };
  }
}

export async function getMyProgress(token: string): Promise<ModuleProgress[]> {
  try {
    const { data } = await axios.get(`${API_URL}/progress/me`, {
      headers: authHeader(token),
    });
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

// ─────────────────────────────────────────────────────────────
//  USERS
// ─────────────────────────────────────────────────────────────
export async function GetUsers(): Promise<UserApi[]> {
  try {
    const { data } = await axios.get(`${API_URL}/users`);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function GetUser(id: number | string): Promise<UserApi | null> {
  try {
    const { data } = await axios.get(`${API_URL}/users/${id}`);
    return data ?? null;
  } catch { return null; }
}

export async function CreateUser(payload: {
  email: string;
  password: string;
  role: string;
}): Promise<ApiResult<UserApi>> {
  try {
    const { data } = await axios.post(`${API_URL}/users`, payload);
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, message: err.response?.data?.error || "Erreur création utilisateur" };
  }
}

export async function UpdateUser(
  id: number | string,
  payload: { email?: string; password?: string; role?: string }
): Promise<UserApi | null> {
  try {
    const { data } = await axios.put(`${API_URL}/users/${id}`, payload);
    return data ?? null;
  } catch { return null; }
}

export async function DeleteUser(id: number | string): Promise<boolean> {
  try {
    await axios.delete(`${API_URL}/users/${id}`);
    return true;
  } catch { return false; }
}
