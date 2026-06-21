import type { Beehive } from "./Beehive";

export type Apiary = {
    id: number;
    name: string;
    // location: [number, number] | string;
    location: any; // idk what concrete type of Point is
    description: string;
    imageUrl: string;
    thumbnailUrl: string;
    beekeeperId: number;
    hives?: Beehive[];
}