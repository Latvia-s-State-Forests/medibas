import { produce } from "immer";
import { configuration } from "~/configuration";
import { HuntActivity, HuntActivityType } from "~/types/hunt-activities";
import { Hunt, HuntEventStatus } from "~/types/hunts";

export function combineHuntsWithActivities(
    hunts: Hunt[],
    activities: HuntActivity[],
    latestHuntsRequestStartedAtDate: string | undefined
): Hunt[] {
    if (activities.length === 0) {
        return hunts;
    }

    const huntsRequestStartedAtDate = latestHuntsRequestStartedAtDate
        ? new Date(latestHuntsRequestStartedAtDate)
        : new Date(0);

    const huntById = new Map<number, Hunt>();
    for (const hunt of hunts) {
        if (hunt.id) {
            huntById.set(hunt.id, hunt);
        }
    }

    for (const activity of activities) {
        // skips activities if the latest hunts request started at date is newer than the sent date, but don't skip if
        // sentDate is missing
        const activityDate = activity.sentDate ? new Date(activity.sentDate) : undefined;
        if (activityDate && activityDate < huntsRequestStartedAtDate) {
            continue;
        }

        const hunt = huntById.get(activity.huntId);
        if (!hunt) {
            continue;
        }

        const updatedHunt = produce(hunt, (hunt) => {
            switch (activity.type) {
                case HuntActivityType.StartHunt: {
                    if (hunt.huntEventStatusId === HuntEventStatus.Scheduled) {
                        hunt.huntEventStatusId = HuntEventStatus.Active;
                    }
                    // TODO should we change participant statuses?
                    break;
                }
                case HuntActivityType.PauseHunt: {
                    if (hunt.huntEventStatusId === HuntEventStatus.Active) {
                        hunt.huntEventStatusId = HuntEventStatus.Paused;
                    }
                    break;
                }
                case HuntActivityType.ResumeHunt: {
                    if (hunt.huntEventStatusId === HuntEventStatus.Paused) {
                        hunt.huntEventStatusId = HuntEventStatus.Active;
                    }
                    break;
                }
                case HuntActivityType.EndHunt: {
                    if (
                        hunt.huntEventStatusId === HuntEventStatus.Active ||
                        hunt.huntEventStatusId === HuntEventStatus.Paused
                    ) {
                        hunt.huntEventStatusId = HuntEventStatus.Concluded;
                    }
                    // TODO should we change participant statuses?
                    break;
                }
                case HuntActivityType.AddRegisteredHunter: {
                    const statusId =
                        hunt.huntEventStatusId === HuntEventStatus.Scheduled
                            ? HuntEventStatus.Scheduled
                            : HuntEventStatus.Active;
                    const hunter = hunt.hunters.find((hunter) => hunter.guid === activity.participantGuid);
                    if (hunter) {
                        hunter.statusId = statusId;
                    } else {
                        hunt.hunters.push({
                            guid: activity.participantGuid,
                            personId: activity.personId,
                            fullName: activity.fullName,
                            huntersCardNumber: activity.huntersCardNumber,
                            statusId,
                        });
                    }
                    break;
                }
                case HuntActivityType.DeleteRegisteredHunter: {
                    if (hunt.huntEventStatusId === HuntEventStatus.Scheduled) {
                        hunt.hunters = hunt.hunters.filter((hunter) => hunter.guid !== activity.participantGuid);
                    } else {
                        for (const hunter of hunt.hunters) {
                            if (hunter.guid === activity.participantGuid) {
                                hunter.statusId = HuntEventStatus.PausedForParticipants;
                                break;
                            }
                        }
                    }
                    break;
                }
                case HuntActivityType.AddGuestHunter: {
                    const statusId =
                        hunt.huntEventStatusId === HuntEventStatus.Scheduled
                            ? HuntEventStatus.Scheduled
                            : HuntEventStatus.Active;
                    const guestHunter = hunt.guestHunters.find(
                        (guestHunter) => guestHunter.guid === activity.participantGuid
                    );
                    if (guestHunter) {
                        guestHunter.statusId = statusId;
                    } else {
                        hunt.guestHunters.push({
                            guid: activity.participantGuid,
                            fullName: activity.fullName,
                            guestHuntersCardNumber: activity.guestHuntersCardNumber,
                            statusId,
                        });
                    }
                    break;
                }
                case HuntActivityType.DeleteGuestHunter: {
                    if (hunt.huntEventStatusId === HuntEventStatus.Scheduled) {
                        hunt.guestHunters = hunt.guestHunters.filter(
                            (guestHunter) => guestHunter.guid !== activity.participantGuid
                        );
                    } else {
                        for (const guestHunter of hunt.guestHunters) {
                            if (guestHunter.guid === activity.participantGuid) {
                                guestHunter.statusId = HuntEventStatus.PausedForParticipants;
                                break;
                            }
                        }
                    }
                    break;
                }
                case HuntActivityType.AddRegisteredBeater: {
                    const statusId =
                        hunt.huntEventStatusId === HuntEventStatus.Scheduled
                            ? HuntEventStatus.Scheduled
                            : HuntEventStatus.Active;
                    const beater = hunt.beaters.find((beater) => beater.guid === activity.participantGuid);
                    if (beater) {
                        beater.statusId = statusId;
                    } else {
                        hunt.beaters.push({
                            guid: activity.participantGuid,
                            userId: activity.userId,
                            hunterPersonId: activity.personId,
                            fullName: activity.fullName,
                            statusId,
                        });
                    }
                    break;
                }
                case HuntActivityType.DeleteRegisteredBeater: {
                    if (hunt.huntEventStatusId === HuntEventStatus.Scheduled) {
                        hunt.beaters = hunt.beaters.filter((beater) => beater.guid !== activity.participantGuid);
                    } else {
                        for (const beater of hunt.beaters) {
                            if (beater.guid === activity.participantGuid) {
                                beater.statusId = HuntEventStatus.PausedForParticipants;
                                break;
                            }
                        }
                    }
                    break;
                }
                case HuntActivityType.AddGuestBeater: {
                    const statusId =
                        hunt.huntEventStatusId === HuntEventStatus.Scheduled
                            ? HuntEventStatus.Scheduled
                            : HuntEventStatus.Active;
                    const guestBeater = hunt.guestBeaters.find(
                        (guestBeater) => guestBeater.guid === activity.participantGuid
                    );
                    if (guestBeater) {
                        guestBeater.statusId = statusId;
                    } else {
                        hunt.guestBeaters.push({
                            guid: activity.participantGuid,
                            fullName: activity.fullName,
                            statusId,
                        });
                    }
                    break;
                }
                case HuntActivityType.DeleteGuestBeater: {
                    if (hunt.huntEventStatusId === HuntEventStatus.Scheduled) {
                        hunt.guestBeaters = hunt.guestBeaters.filter(
                            (guestBeater) => guestBeater.guid !== activity.participantGuid
                        );
                    } else {
                        for (const guestBeater of hunt.guestBeaters) {
                            if (guestBeater.guid === activity.participantGuid) {
                                guestBeater.statusId = HuntEventStatus.PausedForParticipants;
                                break;
                            }
                        }
                    }
                    break;
                }
                case HuntActivityType.AddDog: {
                    const dog = hunt.dogs.find((dog) => dog.guid === activity.dogGuid);
                    if (dog) {
                        dog.count = activity.dogCount;
                    } else {
                        hunt.dogs.push({
                            guid: activity.dogGuid,
                            dogBreedId: activity.dogBreedId,
                            dogSubbreedId: activity.dogSubbreedId,
                            dogBreedOther: activity.dogBreedOther,
                            count: activity.dogCount,
                        });
                    }
                    break;
                }
                case HuntActivityType.DeleteDog: {
                    if (hunt.huntEventStatusId === HuntEventStatus.Scheduled) {
                        hunt.dogs = hunt.dogs.filter((dog) => dog.guid !== activity.dogGuid);
                    }
                    break;
                }
                case HuntActivityType.AddSpeciesAndGear: {
                    const plannedSpecies = configuration.hunt.plannedSpeciesUsingEquipment;

                    hunt.targetSpecies = hunt.targetSpecies.filter(
                        (species) => !plannedSpecies.includes(species.speciesId)
                    );

                    for (const targetSpecies of activity.targetSpecies) {
                        if (plannedSpecies.includes(targetSpecies.speciesId)) {
                            hunt.targetSpecies.push(targetSpecies);
                        }
                    }

                    hunt.isSemiAutomaticWeaponUsed = activity.isSemiAutomaticWeaponUsed;
                    hunt.isLightSourceUsed = activity.isLightSourceUsed;
                    hunt.isNightVisionUsed = activity.isNightVisionUsed;
                    hunt.isThermalScopeUsed = activity.isThermalScopeUsed;
                    break;
                }
            }
            return hunt;
        });

        if (updatedHunt.id) {
            huntById.set(updatedHunt.id, updatedHunt);
        }
    }

    return [...huntById.values()];
}
