import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Banner from "@/components/banner/banner";
import { Separator } from "@/components/ui/separator";
import Badge from "@/components/succes/badge";
import { GetFormationDetails, submitQuiz } from "@/scripts/Api";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionResult {
  questionIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
  question: Question;
}

export default function QuizzPage() {
  const { formationId, quizzId } = useParams();
  const { token } = useAuth();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      if (!formationId || !quizzId) return;
      setLoading(true);
      try {
        const data = await GetFormationDetails(formationId);
        if (!data) { setLoading(false); return; }
        setFormation(data);
        if (data.quiz && data.quiz.id === Number(quizzId)) {
          setQuiz(data.quiz);
          const shuffled = [...data.quiz.questions].sort(() => 0.5 - Math.random());
          setSelectedQuestions(shuffled.slice(0, Math.min(data.quiz.numberOfQuestions, shuffled.length)));
        }
      } catch (err) {
        console.error("Erreur récupération quiz :", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [formationId, quizzId]);

  if (loading) return (
    <div className="p-10 max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-12 w-2/3" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
    </div>
  );
  if (!formation || !quiz) return <p className="p-4">Quizz introuvable 🚫</p>;

  const threshold = quiz.passThreshold ?? 80;

  const allAnswered = selectedQuestions.every((_, idx) => answers[idx] !== undefined);

  const computeScore = () => {
    let correct = 0;
    const res: QuestionResult[] = selectedQuestions.map((q, idx) => {
      const selected = answers[idx];
      const isCorrect = selected !== undefined && !!q.answers[selected]?.isCorrect;
      if (isCorrect) correct++;
      return { questionIndex: idx, selectedIndex: selected, isCorrect, question: q };
    });
    return { correct, res };
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    const { correct, res } = computeScore();
    const percent = Math.round((correct / selectedQuestions.length) * 100);
    const passed = percent >= threshold;
    setResults(res);
    setShowResult(true);

    // Save attempt to backend
    if (token) {
      await submitQuiz(quiz.id, percent, passed, token);
    }
    setSubmitting(false);
  };

  const score = results.filter(r => r.isCorrect).length;
  const percent = showResult && selectedQuestions.length > 0
    ? Math.round((score / selectedQuestions.length) * 100)
    : 0;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <Banner title={quiz.title} />

      {!showResult ? (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-gray-500">
            Seuil de réussite : {threshold}% · {selectedQuestions.length} questions
          </p>

          {selectedQuestions.map((q, index) => (
            <div key={index} className="p-4 border rounded bg-white shadow-sm">
              <h2 className="font-semibold mb-2">
                {index + 1}. {q.text}
              </h2>
              <Separator className="mb-3" />
              <div className="space-y-2">
                {q.answers.map((a, aIdx) => (
                  <label
                    key={aIdx}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                      answers[index] === aIdx ? "bg-blue-50 border border-blue-300" : "hover:bg-gray-50"
                    }`}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={answers[index] === aIdx}
                      onChange={() => setAnswers(prev => ({ ...prev, [index]: aIdx }))}
                    />
                    <span>{a.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className={`mt-6 px-6 py-2 text-white rounded transition-colors ${
              !allAnswered || submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }`}>
            {submitting ? "Enregistrement..." : "Valider le quiz"}
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Score summary */}
          <div className={`p-6 rounded text-center ${percent >= threshold ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <p className="text-3xl font-bold mb-1">{percent}%</p>
            <p className="text-sm text-gray-600">
              {score} / {selectedQuestions.length} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
            </p>
            {percent >= threshold ? (
              <p className="text-green-700 font-semibold mt-2">🎉 Félicitations, quiz réussi !</p>
            ) : (
              <p className="text-red-600 font-semibold mt-2">
                😔 Seuil requis : {threshold}%. Vous pouvez réessayer.
              </p>
            )}
          </div>

          {/* Badge on success */}
          {percent >= threshold && (
            <div className="flex flex-col items-center mt-4">
              <Badge formationTitle={formation.title} score={percent} />
            </div>
          )}

          {/* Per-question feedback */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Correction détaillée</h3>
            {results.map((r, idx) => (
              <div
                key={idx}
                className={`p-4 rounded border ${r.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <p className="font-semibold mb-2">
                  {idx + 1}. {r.question.text}
                  <span className="ml-2 text-sm">{r.isCorrect ? "✅" : "❌"}</span>
                </p>
                <div className="space-y-1">
                  {r.question.answers.map((a, aIdx) => {
                    const wasSelected = r.selectedIndex === aIdx;
                    const isCorrectAnswer = a.isCorrect;
                    let cls = "text-gray-700";
                    if (isCorrectAnswer) cls = "text-green-700 font-semibold";
                    else if (wasSelected && !isCorrectAnswer) cls = "text-red-600 line-through";
                    return (
                      <p key={aIdx} className={cls}>
                        {wasSelected ? "→ " : "  "}{a.text}
                        {isCorrectAnswer ? " ✓" : ""}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
