import type { BeehiveInspection } from "../models/BeehiveInspection";

type BeehiveInspectionRowProps = {
  inspection: BeehiveInspection;
}



export function BeehiveInspectionRow({ inspection }: BeehiveInspectionRowProps) {
  return <>
    <tr className={`group border-b border-slate-800 transition-colors
      hover:bg-slate-800/40`}
    >
      {/* Beehive ID */}
      <td className="px-6 py-4 align-middle text-left">
        <div className="flex items-center gap-4">
          <span>{inspection.id}</span>
        </div>
      </td>

      {/* Inspection Date */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        {/* Stupid casting ... */}
        <span >{inspection.inspectionDate as unknown as string}</span>
      </td>

      {/* Bottom Board Color */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{inspection.bottomBoardColor}</span>
      </td>

      {/* Honey Frames */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{inspection.honeyFrames}</span>
      </td>

      {/* Honey Amount */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{inspection.honeyAmount}</span>
      </td>

      {/* Brood Frames */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{inspection.broodFrames}</span>
      </td>

      {/* Is Queen Present */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{inspection.queenPresent ? "Present" : "Absent"}</span>
      </td>

      {/* Note */}
      <td className="px-6 py-4 align-middle text-center">
        {/* TODO: Find proper classes */}
        <span >{inspection.note}</span>
        {/* <span >{beehive.note?.length > 30 ? beehive.note?.substring(0, 30) : beehive.note}</span> */}
      </td>
    </tr>
  </>;
}