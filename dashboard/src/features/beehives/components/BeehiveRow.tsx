import React from "react";
import type { Beehive } from "../models/Beehive";

type BeehiveRowProps = {
  beehive: Beehive;
}

export function BeehiveRow({ beehive }: BeehiveRowProps) {
  return <>
    <tr className={`group border-b border-slate-800 transition-colors
      hover:bg-slate-800/40`}
    >
      {/* Beehive ID*/}
      <td className="px-6 py-4 align-middle text-left">
        <div className="flex items-center gap-4">
          <span>{beehive.id}</span>
        </div>
      </td>

      {/* Type */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{beehive.type}</span>
      </td>

      {/* Designation */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{beehive.designation}</span>
      </td>

      {/* Super Color */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{beehive.superColor}</span>
      </td>

      {/* Queen age */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{beehive.queenAge}</span>
      </td>

      {/* Note */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{beehive.note}</span>
        {/* <span >{beehive.note?.length > 30 ? beehive.note?.substring(0, 30) : beehive.note}</span> */}
      </td>
    </tr>
  </>;
}