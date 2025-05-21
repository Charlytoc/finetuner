import { useState } from "react";
import { SuperButton } from "./SuperButton";
import toast from "react-hot-toast";
import { requestChanges, updateSentence } from "../modules/lib";
import { useStore } from "../modules/store";
import { EditActions } from "./EditActions";
import { Markdowner } from "./Markdowner";
import { useSentencePolling } from "../hooks/useSentencePolling";

type Props = {
  onCancel: () => void;
};

export const AIPromptEditor = ({ onCancel }: Props) => {
  const sentence = useStore((state) => state.sentence);
  const setSentence = useStore((state) => state.setSentence);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(sentence?.sentence || "");

  const handleFinish = (value: string) => {
    setDraft(value);
    setLoading(false);
  };

  useSentencePolling(
    sentence?.hash || "",
    sentence?.sentence || "",
    handleFinish,
    loading
  );

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("El prompt no puede estar vacío");
      return;
    }
    try {
      setLoading(true);
      const changes = await requestChanges(sentence?.hash || "", prompt);
      console.log("changes RECIBIDOS", changes);
      setPrompt("");
    } catch (err) {
      console.error(err);
      toast.error("Hubo un error al actualizar la sentencia");
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!draft.trim()) return;
    try {
      await updateSentence(sentence?.hash || "", draft);
      setSentence({
        hash: sentence?.hash || "",
        sentence: draft,
        status: "SUCCESS",
      });
      onCancel();
      setPrompt("");
    } catch (err) {
      console.error(err);
      toast.error("Hubo un error al actualizar la sentencia");
    }
  };
  return (
    <div className="mt-4 w-full">
      <div className="flex flex-col items-center gap-4 mt-10 bg-gray-200 p-4 rounded-md w-full">
        <Markdowner markdown={draft} allowEdit={false} />
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          <div>Procesando...</div>
        </div>
      ) : (
        <>
          {draft !== sentence?.sentence ? (
            <div className="mt-4 flex gap-2 items-center justify-center">
              <EditActions
                onAccept={handleAccept}
                onReject={() => {
                  setDraft(sentence?.sentence || "");
                  setPrompt("");
                  onCancel();
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center justify-center">
              <textarea
                className="w-full resize-none p-2 rounded-md border mt-4"
                placeholder="Describe los cambios que quieres..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 items-center justify-center">
                <SuperButton
                  loadingText="Procesando..."
                  className="button-pj mt-2"
                  onClick={handleSubmit}
                  disabled={loading || !prompt.trim()}
                >
                  Enviar solicitud
                </SuperButton>
                {!loading && (
                  <SuperButton
                    className="bg-gray-200 text-black mt-2 px-4 py-2 rounded border border-gray-300 cursor-pointer"
                    onClick={onCancel}
                  >
                    Cancelar
                  </SuperButton>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
