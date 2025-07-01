import { useEffect, useRef } from "react";
import { getSentence } from "../modules/lib";

export const useSentencePolling = (
  hash: string,
  current: string,
  onFinish: (value: string) => void,
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
        const data = await getSentence(hash);
        if (data?.brief) {
          console.log("✅ Draft actualizado automáticamente por polling");
          onFinish(data.brief);
          clearInterval(pollRef.current!);
        } else {
          retries.current += 1;
          if (retries.current >= maxRetries) {
            clearInterval(pollRef.current!);
            console.log("❌ Polling falló después de", maxRetries, "intentos");
            if (onError) onError("Max retries reached");
          } else {
            console.log(
              "No hay cambios en la sentencia. Son iguales?",
              data?.brief === current
            );
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
  }, [hash, current, onFinish, interval, loading, maxRetries, onError]);
};
