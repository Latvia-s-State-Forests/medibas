import { HuntSpecies } from "~/api";

export const enum HuntActivityType {
    StartHunt = 1,
    PauseHunt = 2,
    ResumeHunt = 3,
    EndHunt = 4,
    AddRegisteredHunter = 5,
    DeleteRegisteredHunter = 6,
    AddGuestHunter = 7,
    DeleteGuestHunter = 8,
    AddRegisteredBeater = 9,
    DeleteRegisteredBeater = 10,
    AddGuestBeater = 11,
    DeleteGuestBeater = 12,
    AddDog = 13,
    DeleteDog = 14,
    AddSpeciesAndGear = 17,
}

export type HuntActivity = {
    huntId: number;
    huntCode: string;
    guid: string;
    date: string;
    sentDate?: string;
    status: "pending" | "active" | "success" | "failure";
} & (
    | { type: HuntActivityType.StartHunt }
    | { type: HuntActivityType.PauseHunt }
    | { type: HuntActivityType.ResumeHunt }
    | { type: HuntActivityType.EndHunt }
    | {
          type: HuntActivityType.AddRegisteredHunter | HuntActivityType.DeleteRegisteredHunter;
          participantGuid: string;
          personId: number;
          fullName: string;
          huntersCardNumber: string;
      }
    | {
          type: HuntActivityType.AddGuestHunter | HuntActivityType.DeleteGuestHunter;
          participantGuid: string;
          fullName: string;
          guestHuntersCardNumber: string;
      }
    | {
          type: HuntActivityType.AddRegisteredBeater | HuntActivityType.DeleteRegisteredBeater;
          participantGuid: string;
          userId: number;
          fullName: string;
          personId?: number;
      }
    | {
          type: HuntActivityType.AddGuestBeater | HuntActivityType.DeleteGuestBeater;
          participantGuid: string;
          fullName: string;
      }
    | {
          type: HuntActivityType.AddDog;
          dogGuid: string;
          dogBreedId: number;
          dogSubbreedId?: number;
          dogBreedOther?: string;
          dogCount: number;
      }
    | {
          type: HuntActivityType.DeleteDog;
          dogGuid: string;
          dogBreedId: number;
          dogSubbreedId?: number;
          dogBreedOther?: string;
      }
    | {
          type: HuntActivityType.AddSpeciesAndGear;
          targetSpecies: HuntSpecies[];
          isSemiAutomaticWeaponUsed: boolean;
          isNightVisionUsed: boolean;
          isLightSourceUsed: boolean;
          isThermalScopeUsed: boolean;
      }
);

// A type that let's us keep the union structure of a type while omitting some field
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

export type SimplifiedHuntActivity = DistributiveOmit<HuntActivity, "guid" | "date" | "status">;

export type HuntActivitiesRequestActivity = {
    guid: string;
    date: string;
} & (
    | { type: HuntActivityType.StartHunt }
    | { type: HuntActivityType.PauseHunt }
    | { type: HuntActivityType.ResumeHunt }
    | { type: HuntActivityType.EndHunt }
    | { type: HuntActivityType.AddRegisteredHunter; participantGuid: string; personId: number }
    | { type: HuntActivityType.DeleteRegisteredHunter; participantGuid: string }
    | {
          type: HuntActivityType.AddGuestHunter;
          participantGuid: string;
          fullName: string;
          guestHuntersCardNumber: string;
      }
    | { type: HuntActivityType.DeleteGuestHunter; participantGuid: string }
    | { type: HuntActivityType.AddRegisteredBeater; participantGuid: string; userId: number; fullName: string }
    | { type: HuntActivityType.DeleteRegisteredBeater; participantGuid: string }
    | { type: HuntActivityType.AddGuestBeater; participantGuid: string; fullName: string }
    | { type: HuntActivityType.DeleteGuestBeater; participantGuid: string }
    | {
          type: HuntActivityType.AddDog;
          dogGuid: string;
          dogBreedId: number;
          dogSubbreedId?: number;
          dogBreedOther?: string;
          dogCount: number;
      }
    | {
          type: HuntActivityType.DeleteDog;
          dogGuid: string;
          dogBreedId: number;
          dogSubbreedId?: number;
          dogBreedOther?: string;
      }
    | {
          type: HuntActivityType.AddSpeciesAndGear;
          targetSpecies: HuntSpecies[];
          isSemiAutomaticWeaponUsed: boolean;
          isNightVisionUsed: boolean;
          isLightSourceUsed: boolean;
          isThermalScopeUsed: boolean;
      }
);

export type HuntActivitiesRequest = {
    eventId: number;
    activities: HuntActivitiesRequestActivity[];
};
