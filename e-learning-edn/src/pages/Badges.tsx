import { useAuth } from "@/context/AuthContext";
import Banner from "@/components/banner/banner";
import Badge from "@/components/succes/badge";
import { getMyAttempts, GetAllFormations } from "@/scripts/Api";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AttemptWithFormation extends QuizAttempt {
  formationTitle: string;
}

export default function BadgesPage() {
  const { user, token } = useAuth();
  const [attempts, setAttempts] = useState<AttemptWithFormation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    async function load() {
      try {
        const [rawAttempts, formations] = await Promise.all([
          getMyAttempts(token!),
          GetAllFormations(),
        ]);
        const formationMap = Object.fromEntries(formations.map(f => [f.id, f.title]));
        setAttempts(
          rawAttempts.map(a => ({
            ...a,
            formationTitle: formationMap[a.formationId] ?? `Formation #${a.formationId}`,
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const passedAttempts = attempts.filter(a => a.passed);
  // Best score per formation (for badges display)
  const bestByFormation = Object.values(
    passedAttempts.reduce<Record<number, AttemptWithFormation>>((acc, a) => {
      if (!acc[a.formationId] || a.score > acc[a.formationId].score) acc[a.formationId] = a;
      return acc;
    }, {})
  );

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-12 w-1/3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <Banner title="Mes badges & historique" />

      {/* Badges earned */}
      <section className="mt-6">
        <h2 className="text-xl font-bold mb-4">
          Badges obtenus ({bestByFormation.length})
        </h2>
        {bestByFormation.length === 0 ? (
          <p className="text-gray-500">Aucun badge obtenu pour le moment. Complétez un quiz avec {user?.role === "admin" ? "100" : "80"}% ou plus !</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
            {bestByFormation.map(a => (
              <li key={a.formationId} className="flex justify-center">
                <Badge formationTitle={a.formationTitle} score={a.score} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Full history */}
      {attempts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Historique des tentatives</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="edn-degraded text-white text-left">
                <tr>
                  <th className="px-4 py-2">Formation</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Résultat</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {attempts.map((a, idx) => (
                  <tr key={a.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2">{a.formationTitle}</td>
                    <td className="px-4 py-2 font-semibold">{a.score}%</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${a.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {a.passed ? "Réussi" : "Échoué"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
