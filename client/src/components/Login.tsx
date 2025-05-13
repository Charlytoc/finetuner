import { useStore } from "../modules/store";
import { Modal } from "./Modal";
import { useState } from "react";

export default function Login() {
  const { user, login, logout } = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <>
      {!user && (
        <Modal isOpen={!user} onClose={() => console.log("Modal closed")}>
          <div className=" p-8 rounded-lg  text-center ">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 ">
              Iniciar sesión
            </h1>
            <form
              onSubmit={handleSubmit}
              className="space-y-5 flex flex-col justify-center items-center"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-100 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-100 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-100 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200 "
              >
                Entrar
              </button>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
