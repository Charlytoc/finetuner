import { useEffect, useRef, useState } from "react";
import { SuperButton } from "./SuperButton";
import toast from "react-hot-toast";
import { requestChanges, sendFeedback } from "../modules/lib";
import { useStore } from "../modules/store";
import { EditActions } from "./EditActions";
import { Markdowner } from "./Markdowner";
import { useSentencePolling } from "../hooks/useSentencePolling";

export const wasRejected = (draft: string) => {
  // Regex para todas las variantes de la tag <REJECTED>
  const rejectedTagRegex = /<\s*rejected\s*\/?\s*>/gi;
  const rejected = rejectedTagRegex.test(draft);
  const cleanDraft = draft.replace(rejectedTagRegex, "").trim();
  return { rejected, cleanDraft };
};

type Props = {
  onCancel: () => void;
  setIsEditing: (isEditing: boolean) => void;
};

export const AIPromptEditor = ({ onCancel, setIsEditing }: Props) => {
  const sentence = useStore((state) => state.sentence);
  const setSentence = useStore((state) => state.setSentence);
  const lastPromptRef = useRef<string>("");
  const [error, setError] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(sentence?.sentence || "");

  const handleFinish = (value: string) => {
    if (value === sentence?.sentence) {
      setError(
        "Ha habido un error al actualizar la sentencia, por favor intenta nuevamente, asegúrate de incluir indicaciones claras y específicas para que la IA pueda entender lo que quieres cambiar. Si tu solicitud no es clara o no tiene nada que ver con la sentencia, no será posible actualizar la sentencia."
      );
    } else {
      setDraft(value);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { rejected, cleanDraft } = wasRejected(draft);
    if (rejected) {
      setError(cleanDraft);
      setDraft(sentence?.sentence || "");
    }
  }, [draft]);

  useSentencePolling(
    sentence?.hash || "",
    sentence?.sentence || "",
    handleFinish,
    loading,
    10000,
    50,
    (err) => {
      console.error("Error al actualizar la sentencia", err);
      toast.error(
        "Hubo un error al actualizar la sentencia, por favor intenta nuevamente"
      );
      setLoading(false);
      setIsEditing(false);
    }
  );

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("El prompt no puede estar vacío");
      return;
    }
    try {
      setLoading(true);
      setIsEditing(true);
      lastPromptRef.current = prompt;

      const changes = await requestChanges(
        sentence?.hash || "",
        prompt,
        sentence?.sentence || ""
      );
      console.log("changes response", changes);
      setPrompt("");
      setError("");
    } catch (err) {
      console.error(err);
      toast.error("Hubo un error al actualizar la sentencia");
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleAccept = async () => {
    if (!draft.trim()) return;
    try {
      // await updateSentence(sentence?.hash || "", draft);
      setSentence({
        hash: sentence?.hash || "",
        sentence: draft,
        status: "SUCCESS",
      });
      await sendFeedback(sentence?.hash || "", lastPromptRef.current);
      onCancel();
      setPrompt("");
      setError("");
      lastPromptRef.current = "";
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
          {draft !== sentence?.sentence && !error && (
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
          )}
          {draft === sentence?.sentence && error && (
            <div className="mt-4 flex gap-2 items-center justify-center">
              <div className="text-red-500">{error}</div>
            </div>
          )}
          {(!draft || draft === sentence?.sentence) && (
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
                    onClick={async () => {
                      onCancel();
                      setPrompt("");
                      setError("");
                      lastPromptRef.current = "";
                    }}
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
