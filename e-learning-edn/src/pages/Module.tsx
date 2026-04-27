import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Banner from "@/components/banner/banner";
import { GetFormationDetails, markModuleVisited } from "@/scripts/Api";
import { getYouTubeEmbedUrl } from "@/scripts/tools";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModulePage() {
  const { formationId, moduleId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModule() {
      if (!formationId || !moduleId) return;
      setLoading(true);
      try {
        const data = await GetFormationDetails(formationId);
        setFormation(data);
        const found = data?.modules?.find((m) => m.id === Number(moduleId)) ?? null;
        setModule(found);

        // Mark as visited
        if (found && token) {
          markModuleVisited(found.id, Number(formationId), token);
        }
      } catch (err) {
        console.error("Erreur récupération module :", err);
        setModule(null);
        setFormation(null);
      } finally {
        setLoading(false);
      }
    }
    fetchModule();
  }, [formationId, moduleId, token]);

  if (loading) return (
    <div className="p-10 max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
  if (!formation || !module) return <p className="p-4">Module introuvable 🚫</p>;

  const currentIndex = formation.modules?.findIndex((m) => m.id === module.id) ?? 0;
  const isLastModule = formation.modules ? currentIndex === formation.modules.length - 1 : true;

  const handleNext = () => {
    if (!isLastModule && formation.modules) {
      const next = formation.modules[currentIndex + 1];
      navigate(`/formation/${formation.id}/module/${next.id}`);
    } else if (formation.quiz) {
      navigate(`/formation/${formation.id}/quizz/${formation.quiz.id}`);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto relative">
      <Banner title={`${formation.title} - ${module.title}`} />

      {/* Progress indicator */}
      {formation.modules && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / formation.modules.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {currentIndex + 1} / {formation.modules.length}
          </span>
        </div>
      )}

      {module.image && (
        <div className="mt-6 flex justify-center">
          <img src={module.image} alt={module.subtitle} className="max-w-full h-auto" />
        </div>
      )}

      {module.video && (
        <div className="mt-6 flex justify-center">
          <iframe
            width="100%"
            height={400}
            src={getYouTubeEmbedUrl(module.video)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}

      {module.text && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">{module.subtitle}</h2>
          <p className="text-gray-700 whitespace-pre-line">{module.text}</p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer">
          {isLastModule ? (formation.quiz ? "Passer au Quizz" : "Fin de la formation") : "Module suivant"}
        </button>
      </div>
    </div>
  );
}
