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
              Para ello, puedes modificar el resumen de dos formas:
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
            <li>
              Realiza los cambios que consideres necesarios seleccionando el
              texto que te interesa y escribiendo lo que quieres cambiar.
            </li>
            <li>
              Puedes usar <strong>atajos de teclado</strong> para editar más
              rápido:
              <ul className="list-disc list-inside ml-4">
                <li>
                  💪 <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>B</kbd>: Negrita
                </li>
                <li>
                  ✨ <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>I</kbd>: Cursiva
                </li>
                <li>
                  ↩️ <kbd>Enter</kbd>: Salto de línea
                </li>
                <li>
                  ➡️ <kbd>Tab</kbd>: Identar o ir al siguiente párrafo (depende
                  del navegador)
                </li>

                <li>
                  ⏪ <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Z</kbd>: Deshacer
                </li>
                <li>
                  ⏩ <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Y</kbd>: Rehacer
                </li>
              </ul>
            </li>
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
        </div>
      </Modal>
    </>
  );
};
