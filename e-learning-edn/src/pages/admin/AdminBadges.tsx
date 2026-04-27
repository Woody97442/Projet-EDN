import { useAuth } from "@/context/AuthContext";

export default function AdminBadges() {
  const { user } = useAuth();

  if (!user) return <p>Chargement...</p>;

  return (
    <div className="p-4 items-center flex flex-col">
      <img
        src="/EDN_logo-CMJN-bleu-vertical.jpg"
        alt="EDN - Ecole Du Numérique"
        className="max-w-xs"
      />
      <span className="text-xs text-center">
        Retrouvez les formations disponibles dans le menu à votre gauche.
      </span>
    </div>
  );
}
