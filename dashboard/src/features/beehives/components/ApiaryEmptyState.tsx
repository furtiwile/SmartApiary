import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";
import { CreateApiaryModal } from "./CreateApiaryModal";
import type { ApiaryDto } from "../models/Apiary";

interface ApiaryEmptyStateProps {
  onCreated: (apiary: ApiaryDto) => void;
}

export function ApiaryEmptyState({ onCreated }: ApiaryEmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30"
    >
      <Hexagon className="h-16 w-16 text-slate-700 mb-4" />
      <p className="text-slate-300 font-semibold text-lg">No apiaries yet</p>
      <p className="text-slate-500 text-sm mt-1 mb-6">Create your first apiary to start tracking hives and telemetry.</p>
      <CreateApiaryModal onCreated={onCreated} />
    </motion.div>
  );
}
