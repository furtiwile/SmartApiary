import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon, ChevronRight, ChevronDown } from "lucide-react";

import { ApiaryDetailsCard } from "./ApiaryDetailsCard";
import { BeehiveTable } from "./BeehiveTable";
import { HiveTelemetryPanel } from "./HiveTelemetryPanel";
import type { ApiaryDto } from "../models/Apiary";
import type { Beehive } from "../models/Beehive";

interface ApiaryTabContentProps {
  apiary: ApiaryDto;
  beehives: Beehive[];
  isLoadingHives: boolean;
  onDeleteApiary: (apiaryId: string) => void;
  onDeleteHive: (hiveId: string) => void;
}

export function ApiaryTabContent({ apiary, beehives, isLoadingHives, onDeleteApiary, onDeleteHive }: ApiaryTabContentProps) {
  const [expandedHiveId, setExpandedHiveId] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ApiaryDetailsCard
        apiary={apiary}
        hiveCount={beehives.length}
        onDeleteApiary={onDeleteApiary}
        onHiveCreated={() => { }} // Hook handles cache
      />

      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 overflow-hidden mb-6">
        {isLoadingHives ? (
          <div className="flex justify-center items-center p-16 gap-3">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-amber-500" />
            <span className="text-slate-400 text-sm">Loading hives…</span>
          </div>
        ) : (
          <BeehiveTable
            beehives={beehives}
            onDelete={onDeleteHive}
          />
        )}
      </div>

      {!isLoadingHives && beehives.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
            Hive Telemetry & Diaries
          </p>
          {beehives.map((hive) => {
            const isExpanded = expandedHiveId === hive.id;
            return (
              <motion.div key={hive.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-700/60 bg-slate-900/60 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpandedHiveId(isExpanded ? null : hive.id)}
                >
                  <div className="flex items-center gap-3">
                    <Hexagon className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-200">{hive.name}</span>
                    {hive.smartScaleId && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${hive.isSmartScaleActivated
                        ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                        : "bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse"
                        }`}>
                        {hive.isSmartScaleActivated ? "Paired" : "Awaiting Activation"}
                      </span>
                    )}
                  </div>
                  {isExpanded
                    ? <ChevronDown className="h-4 w-4 text-slate-600" />
                    : <ChevronRight className="h-4 w-4 text-slate-600" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-800 px-5 py-5">
                      <HiveTelemetryPanel hive={hive} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
