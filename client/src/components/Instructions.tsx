import { Modal } from "./Modal";
import { useState } from "react";
import { SuperButton } from "./SuperButton";

export const InstructionsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SuperButton className="button-pj" onClick={async () => setIsOpen(true)}>
        Instrucciones
      </SuperButton>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="markdown-container space-y-4">
          <h1 className="text-center font-bold text-xl">📖 Instrucciones</h1>
          <h2 className="font-bold text-lg">🧠 ¿Cómo funciona?</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Sube un documento PDF o imagen que contenga una sentencia</li>
            <li>
              Presiona el botón "Listo", para que el documento o imagen adjunto
              se envié al modelo de Inteligencia Artificial para su tratamiento.
            </li>
            <li>
              El Modelo de Inteligencia Artificial generará un resumen de la
              sentencia en lenguaje ciudadano, la cual presentará en pantalla.
            </li>
            <li>
              Como el objetivo de esta plataforma es entrenar al modelo de
              Inteligencia Artificial, tú como usuario deberás corregir lo que
              detectes que está incorrecto, y que a la postre será complicado
              para que el ciudadano entienda debidamente una sentencia.
            </li>
            <li>
              Para ello, puedes modificar el resumen solicitando cambios a la
              IA.
            </li>
          </ol>



          <h2 className="font-bold text-lg">🤖 Solicitar cambios a la IA</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Haz clic en <strong>"Solicitar cambios a la IA"</strong>.
            </li>
            <li>
              Escribe una <strong>retroalimentación clara y específica</strong>.
            </li>
            <li>Espera a que la IA genere una nueva versión.</li>
            <li>
              Luego puedes:
              <ul className="list-disc list-inside ml-4">
                <li>✅ Aceptar cambios.</li>
                <li>❌ Rechazar cambios.</li>
              </ul>
            </li>
          </ol>
        </div>
      </Modal>
    </>
  );
};
