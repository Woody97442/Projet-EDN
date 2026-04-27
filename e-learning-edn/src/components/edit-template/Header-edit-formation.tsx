"use client";

import Banner from "@/components/banner/banner";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function HeaderEditFormation({ title }: { title?: string }) {
  const navigate = useNavigate();

  return (
    <>
      <Banner title={`Formation ${title ?? ""}`} />
      <div className="flex items-center gap-2 my-6 text-xs">
        <Button
          variant="edn_hover"
          onClick={() => navigate("/admin/formations")}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-600 active:scale-95 transition">
          <FaArrowLeft className="w-4 h-4" />
        </Button>
        <p className="text-gray-600 font-bold text-sm">
          Bienvenue sur la page d'édition de la formation !
        </p>
      </div>
    </>
  );
}
