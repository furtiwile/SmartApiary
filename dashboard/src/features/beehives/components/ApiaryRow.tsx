import React from "react";
import type { Apiary } from "../models/Apiary";

type ApiaryRowProps = {
  apiary: Apiary;
}

export function ApiaryRow({ apiary }: ApiaryRowProps) {
  return <>
    <tr className={`group border-b border-slate-800 transition-colors
      hover:bg-slate-800/40`}
    >
      {/* Apiary ID & Thumbnail */}
      <td className="px-6 py-4 align-middle text-left">
        <div className="flex items-center gap-4">
          <div className="flex flex-col justify-center">
            {/* <span className="text-sm font-bold text-slate-200 tracking-tight">
              {device.deviceId.slice(0, 8)}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              ID Code
            </span> */}
            <span>
              <img src={apiary.thumbnailUrl} alt="" />
            </span>
          </div>
        </div>
      </td>

      {/* Name */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{apiary.name}</span>
      </td>

      {/* Geo location & terrain desc */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        {/* Ironically, those fields exist, despite `Apiary` type not having them
           :face-palm: */}
        <span >{(apiary as any).latitude} x {(apiary as any).longitude}</span>
      </td>

      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{apiary.description}</span>
      </td>
    </tr>
  </>;
}