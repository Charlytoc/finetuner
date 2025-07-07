import { useEffect, useRef, useState } from "react";
import { SuperButton } from "./SuperButton";
import toast from "react-hot-toast";
import { generateFeedback, requestChanges, sendFeedback } from "../modules/lib";
import { useStore } from "../modules/store";
import { EditActions } from "./EditActions";
import { Markdowner } from "./Markdowner";
import {
  useSentencePolling,
  type TSentenceData,
} from "../hooks/useSentencePolling";
import {
  useFeedbackPolling,
  type TFeedbackData,
} from "../hooks/useFeedbackPolling";
import { Modal } from "./Modal";

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
  const user = useStore((state) => state.user);
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

  const handleSubmit = async (prompt: string, messages: string) => {
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
        sentence?.sentence || "",
        messages,
        user?.username || "Anónimo"
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
}: {
  onSubmit: (prompt: string, messages: string) => void;
  onCancel: () => void;
  loading: boolean;
  onNewDraft: (draft: string) => void;
  onPollingError: () => void;
  setIsLoading: (isLoading: boolean) => void;
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
    if (
      value.workflow === "update" &&
      !value.rejected &&
      value.brief !== "unchanged"
    ) {
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
    4000,
    100,
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
        {loading && (
          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            <div>Procesando...</div>
          </div>
        )}
      </div>

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
            onSubmit(prompt, JSON.stringify(messages));
            setPrompt("");
          }}
          disabled={loading || !prompt.trim()}
        >
          Enviar solicitud
        </SuperButton>

        {!loading && messages.length > 1 && (
          <FeedbackManager
            onFinish={() => {
              onCancel();
            }}
            messages={messages}
          />
        )}
      </div>
    </div>
  );
};
type FeedbackItem = {
  text: string;
  saved: boolean;
};

const separatefeedbacks = (text: string): FeedbackItem[] => {
  return text
    .split("_sep_")
    .map((item) => ({ text: item.trim(), saved: false }));
};

const FeedbackManager = ({
  onFinish,
  messages,
}: {
  onFinish: () => void;
  messages: TMessage[];
}) => {
  const sentence = useStore((state) => state.sentence);
  const user = useStore((state) => state.user);
  const notificationRef = useRef<string>("");
  const [waitingFeedback, setWaitingFeedback] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);

  const handleFinishFeedback = (value: TFeedbackData) => {
    setFeedbackList(separatefeedbacks(value.feedback));
    setWaitingFeedback(false);
    toast.success("Feedback generado correctamente", {
      id: notificationRef.current,
    });
  };

  useFeedbackPolling(
    sentence?.hash || "",
    handleFinishFeedback,
    waitingFeedback,
    4000,
    100
  );

  useEffect(() => {
    if (waitingFeedback) {
      notificationRef.current = toast.loading(
        "Generando feedback a partir de la conversación, espera un momento..."
      );
    }
  }, [waitingFeedback]);

  // Handler for accepting feedback
  const handleAccept = async (index: number) => {
    const feedback = feedbackList[index];
    const id = toast.loading("Enviando feedback...");
    await sendFeedback(sentence?.hash || "", feedback.text);
    toast.success("Feedback enviado correctamente", { id });
    setFeedbackList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, saved: true } : item))
    );
  };

  // Handler for removing feedback
  const handleRemove = (index: number) => {
    setFeedbackList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Modal
        isOpen={waitingFeedback || feedbackList.length > 0}
        onClose={() => {
          if (waitingFeedback) {
            toast.error("Espera que termine de generar el feedback");
          }
          onFinish();
        }}
      >
        {waitingFeedback && (
          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            <div>Procesando...</div>
          </div>
        )}
        {feedbackList.length > 0 && !waitingFeedback && (
          <div className="flex flex-col gap-2 items-center justify-center">
            <h4 className="text-lg font-bold">
              Por favor revisa la siguiente retroalimentación y selecciona las
              que deseas aceptar.
            </h4>
            <div className="flex flex-col gap-2">
              {feedbackList.map((feedback, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="text-sm text-gray-500">
                    {index + 1}. {feedback.text}
                  </div>
                  {feedback.saved ? (
                    <span className="text-green-600 text-xl ml-2">✅</span>
                  ) : (
                    <>
                      <SuperButton
                        className="bg-gray-200 text-black mt-2 px-4 py-2 rounded border border-gray-300 cursor-pointer"
                        onClick={() => handleRemove(index)}
                      >
                        Eliminar
                      </SuperButton>
                      <SuperButton
                        className="bg-gray-200 text-black mt-2 px-4 py-2 rounded border border-gray-300 cursor-pointer"
                        onClick={() => handleAccept(index)}
                      >
                        Aceptar
                      </SuperButton>
                    </>
                  )}
                </div>
              ))}
            </div>
            <SuperButton
              className="bg-gray-200 text-black mt-2 px-4 py-2 rounded border border-gray-300 cursor-pointer"
              onClick={() => {
                setWaitingFeedback(false);
                onFinish();
              }}
            >
              Terminar
            </SuperButton>
          </div>
        )}
      </Modal>
      {!waitingFeedback && (
        <SuperButton
          className="bg-gray-200 text-black mt-2 px-4 py-2 rounded border border-gray-300 cursor-pointer"
          onClick={() => {
            setWaitingFeedback(true);
            generateFeedback(
              sentence?.hash || "",
              JSON.stringify(messages.filter((m) => m.role === "assistant")),
              user?.username || "Anónimo"
            );
          }}
        >
          Terminar conversación
        </SuperButton>
      )}
    </>
  );
};
