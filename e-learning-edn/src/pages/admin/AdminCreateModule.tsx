"use client";

import Banner from "@/components/banner/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

interface ModuleContent {
  id: number;
  subtitle: string;
  text: string;
}

interface Module {
  id: number;
  title: string;
  position: number;
  href: string;
  urlIllustration: string;
  content: ModuleContent[];
}

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

export default function AdminCreateModule() {
  // ---------- STATES ----------
  const [modules, setModules] = useState<Module[]>([
    {
      id: 1,
      title: "Introduction au Big Data",
      position: 1,
      href: "",
      urlIllustration: "",
      content: [{ id: 1, subtitle: "Intro", text: "Contenu initial..." }],
    },
  ]);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      question: "Exemple de question ?",
      answers: [
        { id: 1, text: "Réponse 1", isCorrect: false },
        { id: 2, text: "Réponse 2", isCorrect: true },
      ],
    },
  ]);

  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(
    null
  );
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);

  // ---------- UTILS ----------
  const updateModules = (fn: (copy: Module[]) => void) => {
    setModules((prev) => {
      const copy = structuredClone(prev);
      fn(copy);
      return copy;
    });
  };

  const updateQuestions = (fn: (copy: Question[]) => void) => {
    setQuestions((prev) => {
      const copy = structuredClone(prev);
      fn(copy);
      return copy;
    });
  };

  // ---------- MODULES ----------
  const handleAddModule = () => {
    updateModules((mods) => {
      const nextId = mods.length ? Math.max(...mods.map((m) => m.id)) + 1 : 1;
      mods.push({
        id: nextId,
        title: "Nouveau module",
        position: mods.length + 1,
        href: "",
        urlIllustration: "",
        content: [{ id: 1, subtitle: "", text: "" }],
      });
      setEditingModuleIndex(mods.length - 1);
    });
  };

  const handleChangeModule = (
    field: keyof Module,
    value: string,
    contentIndex?: number
  ) => {
    if (editingModuleIndex === null) return;
    updateModules((mods) => {
      const current = mods[editingModuleIndex];
      if (
        field === "title" ||
        field === "href" ||
        field === "urlIllustration"
      ) {
        current[field] = value;
      } else if (field === "content" && contentIndex !== undefined) {
        current.content[contentIndex] = {
          ...current.content[contentIndex],
          ...JSON.parse(value),
        };
      }
    });
  };

  const handleAddContent = () => {
    if (editingModuleIndex === null) return;
    updateModules((mods) => {
      const current = mods[editingModuleIndex];
      const nextId = current.content.length
        ? Math.max(...current.content.map((c) => c.id)) + 1
        : 1;
      current.content.push({ id: nextId, subtitle: "", text: "" });
    });
  };

  const handleRemoveContent = (contentIndex: number) => {
    if (editingModuleIndex === null) return;
    updateModules((mods) => {
      mods[editingModuleIndex].content = mods[
        editingModuleIndex
      ].content.filter((_, i) => i !== contentIndex);
    });
  };

  // ---------- QUESTIONS ----------
  const handleAddQuestion = () => {
    updateQuestions((qs) => {
      const nextId = qs.length ? Math.max(...qs.map((q) => q.id)) + 1 : 1;
      qs.push({
        id: nextId,
        question: "",
        answers: [{ id: 1, text: "", isCorrect: false }],
      });
      setEditingQuestionIndex(qs.length - 1);
    });
  };

  const handleChangeQuestion = (value: string) => {
    if (editingQuestionIndex === null) return;
    updateQuestions((qs) => {
      qs[editingQuestionIndex].question = value;
    });
  };

  const handleAddAnswer = () => {
    if (editingQuestionIndex === null) return;
    updateQuestions((qs) => {
      const current = qs[editingQuestionIndex];
      const nextId = current.answers.length
        ? Math.max(...current.answers.map((a) => a.id)) + 1
        : 1;
      current.answers.push({ id: nextId, text: "", isCorrect: false });
    });
  };

  const handleChangeAnswer = (text: string, answerIndex: number) => {
    if (editingQuestionIndex === null) return;
    updateQuestions((qs) => {
      qs[editingQuestionIndex].answers[answerIndex].text = text;
    });
  };

  const handleSetCorrectAnswer = (answerIndex: number) => {
    if (editingQuestionIndex === null) return;
    updateQuestions((qs) => {
      qs[editingQuestionIndex].answers = qs[editingQuestionIndex].answers.map(
        (a, idx) => ({
          ...a,
          isCorrect: idx === answerIndex,
        })
      );
    });
  };

  const handleRemoveAnswer = (answerIndex: number) => {
    if (editingQuestionIndex === null) return;
    updateQuestions((qs) => {
      qs[editingQuestionIndex].answers = qs[
        editingQuestionIndex
      ].answers.filter((_, idx) => idx !== answerIndex);
    });
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    updateQuestions((qs) => {
      qs.splice(questionIndex, 1);
    });
    if (editingQuestionIndex === questionIndex) setEditingQuestionIndex(null);
  };

  // ---------- SAVE FORMATION ----------
  const handleSaveFormation = async () => {
    const formation = {
      title: "Titre exemple", // tu pourras relier avec l’input Nom de la formation
      description: "Description exemple", // idem
      modules,
      questions,
    };

    console.log("Formation envoyée :", formation);

    // Exemple d’appel backend
    // await fetch("/api/formations", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(formation),
    // });
  };

  // ---------- RENDER ----------
  return (
    <div className="p-6">
      <Banner title="Création ou modification de formation" />

      {/* --- Infos Formation --- */}
      <div className="flex flex-col gap-6 m-4">
        <p className="my-2 text-xs">
          Bienvenue sur la page de création et modification de formation !
        </p>

        <h2 className="text-xl font-bold">Information de la formation :</h2>
        <div className="flex flex-row gap-4 justify-between">
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label>Nom de la formation</Label>
            <Input
              placeholder="La cybersécurité"
              className="border-none bg-gray-100 rounded-none"
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label>Description courte</Label>
            <Input
              placeholder="Sensibilisation aux attaques de phishing..."
              className="border-none bg-gray-100 rounded-none"
            />
          </div>
        </div>

        {/* --- Modules --- */}
        <div className="flex flex-col gap-4 my-4">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-bold">Liste des Modules :</h2>
            <Button
              variant="edn_hover"
              onClick={handleAddModule}>
              <FaPlus className="inline mr-2" /> Ajouter un module
            </Button>
          </div>

          {/* Liste */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="edn-degraded text-white text-left">
                <tr>
                  <th className="px-4 py-2 text-center">Position</th>
                  <th className="px-4 py-2">Titre</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {modules.map((mod, idx) => (
                  <tr
                    key={mod.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2 text-center">{mod.position}</td>
                    <td className="px-4 py-2">{mod.title}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <FaEdit
                        className="inline cursor-pointer text-blue-500 hover:text-blue-700"
                        onClick={() => setEditingModuleIndex(idx)}
                      />
                      <FaTrash className="inline cursor-pointer text-red-500 hover:text-red-700" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edition d'un module */}
          {editingModuleIndex !== null && (
            <div className="mt-6 p-4">
              <h2 className="text-xl font-bold mb-4">
                Édition du module : {modules[editingModuleIndex].title}
              </h2>

              {/* Inputs */}
              <div className="flex flex-row gap-4 justify-between my-4">
                <div className="grid w-full max-w-sm items-center gap-3">
                  <Label>Titre du module</Label>
                  <Input
                    type="text"
                    value={modules[editingModuleIndex].title}
                    onChange={(e) =>
                      handleChangeModule("title", e.target.value)
                    }
                    className="border-none bg-gray-100 rounded-none"
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-3">
                  <Label>URL illustration</Label>
                  <Input
                    type="text"
                    value={modules[editingModuleIndex].urlIllustration}
                    onChange={(e) =>
                      handleChangeModule("urlIllustration", e.target.value)
                    }
                    className="border-none bg-gray-100 rounded-none"
                  />
                </div>
              </div>

              {/* Contenus */}
              <div className="grid w-full gap-3 mb-4">
                <Label>Contenus du module</Label>
                {modules[editingModuleIndex].content.map((item, idx) => (
                  <div
                    key={item.id}
                    className="mb-2 border p-2 grid w-full gap-3 relative">
                    <Button
                      variant="ghost"
                      className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveContent(idx)}>
                      X
                    </Button>
                    <Label>Sous-titre</Label>
                    <Input
                      type="text"
                      value={item.subtitle}
                      onChange={(e) =>
                        handleChangeModule(
                          "content",
                          JSON.stringify({ subtitle: e.target.value }),
                          idx
                        )
                      }
                      className="border-none bg-gray-100 rounded-none"
                    />
                    <Label>Texte</Label>
                    <Textarea
                      value={item.text}
                      placeholder="Texte du module..."
                      onChange={(e) =>
                        handleChangeModule(
                          "content",
                          JSON.stringify({ text: e.target.value }),
                          idx
                        )
                      }
                      className="border-none bg-gray-100 rounded-none"
                    />
                  </div>
                ))}
                <Button
                  variant="edn_hover"
                  className="mt-2"
                  onClick={handleAddContent}>
                  <FaPlus className="inline mr-2" /> Ajouter un contenu
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* --- Questions --- */}
        <div className="flex flex-col gap-4 my-4">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-bold">Liste des questions :</h2>
            <Button
              variant="edn_hover"
              onClick={handleAddQuestion}>
              <FaPlus className="inline mr-2" /> Ajouter une question
            </Button>
          </div>

          {/* Liste */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="edn-degraded text-white text-left">
                <tr>
                  <th className="px-4 py-2 text-center">Question</th>
                  <th className="px-4 py-2 text-center">Nb réponses</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {questions.map((q, idx) => (
                  <tr
                    key={q.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2">
                      {q.question || "Nouvelle question"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {q.answers.length}
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <FaEdit
                        className="inline cursor-pointer text-blue-500 hover:text-blue-700"
                        onClick={() => setEditingQuestionIndex(idx)}
                      />
                      <FaTrash
                        className="inline cursor-pointer text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveQuestion(idx)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edition d'une question */}
          {editingQuestionIndex !== null && (
            <div className="mt-6 ">
              <h2 className="text-xl font-bold mb-4">
                Édition de la question :
              </h2>
              <div className="mb-4">
                <Input
                  type="text"
                  value={questions[editingQuestionIndex].question}
                  onChange={(e) => handleChangeQuestion(e.target.value)}
                  placeholder="Texte de la question..."
                  className="border-none bg-gray-100 rounded-none w-full"
                />
              </div>

              {/* Réponses */}
              <div className="flex flex-row items-center justify-between mb-2 pt-2">
                <h3 className="font-semibold">Réponses :</h3>
                <Button
                  variant="edn_hover"
                  onClick={handleAddAnswer}>
                  <FaPlus className="inline mr-2" /> Ajouter une réponse
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead className="edn-degraded text-white text-left">
                    <tr>
                      <th className="px-4 py-2 text-center">Réponse</th>
                      <th className="px-4 py-2 text-center">Correct</th>
                      <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {questions[editingQuestionIndex].answers.map((a, idx) => (
                      <tr
                        key={a.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-2">
                          <Input
                            type="text"
                            value={a.text}
                            onChange={(e) =>
                              handleChangeAnswer(e.target.value, idx)
                            }
                            className="border-none bg-gray-100 rounded-none w-full"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="radio"
                            name={`correct-${questions[editingQuestionIndex].id}`}
                            checked={a.isCorrect}
                            onChange={() => handleSetCorrectAnswer(idx)}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <FaTrash
                            className="inline cursor-pointer text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveAnswer(idx)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* --- Bouton final --- */}
          <div className="flex justify-end ">
            <Button
              variant="edn_hover"
              size="lg"
              onClick={handleSaveFormation}>
              Enregistrer la formation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
