import { randomUUID } from "expo-crypto";
import { HuntDog } from "~/api";
import { Hunt, HuntEventStatus, TargetSpecies, Hunter, GuestHunter, Beater, GuestBeater } from "~/types/hunts";
import { MemberRole, Memberships } from "~/types/mtl";

export type DrivenHuntFormState = {
    huntManagerPersonId: number | undefined;
    selectedPosition: GeoJSON.Position | null;
    districts: number[];
    date: Date | undefined;
    time: Date | undefined;
    notesValue: string;
    huntAllSpecies: boolean;
    targetSpecies: TargetSpecies[];
    dogs: HuntDog[];
    hunters: Hunter[];
    guestHunters: GuestHunter[];
    beaters: Beater[];
    guestBeaters: GuestBeater[];
};

export function getDefaultAddDrivenHuntFormState(
    districtId?: number,
    districtOptions: Array<{ label: string; value: number }> = []
): DrivenHuntFormState {
    let districts: number[] = [];

    if (districtOptions.length === 1) {
        districts = [districtOptions[0].value];
    } else if (districtId) {
        districts = [districtId];
    }

    return {
        huntManagerPersonId: undefined,
        selectedPosition: null,
        districts,
        date: undefined,
        time: undefined,
        notesValue: "",
        huntAllSpecies: false,
        targetSpecies: [],
        dogs: [],
        hunters: [],
        guestHunters: [],
        beaters: [],
        guestBeaters: [],
    };
}

export function getDefaultEditDrivenHuntFormState(hunt: Hunt): DrivenHuntFormState {
    const alreadySelectedPosition =
        hunt.meetingPointX !== undefined && hunt.meetingPointY !== undefined
            ? ([hunt.meetingPointX, hunt.meetingPointY] as GeoJSON.Position)
            : null;
    const alreadySetDate = new Date(hunt.plannedFrom);
    const alreadySetTime = hunt.meetingTime ? new Date(hunt.meetingTime) : undefined;
    const alreadySetNotes = hunt.notes;
    const alreadySelectedDistricts = hunt.districts?.map((district) => district.id) ?? [];
    const alreadyAddedHuntManager = hunt.huntManagerPersonId;
    const alreadySetTargetSpecies = !hunt.hasTargetSpecies || false;

    return {
        huntManagerPersonId: alreadyAddedHuntManager,
        selectedPosition: alreadySelectedPosition,
        districts: alreadySelectedDistricts,
        date: alreadySetDate,
        time: alreadySetTime,
        notesValue: alreadySetNotes || "",
        huntAllSpecies: alreadySetTargetSpecies,
        targetSpecies: hunt.targetSpecies,
        dogs: hunt.dogs,
        hunters: hunt.hunters,
        guestHunters: hunt.guestHunters,
        beaters: hunt.beaters,
        guestBeaters: hunt.guestBeaters,
    };
}

export function getDefaultCopyDrivenHuntFormState(hunt: Hunt, memberships: Memberships): DrivenHuntFormState {
    const state = getDefaultAddDrivenHuntFormState();

    if (hunt.notes) {
        state.notesValue = hunt.notes;
    }

    if (hunt.meetingPointX && hunt.meetingPointY) {
        state.selectedPosition = [hunt.meetingPointX, hunt.meetingPointY];
    }

    if (hunt.hasTargetSpecies) {
        state.huntAllSpecies = false;
        state.targetSpecies = hunt.targetSpecies;
    } else {
        state.huntAllSpecies = true;
    }

    // Only copy districts that are available to the user
    for (const membership of memberships) {
        const isDistrictSelected = hunt.districts.some((district) => district.id === membership.id);
        if (isDistrictSelected) {
            state.districts.push(membership.id);
        } else {
            continue;
        }

        // No need to look for more of the same person
        if (state.huntManagerPersonId) {
            continue;
        }

        for (const member of membership.members) {
            if (
                member.id === hunt.huntManagerPersonId &&
                member.roles.includes(MemberRole.Manager) &&
                member.managerCardNumber
            ) {
                state.huntManagerPersonId = member.id;
                break;
            }
        }
    }

    for (const hunter of hunt.hunters) {
        state.hunters.push({
            guid: randomUUID(),
            personId: hunter.personId,
            huntersCardNumber: hunter.huntersCardNumber,
            fullName: hunter.fullName,
            statusId: HuntEventStatus.Scheduled,
        });
    }

    for (const hunter of hunt.guestHunters) {
        state.guestHunters.push({
            guid: randomUUID(),
            guestHuntersCardNumber: hunter.guestHuntersCardNumber,
            fullName: hunter.fullName,
            statusId: HuntEventStatus.Scheduled,
        });
    }

    for (const beater of hunt.beaters) {
        state.beaters.push({
            guid: randomUUID(),
            userId: beater.userId,
            hunterPersonId: beater.hunterPersonId,
            fullName: beater.fullName,
            statusId: HuntEventStatus.Scheduled,
        });
    }

    for (const beater of hunt.guestBeaters) {
        state.guestBeaters.push({
            guid: randomUUID(),
            fullName: beater.fullName,
            statusId: HuntEventStatus.Scheduled,
        });
    }

    for (const dog of hunt.dogs) {
        state.dogs.push({
            guid: randomUUID(),
            dogBreedId: dog.dogBreedId,
            dogSubbreedId: dog.dogSubbreedId,
            dogBreedOther: dog.dogBreedOther,
            count: dog.count,
        });
    }

    return state;
}
