"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Banner from "../banner/banner";
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { createQuiz, updateQuiz } from "@/scripts/Api";

export default function FormQuizz({ formation, quiz }: FormQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expanded, setExpanded] = useState<boolean[]>([]);
  const [passThreshold, setPassThreshold] = useState<number>(80);
  const [error, setError] = useState<string | null>(null);
  const [localQuiz, setLocalQuiz] = useState<QuizDetails | null>(quiz ?? null);

  useEffect(() => {
    setLocalQuiz(quiz ?? null);
    if (quiz) {
      setPassThreshold(quiz.passThreshold ?? 80);
      if (quiz.content?.questions?.length) {
        setQuestions(quiz.content.questions);
        setExpanded(quiz.content.questions.map(() => false));
      }
    }
  }, [quiz]);

  const toggleQuestion = (i: number) =>
    setExpanded(prev => prev.map((v, idx) => (idx === i ? !v : v)));

  const addQuestion = () => {
    setQuestions(prev => [...prev, { text: "", answers: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] }]);
    setExpanded(prev => [...prev, true]);
  };

  const updateQText = (qIdx: number, v: string) =>
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, text: v } : q));

  const addAnswer = (qIdx: number) =>
    setQuestions(prev => prev.map((q, i) =>
      i === qIdx && q.answers.length < 4 ? { ...q, answers: [...q.answers, { text: "", isCorrect: false }] } : q));

  const updateAText = (qIdx: number, aIdx: number, v: string) =>
    setQuestions(prev => prev.map((q, i) =>
      i === qIdx ? { ...q, answers: q.answers.map((a, j) => j === aIdx ? { ...a, text: v } : a) } : q));

  const setCorrect = (qIdx: number, aIdx: number) =>
    setQuestions(prev => prev.map((q, i) =>
      i === qIdx ? { ...q, answers: q.answers.map((a, j) => ({ ...a, isCorrect: j === aIdx })) } : q));

  const deleteQuestion = (qIdx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== qIdx));
    setExpanded(prev => prev.filter((_, i) => i !== qIdx));
  };

  const deleteAnswer = (qIdx: number, aIdx: number) =>
    setQuestions(prev => prev.map((q, i) =>
      i === qIdx ? { ...q, answers: q.answers.filter((_, j) => j !== aIdx) } : q));

  const handleSubmit = async () => {
    if (!formation) return alert("Aucune formation sélectionnée");
    if (questions.length === 0) return alert("Ajoute au moins une question");
    for (const q of questions) {
      if (!q.text.trim()) { setError("Chaque question doit avoir un intitulé"); return; }
      if (!q.answers.some(a => a.isCorrect)) { setError("Chaque question doit avoir une réponse correcte"); return; }
    }
    setError(null);

    const payload = {
      formationId: formation.id,
      title: `${formation.title} - Quiz`,
      questions,
      passThreshold,
    };

    const res = localQuiz ? await updateQuiz(localQuiz.id, payload) : await createQuiz(payload);
    if (res.ok) {
      if (res.data) setLocalQuiz(res.data);
      alert("Quiz enregistré avec succès !");
    } else {
      alert(res.message || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <>
      <Banner title="Quizz" />
      <div className="flex flex-col gap-6 my-8 mx-2">
        {/* Pass threshold setting */}
        <div className="flex items-center gap-4 bg-blue-50 p-4 rounded border border-blue-100">
          <Label className="whitespace-nowrap font-semibold">Seuil de réussite :</Label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={passThreshold}
              onChange={e => setPassThreshold(Number(e.target.value))}
              className="w-32 cursor-pointer"
            />
            <span className="text-lg font-bold w-12 text-center">{passThreshold}%</span>
          </div>
          <p className="text-xs text-gray-500">L'apprenant doit obtenir au moins {passThreshold}% pour valider ce quiz.</p>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-gray-50 overflow-hidden rounded border">
            <div
              className="flex justify-between items-center p-4 cursor-pointer bg-gray-100 hover:bg-gray-200"
              onClick={() => toggleQuestion(qIdx)}>
              <Label className="font-bold cursor-pointer">Question {qIdx + 1}</Label>
              {expanded[qIdx] ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {expanded[qIdx] && (
              <div className="p-4">
                <Input
                  value={q.text}
                  onChange={e => updateQText(qIdx, e.target.value)}
                  placeholder="Texte de la question"
                  className="mb-3 bg-white rounded-none shadow-none border-0"
                />
                <div className="flex flex-col w-full gap-2">
                  {q.answers.map((a, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${qIdx}`} checked={a.isCorrect}
                        onChange={() => setCorrect(qIdx, aIdx)} />
                      <Input
                        value={a.text}
                        onChange={e => updateAText(qIdx, aIdx, e.target.value)}
                        placeholder={`Réponse ${aIdx + 1}`}
                        className="flex-1 bg-white rounded-none shadow-none border-0"
                      />
                      {q.answers.length > 2 && (
                        <FaTrash className="text-red-500 cursor-pointer hover:text-red-700"
                          onClick={() => deleteAnswer(qIdx, aIdx)} />
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    {q.answers.length < 4 && (
                      <Button type="button" variant="edn_hover" size="sm" className="mt-2 border-0"
                        onClick={() => addAnswer(qIdx)}>
                        <FaPlus className="mr-1" /> Ajouter une réponse
                      </Button>
                    )}
                    <Button type="button" variant="destructive" size="sm" className="mt-3 ml-auto"
                      onClick={() => deleteQuestion(qIdx)}>
                      Supprimer la question
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-between items-center mt-4">
          <Button type="button" variant="edn_hover" onClick={addQuestion} className="inline-flex items-center w-fit">
            <FaPlus className="mr-1" /> Ajouter une question
          </Button>
          {questions.length > 0 && (
            <Button type="button" variant="edn_hover" className="inline-flex items-center" onClick={handleSubmit}>
              Enregistrer le Quizz
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
