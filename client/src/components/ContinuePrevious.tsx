import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { useStore } from "../modules/store";
import toast from "react-hot-toast";
import { SuperButton } from "./SuperButton";

export const ContinuePrevious = () => {
  const sentence = useStore((state) => state.sentence);
  const setSentence = useStore((state) => state.setSentence);
  const user = useStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (sentence && user) {
      setIsOpen(true);
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        toast.error("Por favor selecciona una opción para continuar");
      }}
    >
      <div className="p-4 flex flex-col gap-4">
        <h3 className="text-lg font-bold">
          Bienvenido de nuevo{" "}
          <span className="text-red-500">{user?.username}</span>
        </h3>
        <p className="text-sm text-gray-500">
          ¿Quieres continuar con la última sentencia guardada o empezar de cero?
        </p>
        <div className="flex flex-col gap-4 mt-4 items-center">
          <SuperButton
            className="button-pj"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Continuar
          </SuperButton>
          <SuperButton
            className="button-pj"
            onClick={() => {
              setSentence(null);
              setIsOpen(false);
            }}
          >
            Empezar de cero
          </SuperButton>
        </div>
      </div>
    </Modal>
  );
};
