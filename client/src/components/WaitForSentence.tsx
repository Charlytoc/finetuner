import { useEffect, useRef } from "react";
import { getSentence } from "../modules/lib";
import type { APIStatus } from "../modules/store";

type TSentence = {
  hash: string;
  brief: string;
  status: APIStatus;
  message: string;
  warning: string;
};

interface WaitForSentenceProps {
  hash: string;
  onSuccess: (sentence: TSentence) => void;
  onError?: (error: any) => void;
  pollingInterval?: number; // en ms
  maxRetries?: number;
}

export const WaitForSentence: React.FC<WaitForSentenceProps> = ({
  hash,
  onSuccess,
  onError,
  pollingInterval = 30000,
  maxRetries = 30,
}) => {
  const retries = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const intervalId = setInterval(async () => {
      retries.current++;
      if (retries.current > maxRetries) {
        console.log("Se ha alcanzado el máximo número de reintentos.");
        clearInterval(intervalId);
        if (isMounted) {
          onError?.(
            new Error("Se ha alcanzado el máximo número de reintentos.")
          );
        }
        return;
      }
      try {
        const data = await getSentence(hash);
        if (isMounted && data?.status === "SUCCESS") {
          onSuccess(data);
          clearInterval(intervalId);
        }
      } catch (error: any) {
        if (error?.response?.status === 404) {
          // Sentencia aún no está lista
        } else {
          clearInterval(intervalId);
          if (isMounted) {
            onError?.(error);
          }
        }
      }
    }, pollingInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [hash, pollingInterval, maxRetries, onSuccess, onError]);

  return (
    <div className="text-sm text-gray-600 animate-pulse">
      ⏳ Esperando a que se genere la sentencia...
    </div>
  );
};
