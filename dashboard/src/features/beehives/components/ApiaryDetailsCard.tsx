import { MapPin, Trash2 } from "lucide-react";
import { CreateBeehiveModal } from "./CreateBeehiveModal";
import type { ApiaryDto } from "../models/Apiary";
import type { Beehive } from "../models/Beehive";
import noImage from "../../../assets/no-image.svg";

function imageOrFallback(src?: string) {
  return src?.trim() ? src : noImage;
}

interface ApiaryDetailsCardProps {
  apiary: ApiaryDto;
  hiveCount: number;
  onDeleteApiary: (apiaryId: string) => void;
  onHiveCreated: (hive: Beehive) => void;
}

export function ApiaryDetailsCard({ apiary, hiveCount, onDeleteApiary, onHiveCreated }: ApiaryDetailsCardProps) {
  return (
    <div className="mb-5">
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
        <div className="flex flex-col md:flex-row min-h-64">
          <div className="p-5 md:w-[320px] shrink-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 shadow-inner">
              <img
                src={imageOrFallback(apiary.imageUrl)}
                alt={apiary.imageUrl ? `${apiary.name} apiary` : "No apiary image available"}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = noImage;
                }}
              />
            </div>
          </div>
          <div className="flex w-full flex-col justify-between gap-5 p-5 pt-0 md:pt-5 md:pl-0">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-slate-100">{apiary.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    {apiary.description || "No description available."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 border border-amber-500/20">
                    {hiveCount} {hiveCount === 1 ? "hive" : "hives"}
                  </span>
                  <div className="w-auto">
                    <CreateBeehiveModal
                      apiaryId={apiary.id}
                      onCreated={onHiveCreated}
                    />
                  </div>
                  <button
                    onClick={() => onDeleteApiary(apiary.id)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-800/40 bg-rose-500/5 px-3 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 transition-all"
                    title="Delete Apiary"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                Coordinates
              </div>
              <p className="mt-2 font-mono text-sm text-slate-300">
                {apiary.latitude.toFixed(5)}, {apiary.longitude.toFixed(5)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
