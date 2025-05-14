import { SuperButton } from "./SuperButton";

type Props = {
  prompt: string;
  onPromptChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export const AIPromptEditor = ({
  prompt,
  onPromptChange,
  onSubmit,
  loading,
}: Props) => (
  <div className="mt-4 w-full">
    <textarea
      className="w-full resize-none p-2 rounded-md border"
      placeholder="Describe los cambios que quieres..."
      value={prompt}
      onChange={(e) => onPromptChange(e.target.value)}
      rows={3}
    />
    <SuperButton
      className="button-pj mt-2"
      onClick={async () => onSubmit()}
      disabled={loading || !prompt.trim()}
    >
      {loading ? "Procesando..." : "Enviar solicitud"}
    </SuperButton>
  </div>
);
