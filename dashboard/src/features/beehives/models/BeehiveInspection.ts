export type BeehiveInspection = {
    id: number;
    inspectionDate: Date;
    bottomBoardColor: string;
    honeyFrames: number;
    honeyAmount: number;
    broodFrames: number;
    queenPresent: boolean;
    note?: string;
    hiveId: number;
}