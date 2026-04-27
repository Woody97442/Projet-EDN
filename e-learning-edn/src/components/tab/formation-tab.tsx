"use client";

import { deleteFormation, GetInfoDashboardFormation, updateFormation } from "@/scripts/Api";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { SkeletonTableRow } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

export default function FormationTab() {
  const navigate = useNavigate();
  const [formations, setFormations] = useState<InfoDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    GetInfoDashboardFormation()
      .then(setFormations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...formations].sort((a, b) => a.id - b.id);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleActive = async (formation: InfoDashboard) => {
    const res = await updateFormation(formation.id, "isActive", !formation.isActive);
    if (res.ok) {
      setFormations(prev => prev.map(f => f.id === formation.id ? { ...f, isActive: !f.isActive } : f));
    }
  };

  const handleDelete = (idFormation: number) => {
    setFormations(prev => {
      const backup = [...prev];
      const updated = prev.filter(f => f.id !== idFormation);
      deleteFormation(idFormation).then(res => {
        if (!res.ok) {
          setFormations(backup);
          alert(res.message || "Erreur lors de la suppression");
        }
      });
      return updated;
    });
    if (page > Math.ceil((formations.length - 1) / PAGE_SIZE)) setPage(p => Math.max(1, p - 1));
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="edn-degraded text-white text-left">
            <tr>
              <th className="px-4 py-2">Formations</th>
              <th className="px-4 py-2">Modules</th>
              <th className="px-4 py-2">Questions</th>
              <th className="px-4 py-2">Actif</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
              : paginated.map((formation, idx) => (
                <tr key={formation.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2">{formation.title}</td>
                  <td className="px-4 py-2">{formation.nbModule}</td>
                  <td className="px-4 py-2">{formation.nbQuestions}</td>
                  <td className="px-4 py-2">
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formation.isActive}
                        onChange={() => toggleActive(formation)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal-400 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <FaEdit onClick={() => navigate(`/admin/formation/${formation.id}/edit`)}
                      className="inline cursor-pointer text-blue-500 hover:text-blue-700" />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <FaTrash className="inline cursor-pointer text-red-500 hover:text-red-700" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la formation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Supprimer{" "}
                            <span className="font-semibold">{formation.title}</span> ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(formation.id)}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, formations.length)} sur {formations.length}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-50">
              <FaChevronLeft className="text-xs" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-3 py-1 rounded border text-xs ${p === page ? "bg-gray-200 font-bold" : "hover:bg-gray-50"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-50">
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
