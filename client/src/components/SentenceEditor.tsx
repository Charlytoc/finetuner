import { useState } from "react";
import { useStore } from "../modules/store";
import { Markdowner } from "./Markdowner";
import { requestChanges, updateSentence } from "../modules/lib";
import { SuperButton } from "./SuperButton";

export const SentenceEditor = () => {
  const sentence = useStore((state) => state.sentence);
  const setSentence = useStore((s) => s.setSentence);

  const [editMode, setEditMode] = useState<"none" | "manual" | "ai">("none");
  const [manualText, setManualText] = useState(sentence?.sentence || "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [proposedSentence, setProposedSentence] = useState<string | null>(null);

  const handleAcceptChanges = async () => {
    if (!proposedSentence) return;
    try {
      setSentence({
        hash: sentence?.hash || "",
        sentence: proposedSentence,
        status: "SUCCESS",
      });
      await updateSentence(sentence?.hash || "", proposedSentence);
      setProposedSentence(null);
      setEditMode("none");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectChanges = () => {
    setProposedSentence(null);
    setEditMode("none");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-auto flex flex-col items-center mb-20">
      <div className="flex flex-row items-center gap-4 mt-10 bg-gray-200 p-4 rounded-md w-full">
        {editMode === "manual" ? (
          <textarea
            className="w-full resize-none p-2 rounded-md border"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={Math.max(3, manualText.split("\n").length)}
          />
        ) : (
          <Markdowner markdown={proposedSentence || sentence?.sentence || ""} />
        )}
      </div>

      {editMode === "none" &&
        !proposedSentence &&
        sentence?.status !== "ERROR" && (
          <div className="flex flex-col items-center gap-4 mt-4">
            <h2 className="text-md mt-4">
              ¿Qué quieres cambiar de esta sentencia?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="button-pj"
                onClick={() => setEditMode("manual")}
              >
                Editar manualmente
              </button>
              <button className="button-pj" onClick={() => setEditMode("ai")}>
                Solicitar cambios a la IA
              </button>
            </div>
          </div>
        )}

      {editMode === "manual" && (
        <div className="mt-4">
          <button
            className="button-pj"
            onClick={async () => {
              setSentence({
                hash: sentence?.hash || "",
                sentence: manualText,
                status: sentence?.status || "SUCCESS",
              });

              try {
                await updateSentence(sentence?.hash || "", manualText);
                setEditMode("none");
              } catch (error) {
                console.error(error);
              }
            }}
          >
            Finalizar edición
          </button>
        </div>
      )}

      {editMode === "ai" && !proposedSentence && (
        <div className="mt-4 w-full">
          <textarea
            className="w-full resize-none p-2 rounded-md border"
            placeholder="Describe los cambios que quieres..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={3}
          />
          <SuperButton
            className="button-pj mt-2"
            onClick={async () => {
              try {
                const changes = await requestChanges(
                  sentence?.hash || "",
                  aiPrompt
                );
                setProposedSentence(changes.sentence);
                setManualText(changes.sentence);
                setAiPrompt("");
              } catch (error) {
                console.error(error);
              }
            }}
          >
            Enviar solicitud
          </SuperButton>
        </div>
      )}

      {proposedSentence && (
        <div className="mt-4 flex gap-4">
          <button className="button-pj" onClick={handleAcceptChanges}>
            ✅ Aceptar cambios
          </button>
          <button className="button-pj" onClick={handleRejectChanges}>
            ❌ Rechazar
          </button>
          <button className="button-pj" onClick={() => setEditMode("ai")}>
            ✏️ Solicitar más cambios
          </button>
        </div>
      )}
    </div>
  );
};
