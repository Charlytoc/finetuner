type Props = {
  onAccept: () => void;
  onReject: () => void;
};

export const EditActions = ({ onAccept, onReject }: Props) => (
  <div className="mt-4 flex gap-4">
    <button className="button-pj" onClick={onAccept}>
      ✅ Aceptar cambios
    </button>
    <button className="button-pj" onClick={onReject}>
      ❌ Rechazar
    </button>
  </div>
);
