type Props = {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  loading: boolean;
};

export const ManualEditor = ({ value, onChange, onSave, loading }: Props) => (
  <div className="mt-4 w-full">
    <textarea
      className="w-full resize-none p-2 rounded-md border"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={Math.max(3, value.split("\n").length)}
    />
    <button className="button-pj mt-2" onClick={onSave} disabled={loading}>
      {loading ? "Guardando..." : "Finalizar edición"}
    </button>
  </div>
);
