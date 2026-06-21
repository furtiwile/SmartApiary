import { useState } from "react";
import toast from "react-hot-toast";
import { BeehiveInspectionApi } from "../api/beehiveInspectionApi";



interface BeehiveInspectionUploadModalProps {
  open: boolean;
  onClose: () => void;
  hiveId: string;
}



export function BeehiveInspectionUploadModal({ open, onClose, hiveId }: BeehiveInspectionUploadModalProps) {
  const [inspectionDate, setInspectionDate] = useState<Date>(new Date());
  const [bottomBoardColor, setBottomBoardColor] = useState("");
  const [honeyFrames, setHoneyFrames] = useState(0);
  const [honeyAmount, setHoneyAmount] = useState(0);
  const [broodFrames, setBroodFrames] = useState(0);
  const [queenPresent, setQueenPresent] = useState(true);
  const [note, setNote] = useState("");

  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!open)
    return null;


  async function handleSubmit() {
    if (!inspectionDate || !bottomBoardColor) {
      setError("All fields are required");
      return;
    }

    try {
      setIsUploading(true);
      const _a = await BeehiveInspectionApi.create(hiveId, inspectionDate, bottomBoardColor, honeyFrames, honeyAmount, broodFrames, queenPresent, note);
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
    setInspectionDate(new Date());
    setBottomBoardColor("");
    setHoneyFrames(0);
    setHoneyAmount(0);
    setBroodFrames(0);
    setQueenPresent(true);
    setNote("");
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
              Inspection Date
            </label>
            <input
              type="date"
              placeholder="Inspection Date"
              onChange={(e) => setInspectionDate(new Date(e.target.value))}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Bottom Board Color */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Bottom Board Color
            </label>
            <input
              type="text"
              placeholder="Bottom Board Color"
              onChange={(e) => setBottomBoardColor(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Honey Frames */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Honey Frames
            </label>
            <input
              type="number"
              placeholder="Honey Frames"
              onChange={(e) => setHoneyFrames(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Honey Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Honey Frames
            </label>
            <input
              type="number"
              placeholder="Honey Amount"
              onChange={(e) => setHoneyAmount(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Brood Frames */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Brood Frames
            </label>
            <input
              type="number"
              placeholder="Brood Frames"
              onChange={(e) => setBroodFrames(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Queen Present */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Is Queen Present
            </label>
            <input
              type="checkbox"
              onChange={(e) => setQueenPresent(e.target.checked)}
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
