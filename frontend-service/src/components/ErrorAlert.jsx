export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm flex justify-between items-center">
      <span>{error}</span>
      <button
        onClick={onClose}
        className="font-bold text-xl hover:text-red-900"
        aria-label="Bezárás"
      >
        ×
      </button>
    </div>
  );
}
