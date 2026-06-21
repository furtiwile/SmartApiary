import { useState } from "react";
import toast from "react-hot-toast";
import { BeehiveApi } from "../api/beehiveApi";
import type { BeehiveType } from "../../../types/BeehiveType";



interface BeehiveUploadModalProps {
  open: boolean;
  onClose: () => void;
  apiaryId: string;
}



export function BeehiveUploadModal({ open, onClose, apiaryId }: BeehiveUploadModalProps) {
  const [type, setType] = useState<BeehiveType>("Other");
  const [designation, setDesignation] = useState("");
  const [superColor, setSuperColor] = useState("");
  const [queenAge, setQueenAge] = useState(0);
  const [note, setNote] = useState("");
  const [smartScaleId, setSmartScaleId] = useState("");

  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!open) return null;


  async function handleSubmit() {
    if (!designation || !superColor || !smartScaleId) {
      setError("All fields are required");
      return;
    }

    try {
      setIsUploading(true);
      const _a = await BeehiveApi.create(apiaryId, type, designation, superColor, queenAge, note, smartScaleId);
      console.log(_a);
      toast.success("Firmware successfully uploaded!");
      handleClose();
    } catch {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };


  function handleClose() {
    setType("Other");
    setDesignation("");
    setSuperColor("");
    setQueenAge(0);
    setNote("");
    setSmartScaleId("");
    setError("");
    setIsUploading(false);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Create Beehive
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-300 transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Type
            </label>
            <select
              name="type"
              id="type"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(event) => setType(event.target.value as BeehiveType)}
              defaultValue="LR"
            >
              <option value="LR">LR</option>
              <option value="DB">DB</option>
              <option value="Poloska">Poloska</option>
              <option value="Farrar">Farrar</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Designation
            </label>
            <input
              type="text"
              placeholder="Designation"
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Super Color */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Super Color
            </label>
            <input
              type="text"
              placeholder="Super Color"
              onChange={(e) => setSuperColor(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Queen Age */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Queen Age
            </label>
            <input
              type="number"
              placeholder="Queen Age"
              onChange={(e) => setQueenAge(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Note
            </label>
            <input
              type="text"
              placeholder="Note"
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Smart Scale Id */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Smart Scale Id
            </label>
            <input
              type="text"
              placeholder="Smart Scale Id"
              onChange={(e) => setSmartScaleId(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 font-medium">{error}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};
