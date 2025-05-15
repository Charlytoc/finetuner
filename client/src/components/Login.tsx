import { useStore } from "../modules/store";
import { Modal } from "./Modal";
import { useState } from "react";
import { SuperButton } from "./SuperButton";

export default function Login() {
  const { user, login } = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    await login(username, password);
  };

  return (
    <>
      {!user && (
        <Modal isOpen={!user} onClose={() => console.log("Modal closed")}>
          <div className="p-1 rounded-lg  text-center ">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 ">
              Iniciar sesión
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="w-full max-w-xs space-y-5 flex flex-col items-center mx-auto rounded-lg"
            >
              <div className="w-full ">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  aria-required="true"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <SuperButton className="button-pj" onClick={handleSubmit}>
                Entrar
              </SuperButton>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
