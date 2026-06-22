import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";
import { CreateApiaryModal } from "./CreateApiaryModal";

interface ApiaryHeaderProps {
  apiaryCount: number;
  onApiaryCreated: (id: string) => void;
}

export function ApiaryHeader({ apiaryCount, onApiaryCreated }: ApiaryHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <Hexagon className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-200 tracking-tight">My Apiaries</h1>
          <p className="text-slate-400 text-sm">
            {apiaryCount === 0
              ? "No apiaries yet — create your first one below."
              : `${apiaryCount} apiar${apiaryCount === 1 ? "y" : "ies"} registered`}
          </p>
        </div>
      </div>
      <CreateApiaryModal onCreated={(a) => onApiaryCreated(a.id)} />
    </motion.div>
  );
}
