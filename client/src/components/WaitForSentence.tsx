import { useEffect } from "react";
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
}

export const WaitForSentence: React.FC<WaitForSentenceProps> = ({
  hash,
  onSuccess,
  onError,
  pollingInterval = 15000,
}) => {
  useEffect(() => {
    let isMounted = true;
    const intervalId = setInterval(async () => {
      try {
        const data = await getSentence(hash);
        console.log("data RECIBIDA en el waiting", data);
        if (isMounted && data?.status === "SUCCESS") {
          onSuccess(data);
          clearInterval(intervalId);
        }
      } catch (error: any) {
        if (error?.response?.status === 404) {
          // Sentencia aún no está lista => no hacer nada
        } else {
          clearInterval(intervalId);
          onError?.(error);
        }
      }
    }, pollingInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [hash, pollingInterval, onSuccess, onError]);

  return (
    <div className="text-sm text-gray-600 animate-pulse">
      ⏳ Esperando a que se genere la sentencia...
    </div>
  );
};
