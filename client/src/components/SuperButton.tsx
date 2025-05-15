import { useState } from "react";

interface SuperButtonProps {
  children: React.ReactNode;
  onClick?: () => Promise<void> | void;
  className?: string;
  loadingText?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const SuperButton = ({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  loadingText = "Cargando...",
}: SuperButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      if (onClick) {
        await onClick();
      }
    } catch (err) {
      setError("Hubo un error 😥");
      console.error("ERROR DEL BOTON", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type={type}
        className={`${className} ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleClick}
        disabled={disabled || loading}
      >
        {loading ? loadingText : children}
      </button>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};
