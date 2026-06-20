import React from "react";
import { ApiaryRow } from "./ApiaryRow";
import type { Apiary } from "../models/Apiary";

type ApiaryListProps = {
  apiaries: Apiary[];
};

export function ApiaryList({ apiaries }: ApiaryListProps) {
  return (
    <>
      {apiaries.map((apiary) => (
        <ApiaryRow key={apiary.id} apiary={apiary} />
      ))}
    </>
  );
}
