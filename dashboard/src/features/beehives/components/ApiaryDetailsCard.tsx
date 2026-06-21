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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] mb-5">
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{apiary.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    {apiary.description || "No description available."}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  {hiveCount} {hiveCount === 1 ? "hive" : "hives"}
                </span>
              </div>
            </div>

            <div className="grid gap-3">
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
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Basic Data</p>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="mt-0.5 font-medium text-slate-200">{apiary.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Hives</dt>
              <dd className="mt-0.5 text-slate-300">{hiveCount}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Media</dt>
              <dd className="mt-0.5 text-slate-300">
                {apiary.imageUrl ? "Available" : "[No Image]"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col gap-2">
          <CreateBeehiveModal
            apiaryId={apiary.id}
            onCreated={onHiveCreated}
          />
          <button
            onClick={() => onDeleteApiary(apiary.id)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-800/40 bg-rose-500/5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Apiary
          </button>
        </div>
      </div>
    </div>
  );
}
