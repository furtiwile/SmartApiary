import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useApis } from "../../../shared/api/useApis";

const schema = z.object({
  deviceType: z.string().min(1, "Device Type is required"),
  version: z.string().min(1, "Version is required"),
  firmwareFile: z.any()
    .refine((files) => files?.length == 1, "Firmware file is required.")
    .refine((files) => files?.[0]?.name.endsWith(".bin"), "Firmware file must be a .bin file."),
});

type SchemaType = z.infer<typeof schema>;

interface FirmwareUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export const FirmwareUploadModal: React.FC<FirmwareUploadModalProps> = ({
  open,
  onClose,
}) => {
  const { devices: devicesApi } = useApis();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: { deviceType: "", version: "" },
  });

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  if (!open) return null;

  const onSubmit = async (data: SchemaType) => {
    try {
      await devicesApi.uploadFirmware({
        deviceType: data.deviceType,
        version: data.version,
        firmwareFile: data.firmwareFile[0],
      });
      toast.success("Firmware successfully uploaded!");
      onClose();
    } catch {
      toast.error("Upload failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Upload Firmware
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Device Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Device Type
            </label>
            <select
              {...register("deviceType")}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select device type</option>
              <option value="SolarPanel">Solar Panel</option>
              <option value="WindTurbine">Wind Turbine</option>
            </select>
            {errors.deviceType && <p className="mt-1 text-xs text-rose-500">{errors.deviceType.message as string}</p>}
          </div>

          {/* Version */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Firmware Version
            </label>
            <input
              type="text"
              placeholder="v1.2.3"
              {...register("version")}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.version && <p className="mt-1 text-xs text-rose-500">{errors.version.message as string}</p>}
          </div>

          {/* File */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Firmware File (.bin)
            </label>
            <input
              type="file"
              accept=".bin"
              {...register("firmwareFile")}
              className="w-full text-sm text-slate-400
                file:mr-4 file:rounded-lg file:border-0
                file:bg-indigo-600 file:px-4 file:py-2
                file:text-sm file:font-bold
                file:text-white hover:file:bg-indigo-500"
            />
            {errors.firmwareFile && <p className="mt-1 text-xs text-rose-500">{errors.firmwareFile.message as string}</p>}
          </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20"
          >
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};
