import { useState } from "react";
import { useStore, type APIStatus } from "../modules/store";
import { updateSentence } from "../modules/lib";
import { Markdowner } from "./Markdowner";
import { InstructionsModal } from "./Instructions";
import { FileUploader } from "./FileUploader";
import { AIPromptEditor } from "./AIPromptEditor";
import type { EditMode } from "./types";
import toast from "react-hot-toast";
import { WaitForSentence } from "./WaitForSentence";

export const SentenceEditor = () => {
  const sentence = useStore((state) => state.sentence);
  const setSentence = useStore((s) => s.setSentence);
  const setWarning = useStore((s) => s.setWarning);
  const warning = useStore((s) => s.warning);

  const [isEditing, setIsEditing] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>("none");

  const handleSaveManual = async (newSentence: string) => {
    if (!newSentence.trim()) return;
    try {
      setSentence({
        hash: sentence?.hash || "",
        sentence: newSentence,
        status: "SUCCESS",
      });
      await updateSentence(sentence?.hash || "", newSentence);
      setEditMode("none");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSuccess = ({
    brief,
    hash,
    status,
    warning,
  }: {
    brief: string;
    hash: string;
    status: string;
    warning: string;
  }) => {
    console.log(
      "status RECIBID",
      status,
      "hash",
      hash,
      "brief",
      brief,
      "warning",
      warning
    );
    if (status === "QUEUED") {
      setSentence({
        hash,
        sentence: "",
        status: status as APIStatus,
      });
      return;
    }
    if (status === "ERROR") {
      toast.error("Error al generar la sentencia, por favor intenta de nuevo.");
      return;
    }

    if (status === "SUCCESS") {
      toast.success("Resumen generado con éxito");
      setSentence({
        hash,
        sentence: brief,
        status: status as APIStatus,
      });
      setWarning(warning);
      setEditMode("none");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-auto flex flex-col items-center mb-20">
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-100 p-4 rounded-md w-fit sm:justify-center">
        <InstructionsModal />
        <FileUploader
          disabled={sentence?.status === "QUEUED" || isEditing}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>

      {sentence && sentence.status === "QUEUED" && (
        <WaitForSentence
          hash={sentence.hash}
          onSuccess={handleUploadSuccess}
          pollingInterval={15000}
        />
      )}

      {sentence && editMode !== "ai" && sentence.status === "SUCCESS" && (
        <div className="flex flex-col items-center gap-4 mt-10 bg-gray-200 p-4 rounded-md w-full">
          <Markdowner
            markdown={sentence?.sentence || ""}
            allowEdit={editMode === "manual"}
            onSave={handleSaveManual}
            onCancel={() => setEditMode("none")}
          />
          {warning && editMode === "none" && (
            <Markdowner className="text-red-400 text-sm" markdown={warning} />
          )}
        </div>
      )}

      {editMode === "none" && sentence && sentence?.status === "SUCCESS" && (
        <div className="flex flex-col items-center gap-4 mt-4">
          <h2 className="text-md mt-4">
            ¿Qué quieres cambiar de esta sentencia?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="button-pj" onClick={() => setEditMode("manual")}>
              Editar manualmente
            </button>
            <button className="button-pj" onClick={() => setEditMode("ai")}>
              Solicitar cambios a la IA
            </button>
          </div>
        </div>
      )}

      {editMode === "ai" && (
        <AIPromptEditor
          onCancel={() => {
            setEditMode("none");
            setIsEditing(false);
          }}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
};
