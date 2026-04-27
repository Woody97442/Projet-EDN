import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <p className="p-4">Chargement...</p>;

  return (
    <div className="p-4 items-center flex flex-col h-full justify-center">
      <img
        src="/EDN_logo-CMJN-bleu-vertical.jpg"
        alt="EDN - Ecole Du Numérique"
        className="max-w-xs"
      />
      <span className="text-md text-center">
        Retrouvez les formations disponibles dans le menu à votre gauche.
      </span>
    </div>
  );
}
