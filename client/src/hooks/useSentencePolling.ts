import { useEffect } from "react";
import { getSentence } from "../modules/lib";

export const useSentencePolling = (
  hash: string,
  current: string,
  onFinish: (value: string) => void,
  loading: boolean,
  interval: number = 15000
) => {
  useEffect(() => {
    if (!hash || !loading) return;

    const poll = setInterval(async () => {
      console.log("Polling in process", hash);
      try {
        const data = await getSentence(hash);
        console.log("data recibida en polling", data);
        if (data?.brief && data.brief !== current) {
          onFinish(data.brief);

          console.log("✅ Draft actualizado automáticamente por polling");
        } else {
          console.log(
            "No hay cambios en la sentencia. Son iguales?",
            data?.brief === current
          );
        }
      } catch (err) {
        console.warn("Polling fallo:", err);
      }
    }, interval);

    return () => clearInterval(poll);
  }, [hash, current, onFinish, interval, loading]);
};
