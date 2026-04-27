import Banner from "@/components/banner/banner";
import FormationTab from "@/components/tab/formation-tab";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminFormations() {
  const navigate = useNavigate();
  const handleFormation = () => {
    navigate("/admin/formation/create");
  };

  return (
    <div className="p-6">
      <Banner title="Les formations" />
      <div className="flex flex-col gap-4 my-4">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold">
            Liste des formations disponibles
          </h1>
          <Button
            variant="edn_hover"
            className="cursor-pointer"
            onClick={() => {
              handleFormation();
            }}>
            Ajouter une formation
          </Button>
        </div>
        <FormationTab />
      </div>
    </div>
  );
}
