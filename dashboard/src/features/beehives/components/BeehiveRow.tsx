import type { Beehive } from "../models/Beehive";

type BeehiveRowProps = {
  beehive: Beehive;
}

export function BeehiveRow({ beehive }: BeehiveRowProps) {
  return <>
    <tr className={`group border-b border-slate-800 transition-colors
      hover:bg-slate-800/40`}
    >
      {/* Beehive ID & Thumbnail */}
      <td className="px-6 py-4 align-middle text-left">
        <div className="flex items-center gap-4">
          {/*<div
            className={`w-2.5 h-2.5 rounded-full relative shrink-0 ${
              device.isOnline
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : "bg-red-500"
            }`}
          >
            {device.isOnline && (
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            )}
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-sm font-bold text-slate-200 tracking-tight">
              {device.deviceId.slice(0, 8)}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              ID Code
            </span>
          </div>*/}
        </div>
      </td>

      {/* Type */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{beehive.type}</span>
      </td>

      {/* Geo location & terrain desc */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{beehive.designation}</span>
      </td>

      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{beehive.terrainDescription}</span>
      </td>
    </tr>
  </>;
}