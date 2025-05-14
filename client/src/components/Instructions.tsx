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
          <p>
            El objetivo de esta aplicación es mejorar la calidad de las
            sentencias ciudadanas generadas por el{" "}
            <strong>Traductor de Sentencias Ciudadanas</strong> usando la
            retroalimentación de los usuarios.
          </p>

          <h2 className="font-bold text-lg">🧠 ¿Cómo funciona?</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Sube un documento con una sentencia o imágenes relacionadas.
            </li>
            <li>La aplicación generará un resumen inicial de la sentencia.</li>
            <li>
              Puedes mejorar el resumen de dos formas:
              <ul className="list-disc list-inside ml-4">
                <li>✍️ Editar manualmente.</li>
                <li>🤖 Solicitar cambios a la IA.</li>
              </ul>
            </li>
          </ol>

          <h2 className="font-bold text-lg">✍️ Editar manualmente</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Haz clic en el botón <strong>"Editar manualmente"</strong>.
            </li>
            <li>Realiza los cambios que consideres necesarios.</li>
            <li>
              Haz clic en <strong>"Finalizar edición"</strong> para guardar los
              cambios.
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

          <h2 className="font-bold text-lg">
            💡 Tip para una buena retroalimentación
          </h2>
          <p>
            Sé claro, específico y enfócate en lo que se puede mejorar. Ejemplo:
          </p>
          <blockquote className="italic border-l-4 border-gray-400 pl-4">
            "La sentencia es confusa en el segundo párrafo. Debería explicar
            mejor el contexto del caso y evitar términos legales complejos."
          </blockquote>
        </div>
      </Modal>
    </>
  );
};
