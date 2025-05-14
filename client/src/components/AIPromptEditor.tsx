import { SuperButton } from "./SuperButton";

type Props = {
  prompt: string;
  onPromptChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  onCancel: () => void;
};

export const AIPromptEditor = ({
  prompt,
  onPromptChange,
  onSubmit,
  loading,
  onCancel,
}: Props) => (
  <div className="mt-4 w-full">
    <textarea
      className="w-full resize-none p-2 rounded-md border"
      placeholder="Describe los cambios que quieres..."
      value={prompt}
      onChange={(e) => onPromptChange(e.target.value)}
      rows={3}
    />
    <div className="flex gap-2 items-center justify-center">
      <SuperButton
        className="button-pj mt-2"
        onClick={async () => onSubmit()}
        disabled={loading || !prompt.trim()}
      >
        {loading ? "Procesando..." : "Enviar solicitud"}
      </SuperButton>
      {!loading && (
        <SuperButton
          className="bg-gray-200 text-black mt-2 px-4 py-2 rounded border border-gray-300 cursor-pointer"
          onClick={async () => onCancel()}
        >
          Cancelar
        </SuperButton>
      )}
    </div>
  </div>
);
