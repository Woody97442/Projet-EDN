"use client";

import Banner from "@/components/banner/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFormation } from "@/scripts/Api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminCreateFormation() {
  // ---------- STATES ----------
  const [titleFormation, setTitleFormation] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  // ---------- SAVE FORMATION ----------
  const handleSaveFormation = async () => {
    setMessage("");
    setSuccess(false);
    if (!titleFormation) {
      setMessage("Veuillez renseigner le titre de la formation");
      return;
    }

    try {
      const res = await createFormation(titleFormation);

      if (res.ok && res.data) {
        setSuccess(true);
        navigate(`/admin/formation/${res.data.id}/edit`);
      } else {
        setMessage(res.message || "Erreur lors de la création de la formation");
      }
    } catch (error) {
      setMessage("Erreur inattendue lors de la création de la formation");
    }
  };

  // ---------- RENDER ----------  //
  return (
    <div className="p-6">
      <Banner title="Création d'une nouvelle formation" />

      {/* --- Infos Formation --- */}
      <div className="flex flex-col gap-6 m-4">
        <p className="my-2 text-sm">
          Bienvenue sur la page de création d'une formation !
        </p>

        <h2 className="text-xl font-bold">Information de la formation :</h2>
        <div className="flex flex-row gap-4 justify-between">
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label>Nom de la formation</Label>
            {message && !success && (
              <div className="text-sm text-red-500 p-1 text-center bg-red-100">
                {message}
              </div>
            )}
            <Input
              placeholder="La cybersécurité"
              className="border-none bg-gray-100 rounded-none"
              value={titleFormation}
              onChange={(e) => setTitleFormation(e.target.value)}
            />
          </div>
        </div>
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
  );
}
