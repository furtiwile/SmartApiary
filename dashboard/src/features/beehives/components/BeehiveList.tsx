import type { Beehive } from "../models/Beehive";
import { BeehiveRow } from "./BeehiveRow";

type BeehiveListProps = {
  beehives: Beehive[];
};

export function BeehiveList({ beehives }: BeehiveListProps) {
  return (
    <>
      {beehives.map((beehive) => (
        <BeehiveRow key={beehive.id} beehive={beehive} />
      ))}
    </>
  );
}
