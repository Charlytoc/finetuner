import { useEffect } from "react";
import { getSentence } from "../modules/lib";
import { useStore } from "../modules/store";

export const ParamsReader = () => {
  const setSentence = useStore((state) => state.setSentence);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParam = params.get("hash");

    if (!hashParam) return;

    const fetchData = async () => {
      try {
        const response = await getSentence(hashParam);
        console.log(response, "response");
        setSentence({
          hash: hashParam,
          sentence: response.sentence,
          status: response.status,
        });
      } catch (error) {
        console.error("Error:", error);
        setSentence({
          hash: hashParam,
          sentence: "Error al obtener la sentencia.",
          status: "ERROR",
        });
      }
    };

    fetchData();
  }, []);

  return <></>;
};
