import React from "react";

interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  onConfirm,
  onClose,
  loading = false,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose} // ✅ Overlay closes dialog
    >
      <div
        className="bg-white rounded-xl shadow-xl p-5 w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking the box
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="text-sm text-gray-600 mb-4">{message}</div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 border rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={() => void onConfirm()}
            disabled={loading}
            className={`px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
