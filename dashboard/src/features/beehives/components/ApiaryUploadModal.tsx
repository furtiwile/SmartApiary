import { useState } from "react";
import toast from "react-hot-toast";
import { ApiaryApi } from "../api/apiaryApi";

interface ApiaryUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function ApiaryUploadModal({ open, onClose }: ApiaryUploadModalProps) {
  const [name, setName] = useState<string>("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  // const [imageFile, setImageFile] = useState<string>("");
  const [imageFile, setImageFile] = useState<File>();

  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!open) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // if (!selected.name.endsWith(".png")) {
    //   setError("Image file must be a .png file");
    //   return;
    // }

    setError("");
    setImageFile(selected);
  };

  async function handleSubmit() {
    if (!name || !description || !imageFile) {
      setError("All fields are required");
      return;
    }

    try {
      setIsUploading(true);
      const _a = await ApiaryApi.create(name, latitude, longitude, description, imageFile);
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
    setName("");
    setLatitude(0);
    setLongitude(0);
    setDescription("");
    setImageFile("");
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
            Create Apiary
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
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Latitude
            </label>
            <input
              type="number"
              placeholder="Latitude"
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Longitude
            </label>
            <input
              type="number"
              placeholder="Longitude"
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Image File */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Image URL
            </label>
            {/* <input
              type="url"
              placeholder="Image URL"
              onChange={(e) => setImageFile(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            /> */}
            <input
              type="file"
              accept=".png,.jpg,.gif,.tiff"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-400
                file:mr-4 file:rounded-lg file:border-0
                file:bg-indigo-600 file:px-4 file:py-2
                file:text-sm file:font-bold
                file:text-white hover:file:bg-indigo-500"
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
