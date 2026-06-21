import React from "react";
import type { BeehiveInspection } from "../models/BeehiveInspection";
import { BeehiveInspectionRow } from "./BeehiveInspectionRow";

type BeehiveInspectionListProps = {
  inspections: BeehiveInspection[];
};

export function BeehiveInspectionList({ inspections }: BeehiveInspectionListProps) {
  return (
    <>
      {inspections.map((inspection) => (
        <BeehiveInspectionRow key={inspection.id} inspection={inspection} />
      ))}
    </>
  );
}
