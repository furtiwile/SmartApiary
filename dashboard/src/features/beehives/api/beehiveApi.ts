import api from "../../../config/api";
import type { Beehive } from "../models/Beehive";

// TODO: Implement whatever is needed to be fetched
export class BeehiveApi {
  static async getAll(): Promise<Beehive[]> {
    return [];
  }

  static async getFromUser(userId: number): Promise<Beehive[]> {
    return [];
  }

  static async getById(id: number): Promise<number> {
    return -1;
  }

  static async getByApiaryId(entityId: string): Promise<Beehive[]> {
    return [];
  }

  static async update(beehive: Beehive): Promise<Beehive | null> {
    return null;
  }

  static async create(beehive: Beehive): Promise<Beehive | null> {
    return null;
  }

  static async delete(beehiveId: number): Promise<boolean> {
    return false;
  }
}
