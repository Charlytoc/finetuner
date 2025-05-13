import Login from "./Login";
import { useStore } from "../modules/store";
const NAME = "Entrenador de PJEdoMex";

export const Navbar = () => {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  return (
    <>
      <nav className="bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight color-edomex flex flex-row items-center gap-0">
            {/* <img src="/logo.png" alt="logo" className="w-6 h-6 mr-2" /> */}
            <span className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight color-edomex">
              {NAME}
            </span>
          </div>
          <div className="flex flex-row justify-between items-center w-fit gap-4 p-4 ">
            <span className="text-gray-800">{user?.username}</span>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer"
              onClick={logout}
            >
              Salir
            </button>
          </div>
        </div>
      </nav>
      <Login />
    </>
  );
};
