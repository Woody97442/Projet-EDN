// ─────────────────────────────────────────────────────────────
//  Backend raw shapes — match API field names exactly
//  Used only inside Api.ts for mapping; never used in components
// ─────────────────────────────────────────────────────────────
interface FormationRaw {
  id: number;
  titre: string;
  isActive: boolean;
}

interface ModuleRaw {
  id: number;
  id_formation: number;
  titre: string;
  sousTitre: string;
  texte: string;
  video?: string | null;
  image?: string | null;
  order: number;
}

interface QuizRaw {
  id: number;
  id_formation: number;
  titre: string;
  contenu: { questions: QuestionRaw[] };
  passThreshold: number;
}

interface QuestionRaw {
  texte: string;
  reponses: AnswerRaw[];
}

interface AnswerRaw {
  texte: string;
  estCorrecte: boolean;
}

// ─────────────────────────────────────────────────────────────
//  App types — English field names
// ─────────────────────────────────────────────────────────────

interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
  badges?: Badge[];
}

interface UserApi {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

interface Badge {
  id?: string;
  title: string;
  score: number;
  tentative: number;
  validated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponseSuccess {
  ok: true;
  token: string;
  user: User;
}
interface LoginResponseFail {
  ok: false;
  message: string;
}
type LoginResponse = LoginResponseSuccess | LoginResponseFail;

interface RegisterResponseSuccess {
  ok: true;
  token: string;
  user: User;
}
interface RegisterResponseFail {
  ok: false;
  message: string;
}
type RegisterResponse = RegisterResponseSuccess | RegisterResponseFail;

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  text: string;
  answers: Answer[];
}

/** Simplified quiz used inside Formation */
interface Quiz {
  id: number;
  title: string;
  numberOfQuestions: number;
  questions: Question[];
  passThreshold: number;
}

/** Full quiz shape used in admin edit */
interface QuizDetails {
  id: number;
  formationId: number;
  title: string;
  content: { questions: Question[] };
  passThreshold: number;
}

interface Module {
  id: number;
  formationId: number;
  title: string;
  subtitle: string;
  text: string;
  video?: string | null;
  image?: string | null;
  order: number;
}

interface Formation {
  id: number;
  title: string;
  modules?: Module[];
  quiz?: Quiz | null;
  isActive: boolean;
}

interface InfoDashboard {
  id: number;
  title: string;
  nbModule: number;
  nbQuestions: number;
  isActive: boolean;
}

/** Quiz attempt from backend */
interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  formationId: number;
  score: number;
  passed: boolean;
  createdAt: string;
}

/** Module progress from backend */
interface ModuleProgress {
  id: number;
  userId: number;
  moduleId: number;
  formationId: number;
  viewedAt: string;
}

interface FormQuizProps {
  formation: Formation | null;
  quiz?: QuizDetails | null;
}

interface ApiResult<T = undefined> {
  ok: boolean;
  data?: T;
  message?: string;
}
