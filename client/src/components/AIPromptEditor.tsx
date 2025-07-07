import { useEffect, useState } from "react";
import { SuperButton } from "./SuperButton";
import toast from "react-hot-toast";
import { requestChanges } from "../modules/lib";
import { useStore } from "../modules/store";
import { EditActions } from "./EditActions";
import { Markdowner } from "./Markdowner";
import {
  useSentencePolling,
  type TSentenceData,
} from "../hooks/useSentencePolling";

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

type TMessage = {
  role: "user" | "assistant";
  content: string;
};

export const AIPromptEditor = ({ onCancel, setIsEditing }: Props) => {
  const sentence = useStore((state) => state.sentence);
  const setSentence = useStore((state) => state.setSentence);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(sentence?.sentence || "");

  useEffect(() => {
    const { rejected, cleanDraft } = wasRejected(draft);
    if (rejected) {
      setError(cleanDraft);
      setDraft(sentence?.sentence || "");
    }
  }, [draft]);

  const handleSubmit = async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error("El prompt no puede estar vacío");
      return;
    }
    try {
      setLoading(true);
      setIsEditing(true);

      setError("");
      const changes = await requestChanges(
        sentence?.hash || "",
        prompt,
        sentence?.sentence || ""
      );
      console.log("changes response", changes);
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
      setSentence({
        hash: sentence?.hash || "",
        sentence: draft,
        status: "SUCCESS",
      });
      setError("");
    } catch (err) {
      console.error(err);
      toast.error("Hubo un error al actualizar la sentencia");
    }
  };
  return (
    <div className="flex flex-col flex-col-reverse lg:flex-row  gap-4 mt-10 p-4 rounded-md w-full">
      <Chat
        onSubmit={handleSubmit}
        onCancel={onCancel}
        loading={loading}
        onNewDraft={setDraft}
        onPollingError={() => {
          setLoading(false);
          setIsEditing(false);
        }}
        setIsLoading={setLoading}
      />
      <div className="bg-gray-200 p-4 rounded-md w-full flex flex-col gap-2">
        <Markdowner markdown={draft} allowEdit={false} />
        {draft !== sentence?.sentence && !error && (
          <div className="mt-4 flex gap-2 items-center justify-center">
            <EditActions
              onAccept={handleAccept}
              onReject={() => {
                setDraft(sentence?.sentence || "");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Chat = ({
  onSubmit,
  onCancel,
  loading,
  onNewDraft,
  onPollingError,
  setIsLoading,
}: // draft,
{
  onSubmit: (prompt: string) => void;
  onCancel: () => void;
  loading: boolean;
  onNewDraft: (draft: string) => void;
  onPollingError: () => void;
  setIsLoading: (isLoading: boolean) => void;
  // draft: string;
}) => {
  const sentence = useStore((state) => state.sentence);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<TMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy el Intérprete de Sentencias. ¿Cómo podemos mejorar esta interpretación? Escribe una instrucción clara y específica para que pueda entenderte claramente.",
    },
  ]);

  const handleFinish = (value: TSentenceData) => {
    console.log("value", value);
    if (value.workflow === "update") {
      console.log("updated by AI", value.brief);
      onNewDraft(value.brief);
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: value.message,
      },
    ]);
    setIsLoading(false);
  };

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
      onPollingError();
    }
  );
  return (
    <div className="flex flex-col gap-2 w-full lg:max-w-[550px]">
      <div className="flex flex-col gap-2 w-full">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex flex-col gap-2 p-2 rounded-md w-fit border border-gray-200 ${
              message.role === "user"
                ? "items-end bg-blue-100 self-end"
                : "items-start self-start"
            }`}
          >
            <div className="text-sm text-gray-500">
              {message.role === "assistant" ? "Intérprete" : "Tú"}
            </div>
            <div className="text-sm">{message.content}</div>
          </div>
        ))}
      </div>

      {/* <>
        {(!draft || draft === sentence?.sentence) && (
          <div className="flex flex-col gap-2 items-center justify-center w-full">
            {error && (
              <div className="mt-4 flex gap-2 items-center justify-center bg-red-100 p-5 rounded-md w-full relative">
                <div className="text-red-500">{error}</div>
                <div
                  className="text-red-500 absolute top-0 right-2 cursor-pointer"
                  onClick={() => setError("")}
                >
                  x
                </div>
              </div>
            )}
          </div>
        )}
      </> */}
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
          onClick={() => {
            setMessages([
              ...messages,
              {
                role: "user",
                content: prompt,
              },
            ]);
            onSubmit(prompt);
            setPrompt("");
          }}
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
            }}
          >
            Terminar
          </SuperButton>
        )}
      </div>
    </div>
  );
};

// {loading && (
//   <div className="flex flex-col gap-2 items-center justify-center">
//     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
//     <div>Procesando...</div>
//   </div>
// )}
