import { useState } from "react";
import { useStore } from "../modules/store";
import { updateSentence } from "../modules/lib";
import { Markdowner } from "./Markdowner";
import { InstructionsModal } from "./Instructions";
import { FileUploader } from "./FileUploader";
import { AIPromptEditor } from "./AIPromptEditor";
import type { EditMode } from "./types";

export const SentenceEditor = () => {
  const sentence = useStore((state) => state.sentence);
  const setSentence = useStore((s) => s.setSentence);
  const setWarning = useStore((s) => s.setWarning);
  const warning = useStore((s) => s.warning);

  const [editMode, setEditMode] = useState<EditMode>("none");
  const [loading, setLoading] = useState(false);

  const handleSaveManual = async (newSentence: string) => {
    if (!newSentence.trim()) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    setSentence({
      hash,
      sentence: brief,
      status: status as "SUCCESS" | "ERROR",
    });
    setWarning(warning);
    setEditMode("none");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-auto flex flex-col items-center mb-20">
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-100 p-4 rounded-md w-fit sm:justify-center">
        <InstructionsModal />
        <FileUploader onUploadSuccess={handleUploadSuccess} />
      </div>

      {sentence && editMode !== "ai" && (
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

      {editMode === "none" && sentence && sentence?.status !== "ERROR" && (
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
          loading={loading}
          onCancel={() => setEditMode("none")}
        />
      )}
    </div>
  );
};
