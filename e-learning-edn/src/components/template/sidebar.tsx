"use client";

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { GetAllFormations, GetFormationModules, getMyProgress } from "@/scripts/Api";
import { useAuth } from "@/context/AuthContext";
import { FaCheck } from "react-icons/fa";

export default function Sidebar() {
  const { user, token, logout } = useAuth();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [visitedModuleIds, setVisitedModuleIds] = useState<Set<number>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const list = await GetAllFormations();
        const withModules = await Promise.all(
          list.map(async (f) => ({ ...f, modules: await GetFormationModules(f.id.toString()) }))
        );
        setFormations(withModules);
      } catch (err) {
        console.error("Erreur chargement formations:", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!token) return;
    getMyProgress(token).then(progress => {
      setVisitedModuleIds(new Set(progress.map(p => p.moduleId)));
    });
  }, [token, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Progress computation per formation
  const getFormationProgress = (formation: Formation) => {
    const total = formation.modules?.length ?? 0;
    if (total === 0) return 0;
    const visited = formation.modules?.filter(m => visitedModuleIds.has(m.id)).length ?? 0;
    return Math.round((visited / total) * 100);
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)]">
      {/* Hamburger button (mobile only) */}
      <Button
        className="md:hidden m-2 fixed top-20 -left-6 z-40"
        onClick={() => setIsOpen(!isOpen)}>
        <span className="text-xl font-bold translate-x-2">{">"}</span>
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r transform transition-transform duration-300 z-50 md:z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:relative md:h-auto md:flex md:flex-col md:w-56`}>
        <div className="p-4">
          <h2 className="text-lg text-center font-semibold edn-color-primary">Formations</h2>
          <Separator className="mt-2" />
        </div>

        <ScrollArea className="flex-1 px-2">
          <Accordion type="single" collapsible className="w-full">
            {formations.filter(f => f.isActive).map(formation => {
              const progress = getFormationProgress(formation);
              return (
                <AccordionItem key={formation.id} value={String(formation.id)} className="border-none py-1">
                  <AccordionTrigger className="edn-color-primary cursor-pointer bg-gray-100 rounded-none px-2 py-2 text-sm hover:no-underline">
                    <div className="flex flex-col items-start w-full gap-1">
                      <span>{formation.title}</span>
                      {progress > 0 && (
                        <div className="w-full bg-gray-300 rounded-full h-1">
                          <div
                            className="bg-teal-400 h-1 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <nav className="pl-2 space-y-1 edn-color-primary my-2">
                      {formation.modules?.map(module => {
                        const link = `/formation/${formation.id}/module/${module.id}`;
                        const active = location.pathname === link;
                        const visited = visitedModuleIds.has(module.id);
                        return (
                          <Link
                            key={module.id}
                            to={link}
                            className={`flex items-center justify-between rounded-none px-2 py-2 text-sm edn-color-primary hover:underline ${active ? "bg-gray-100 font-medium" : ""}`}>
                            <span>{module.title}</span>
                            {visited && <FaCheck className="text-teal-500 text-xs shrink-0" />}
                          </Link>
                        );
                      })}
                    </nav>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>

        {/* Fixed bottom area */}
        <div className="flex flex-col border-t p-4 space-y-2 fixed bottom-0 w-full bg-white">
          {user?.role === "admin" ? (
            <>
              <Link to="/admin/dashboard" className="edn-color-primary cursor-pointer bg-gray-100 rounded-none px-2 py-2 text-sm hover:no-underline">
                Tableau de bord
              </Link>
              <Link to="/admin/formations" className="edn-color-primary cursor-pointer bg-gray-100 rounded-none px-2 py-2 text-sm hover:no-underline">
                Les Formations
              </Link>
            </>
          ) : (
            <Link to="/mes-badges" className="edn-color-primary cursor-pointer bg-gray-100 rounded-none px-2 py-2 text-sm hover:no-underline">
              Mes Badges
            </Link>
          )}

          {/* Logout with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="edn_hover" className="cursor-pointer w-full">
                Déconnexion
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous serez redirigé vers la page de connexion.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Se déconnecter
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
        )}
        <Outlet />
      </main>
    </div>
  );
}
