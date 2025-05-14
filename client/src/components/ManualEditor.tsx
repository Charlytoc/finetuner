type Props = {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  loading: boolean;
  onCancel: () => void;
};

export const ManualEditor = ({
  value,
  onChange,
  onSave,
  loading,
  onCancel,
}: Props) => (
  <div className="mt-4 w-full">
    <textarea
      className="w-full resize-none p-2 rounded-md border"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={Math.max(3, value.split("\n").length)}
    />
    <div className="flex gap-2 items-center justify-center">
      <button className="button-pj mt-2" onClick={onSave} disabled={loading}>
        {loading ? "Guardando..." : "Finalizar edición"}
      </button>
      <button
        className="bg-gray-200 text-black mt-2 px-4 py-2 rounded border border-gray-300 cursor-pointer"
        onClick={onCancel}
        disabled={loading}
      >
        Cancelar
      </button>
    </div>
  </div>
);
