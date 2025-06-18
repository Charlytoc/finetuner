import { useEffect, useRef, useState } from "react";
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
  const [exceeded, setExceeded] = useState(false);
  const [pollAttempt, setPollAttempt] = useState(0); // Para reiniciar el polling

  useEffect(() => {
    let isMounted = true;
    retries.current = 0;
    setExceeded(false);

    const intervalId = setInterval(async () => {
      retries.current++;
      if (retries.current > maxRetries) {
        clearInterval(intervalId);
        if (isMounted) {
          setExceeded(true);
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
        // Sigue reintentando, solo loguea el error
        console.log(
          "error mientras se espera a que se genere la sentencia",
          error
        );
      }
    }, pollingInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
    // pollAttempt se incluye para reiniciar el efecto
  }, [hash, pollingInterval, maxRetries, onSuccess, onError, pollAttempt]);

  const handleRetry = () => {
    setPollAttempt((prev) => prev + 1);
  };

  const handleCancel = () => {
    onError?.("Cancelado por el usuario");
  };

  if (exceeded) {
    return (
      <div className="text-sm text-gray-600 flex flex-col items-center gap-2">
        <div>⚠️ Se ha alcanzado el máximo número de reintentos.</div>
        <div className="flex flex-row items-center gap-2">
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded button-pj"
            onClick={handleRetry}
          >
            Reintentar
          </button>
          <button
            className="mt-2 px-4 py-2  text-white rounded bg-gray-500 cursor-pointer"
            onClick={handleCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600 animate-pulse">
      ⏳ Esperando a que se genere la sentencia...
    </div>
  );
};
