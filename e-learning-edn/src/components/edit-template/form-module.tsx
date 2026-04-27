"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type Dispatch, type SetStateAction } from "react";
import Banner from "../banner/banner";
import { createModule, deleteModule, updateModule, reorderModules } from "@/scripts/Api";
import { Button } from "../ui/button";
import { FaEdit, FaPlus, FaTrash, FaGripVertical } from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FormModuleProps {
  formation: Formation | null;
  modules: Module[];
  setModules: Dispatch<SetStateAction<Module[]>>;
}

const emptyForm = { title: "", subtitle: "", text: "", video: "", image: "" };

// ── Sortable row ──────────────────────────────────────────────
function SortableRow({
  mod,
  idx,
  onEdit,
  onDelete,
}: {
  mod: Module;
  idx: number;
  onEdit: (m: Module) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: mod.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
      <td className="px-2 py-2 text-center cursor-grab" {...attributes} {...listeners}>
        <FaGripVertical className="inline text-gray-400" />
      </td>
      <td className="px-4 py-2 text-center">{idx + 1}</td>
      <td className="px-4 py-2">{mod.title}</td>
      <td className="px-4 py-2">{mod.subtitle || "-"}</td>
      <td className="px-4 py-2 max-w-xs truncate">{mod.text}</td>
      <td className="px-4 py-2">
        {mod.video && <span className="text-blue-500 mr-1">🎥</span>}
        {mod.image && <span className="text-green-500">🖼️</span>}
        {!mod.video && !mod.image && "-"}
      </td>
      <td className="px-4 py-2 text-center space-x-2">
        <FaEdit className="inline cursor-pointer text-blue-500 hover:text-blue-700" onClick={() => onEdit(mod)} />
        <FaTrash className="inline cursor-pointer text-red-500 hover:text-red-700" onClick={() => onDelete(mod.id)} />
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────
export default function FormModule({ formation, modules, setModules }: FormModuleProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleChange = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!formation) return;
    if (!form.title.trim()) { setError("Le titre du module est requis"); return; }
    setError(null);

    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      text: form.text,
      video: form.video || null,
      image: form.image || null,
    };

    if (editingId !== null) {
      const current = modules.find(m => m.id === editingId);
      const res = await updateModule(editingId, {
        ...payload,
        video: form.video === "" && current?.video ? null : form.video || null,
        image: form.image === "" && current?.image ? null : form.image || null,
      });
      if (res.ok && res.data) {
        setModules(prev => prev.map(m => m.id === editingId ? res.data! : m));
        resetForm();
      } else {
        setError(res.message || "Erreur modification module");
      }
    } else {
      const res = await createModule(formation.id, payload);
      if (res.ok && res.data) {
        setModules(prev => [...prev, res.data!]);
        resetForm();
      } else {
        setError(res.message || "Erreur création module");
      }
    }
  };

  const handleDelete = async (moduleId: number) => {
    const res = await deleteModule(moduleId);
    if (res.ok) {
      setModules(prev => prev.filter(m => m.id !== moduleId));
      if (editingId === moduleId) resetForm();
    } else {
      setError(res.message || "Erreur suppression module");
    }
  };

  const handleEdit = (mod: Module) => {
    setEditingId(mod.id);
    setForm({ title: mod.title, subtitle: mod.subtitle, text: mod.text, video: mod.video ?? "", image: mod.image ?? "" });
    setMediaType(mod.video ? "video" : "image");
  };

  const resetForm = () => { setEditingId(null); setForm(emptyForm); setMediaType("video"); setError(null); };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex(m => m.id === active.id);
    const newIndex = modules.findIndex(m => m.id === over.id);
    const reordered = arrayMove(modules, oldIndex, newIndex);

    setModules(reordered);
    await reorderModules(reordered.map(m => m.id));
  };

  return (
    <>
      <Banner title="Modules" />
      <div className="flex flex-col gap-6 my-8 mx-2">
        {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

        {/* Form */}
        <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded">
          <h3 className="font-semibold">{editingId ? "Modifier le module" : "Ajouter un module"}</h3>
          <div className="flex flex-row gap-4">
            <div className="flex-1">
              <Label>Titre :</Label>
              <Input value={form.title} onChange={e => handleChange("title", e.target.value)}
                className="border-none bg-gray-100 rounded-none mt-1" />
            </div>
            <div className="flex-1">
              <Label>Sous-titre :</Label>
              <Input value={form.subtitle} onChange={e => handleChange("subtitle", e.target.value)}
                className="border-none bg-gray-100 rounded-none mt-1" />
            </div>
          </div>

          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-2">
              <Label>Média (optionnel) :</Label>
              <div className="flex gap-2">
                <Button type="button" variant={mediaType === "video" ? "edn_hover" : "outline"}
                  onClick={() => setMediaType("video")} className="cursor-pointer rounded-xl">Vidéo</Button>
                <Button type="button" variant={mediaType === "image" ? "edn_hover" : "outline"}
                  onClick={() => setMediaType("image")} className="cursor-pointer rounded-xl">Image</Button>
              </div>
            </div>
            {mediaType === "video" && (
              <div className="flex flex-col gap-2 flex-1">
                <Label>URL Vidéo :</Label>
                <Input value={form.video} onChange={e => handleChange("video", e.target.value)}
                  placeholder="https://youtu.be/..." className="border-none bg-gray-100 rounded-none mt-1" />
              </div>
            )}
            {mediaType === "image" && (
              <div className="flex flex-col gap-2 flex-1">
                <Label>URL Image :</Label>
                <Input value={form.image} onChange={e => handleChange("image", e.target.value)}
                  placeholder="https://..." className="border-none bg-gray-100 rounded-none mt-1" />
              </div>
            )}
          </div>

          <div>
            <Label>Texte :</Label>
            <textarea value={form.text} placeholder="Contenu du module"
              onChange={e => handleChange("text", e.target.value)}
              className="bg-gray-100 p-2 w-full resize-y mt-1" rows={3} />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="edn_hover" className="inline-flex items-center" onClick={handleSave}>
              {editingId ? <><FaEdit className="mr-1" /> Mettre à jour</> : <><FaPlus className="mr-1" /> Ajouter</>}
            </Button>
            {editingId && (
              <Button type="button" variant="destructive" className="inline-flex items-center" onClick={resetForm}>
                Annuler
              </Button>
            )}
          </div>
        </div>

        {/* Modules table with drag-and-drop */}
        {modules.length > 0 && (
          <div className="overflow-x-auto">
            <p className="text-xs text-gray-500 mb-2">
              <FaGripVertical className="inline mr-1" />
              Glissez les lignes pour réordonner les modules
            </p>
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="edn-degraded text-white text-left">
                <tr>
                  <th className="px-2 py-2 text-center w-8"></th>
                  <th className="px-4 py-2 text-center">#</th>
                  <th className="px-4 py-2">Titre</th>
                  <th className="px-4 py-2">Sous-titre</th>
                  <th className="px-4 py-2">Texte</th>
                  <th className="px-4 py-2">Média</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  <tbody className="bg-white">
                    {modules.map((mod, idx) => (
                      <SortableRow key={mod.id} mod={mod} idx={idx} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
