"use client";
import FormFormation from "@/components/edit-template/form-formation";
import FormModule from "@/components/edit-template/form-module";
import FormQuizz from "@/components/edit-template/form-quizz";
import HeaderEditFormation from "@/components/edit-template/Header-edit-formation";
import { GetFormation, GetFormationModules, GetQuiz } from "@/scripts/Api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AdminEditFormation() {
  const { id } = useParams();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [quiz, setQuiz] = useState<QuizDetails | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const [formationRes, modulesRes, quizRes] = await Promise.all([
          GetFormation(id as string),
          GetFormationModules(id as string),
          GetQuiz(id as string),
        ]);
        setFormation(formationRes);
        setModules(modulesRes);
        setQuiz(quizRes);
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
      }
    }
    fetchData();
  }, [id]);

  return (
    <div className="p-6">
      <HeaderEditFormation title={formation?.title} />
      <div className="flex flex-col gap-6 my-8 mx-4">
        <FormFormation formation={formation} setFormation={setFormation} />
      </div>
      <FormModule modules={modules} setModules={setModules} formation={formation} />
      <FormQuizz formation={formation} quiz={quiz} />
    </div>
  );
}
