"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateFormation } from "@/scripts/Api";
import type { Dispatch, SetStateAction } from "react";

interface FormFormationProps {
  formation: Formation | null;
  setFormation: Dispatch<SetStateAction<Formation | null>>;
}

export default function FormFormation({ formation, setFormation }: FormFormationProps) {
  const handleUpdate = async (field: "title" | "isActive", value: unknown) => {
    if (!formation) return;
    const res = await updateFormation(formation.id, field, value);
    if (res.ok) {
      setFormation((prev) => (prev ? { ...prev, [field]: value } : prev));
    } else {
      console.error("updateFormation:", res.message);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormation((prev) => (prev ? { ...prev, title: newTitle } : prev));
    handleUpdate("title", newTitle);
  };

  if (!formation) return <p>Aucune formation sélectionnée</p>;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-sm">
        <Label className="whitespace-nowrap">Formation :</Label>
        <Input
          value={formation.title}
          onChange={handleTitleChange}
          className="flex-1 border-none bg-gray-100 rounded-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Activé</span>
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={formation.isActive}
            onChange={() => handleUpdate("isActive", !formation.isActive)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal-400 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
        </label>
      </div>
    </div>
  );
}
