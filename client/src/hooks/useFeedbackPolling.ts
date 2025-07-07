import { useEffect, useRef } from "react";
import { getGeneratedFeedback } from "../modules/lib";

export type TFeedbackData = {
  status: "SUCCESS" | "ERROR";
  message: string;
  feedback: string;
  hash: string;
  // Agrega aquí otros campos si los necesitas
};

export const useFeedbackPolling = (
  hash: string,
  onFinish: (value: TFeedbackData) => void,
  loading: boolean,
  interval: number = 10000,
  maxRetries: number = 50,
  onError?: (reason?: any) => void
) => {
  const retries = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hash || !loading) return;

    retries.current = 0; // Reset on new polling session

    const poll = async () => {
      try {
        const data = await getGeneratedFeedback(hash);
        if (data?.status === "SUCCESS") {
          console.log("✅ Feedback generado encontrado");
          onFinish(data);
          clearInterval(pollRef.current!);
        } else {
          retries.current += 1;
          if (retries.current >= maxRetries) {
            clearInterval(pollRef.current!);
            console.log("❌ Polling falló después de", maxRetries, "intentos");
            if (onError) onError("Max retries reached");
          } else {
            console.log("Feedback aún no disponible.");
          }
        }
      } catch (err) {
        retries.current += 1;
        if (retries.current >= maxRetries) {
          clearInterval(pollRef.current!);
          console.log("❌ Polling falló después de", maxRetries, "intentos");
          if (onError) onError(err);
        } else {
          console.warn("Polling fallo:", err);
        }
      }
    };

    pollRef.current = setInterval(poll, interval);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [hash, onFinish, interval, loading, maxRetries, onError]);
};
