import { useState } from "react";

interface SuperButtonProps {
  onClick: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const SuperButton = ({
  onClick,
  children,
  className = "",
}: SuperButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await onClick();
    } catch (err) {
      setError("Hubo un error 😥");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className={`${className} ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Cargando..." : children}
      </button>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};
