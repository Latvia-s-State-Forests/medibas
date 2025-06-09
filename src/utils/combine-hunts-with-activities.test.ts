import { HuntActivity, HuntActivityType } from "~/types/hunt-activities";
import { Hunt, HuntEventStatus, HuntEventType } from "~/types/hunts";
import mainHunt from "../__mocks__/hunts.json";
import { combineHuntsWithActivities } from "./combine-hunts-with-activities";

const mainActivity: HuntActivity = {
    type: HuntActivityType.StartHunt,
    huntId: 1,
    huntCode: "HUNT-123",
    guid: "1cedb9f5-1226-4b5c-82ff-a85e0d53f492",
    date: "2025-02-11T12:00:00Z",
    status: "pending",
    sentDate: "2025-02-17T07:38:06.899Z",
};

const latestHuntFetchDate = "2025-01-17T08:02:06.789Z";

describe("combineHuntsWithActivities", () => {
    it("should handle empty activities array", () => {
        const result = combineHuntsWithActivities([mainHunt], [], latestHuntFetchDate);
        expect(result).toEqual([mainHunt]);
    });

    it("should ignore activities for hunts not in the hunts array", () => {
        const hunt = {
            ...mainHunt,
            huntEventStatusId: HuntEventStatus.Scheduled,
        };

        const activityForNonExistentHunt: HuntActivity = {
            ...mainActivity,
            huntId: 99,
        };

        const result = combineHuntsWithActivities([hunt], [activityForNonExistentHunt], latestHuntFetchDate);
        expect(result).toEqual([hunt]);
    });

    it("should apply multiple activities to the same hunt in correct order", () => {
        const hunt: Hunt = {
            ...mainHunt,
            huntEventStatusId: HuntEventStatus.Scheduled,
        };

        const startHuntActivity: HuntActivity = { ...mainActivity };
        const pauseHuntActivity: HuntActivity = {
            ...mainActivity,
            type: HuntActivityType.PauseHunt,
        };

        const result = combineHuntsWithActivities([hunt], [startHuntActivity, pauseHuntActivity], latestHuntFetchDate);

        expect(result[0].huntEventStatusId).toBe(HuntEventStatus.Paused);
    });

    describe("Hunt status activities", () => {
        it("should combine hunt with StartHunt activity", () => {
            const hunt: Hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Scheduled,
            };
            const activity: HuntActivity = {
                ...mainActivity,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);
            expect(result[0].huntEventStatusId).toBe(HuntEventStatus.Active);
        });

        it("should combine hunt with EndHunt activity", () => {
            const hunt: Hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Active,
            };
            const activity: HuntActivity = {
                ...mainActivity,
                type: HuntActivityType.EndHunt,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);
            expect(result[0].huntEventStatusId).toBe(HuntEventStatus.Concluded);
        });

        it("should combine hunt with PauseHunt activity", () => {
            const hunt: Hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Active,
            };
            const activity: HuntActivity = {
                ...mainActivity,
                type: HuntActivityType.PauseHunt,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);
            expect(result[0].huntEventStatusId).toBe(HuntEventStatus.Paused);
        });

        it("should combine hunt with ResumeHunt activity", () => {
            const hunt: Hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Paused,
            };
            const activity: HuntActivity = {
                ...mainActivity,
                type: HuntActivityType.ResumeHunt,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);
            expect(result[0].huntEventStatusId).toBe(HuntEventStatus.Active);
        });
    });

    describe("Hunter activities", () => {
        const hunter = {
            personId: 1,
            guid: "x",
            fullName: "Jānis Bērziņš",
            huntersCardNumber: "CC1",
            statusId: HuntEventStatus.Scheduled,
        };

        const hunterActivity: HuntActivity = {
            ...mainActivity,
            type: HuntActivityType.AddRegisteredHunter,
            participantGuid: "x",
            personId: 1,
            fullName: "Jānis Bērziņš",
            huntersCardNumber: "CC1",
        };

        it("should combine active hunt with AddRegisteredHunter activity", () => {
            const activity: HuntActivity = {
                ...hunterActivity,
            };

            const result = combineHuntsWithActivities([mainHunt], [activity], latestHuntFetchDate);
            expect(result[0].hunters).toEqual([
                {
                    ...hunter,
                    statusId: HuntEventStatus.Active,
                },
            ]);
        });

        it("should combine scheduled hunt with AddRegisteredHunter activity", () => {
            const hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Scheduled,
            };

            const activity: HuntActivity = {
                ...hunterActivity,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);
            expect(result[0].hunters).toEqual([
                {
                    guid: "x",
                    personId: 1,
                    statusId: HuntEventStatus.Scheduled,
                    fullName: "Jānis Bērziņš",
                    huntersCardNumber: "CC1",
                },
            ]);
        });

        it("should combine scheduled hunt with DeleteRegisteredHunter activity", () => {
            const hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Scheduled,
                hunters: [hunter],
            };
            const activity: HuntActivity = {
                ...hunterActivity,
                type: HuntActivityType.DeleteRegisteredHunter,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);

            expect(result[0].hunters).toEqual([]);
        });

        it("should combine active hunt with DeleteRegisteredHunter activity", () => {
            const hunt = {
                ...mainHunt,
                hunters: [hunter],
            };
            const activity: HuntActivity = {
                ...hunterActivity,
                type: HuntActivityType.DeleteRegisteredHunter,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);

            expect(result[0].hunters).toEqual([
                {
                    ...hunter,
                    statusId: HuntEventStatus.PausedForParticipants,
                },
            ]);
        });

        it("should combine hunt with AddGuestHunter activity", () => {
            const activity: HuntActivity = {
                ...hunterActivity,
                type: HuntActivityType.AddGuestHunter,
                participantGuid: "cx",
                fullName: "Andrew Ericson",
                guestHuntersCardNumber: "HH1",
            };

            const result = combineHuntsWithActivities([mainHunt], [activity], latestHuntFetchDate);

            expect(result[0].guestHunters).toEqual([
                {
                    guid: "cx",
                    fullName: "Andrew Ericson",
                    statusId: HuntEventStatus.Active,
                    guestHuntersCardNumber: "HH1",
                },
            ]);
        });
    });

    describe("Beater activities", () => {
        const beater = {
            guid: "cs",
            userId: 23,
            statusId: HuntEventStatus.Scheduled,
            fullName: "Jānis Avots",
        };

        const guestBeater = {
            guid: "cs",
            statusId: HuntEventStatus.Scheduled,
            fullName: "Jānis Zirnis",
        };

        const beaterActivity: HuntActivity = {
            ...mainActivity,
            type: HuntActivityType.AddRegisteredBeater,
            participantGuid: "cs",
            userId: 23,
            fullName: "Jānis Avots",
        };

        it("should combine active hunt with AddRegisteredBeater activity", () => {
            const activity: HuntActivity = {
                ...beaterActivity,
            };

            const result = combineHuntsWithActivities([mainHunt], [activity], latestHuntFetchDate);

            expect(result[0].beaters).toEqual([
                {
                    guid: "cs",
                    userId: 23,
                    statusId: HuntEventStatus.Active,
                    fullName: "Jānis Avots",
                },
            ]);
        });

        it("should combine scheduled hunt with AddRegisteredBeater activity", () => {
            const hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Scheduled,
                beaters: [beater],
            };

            const activity: HuntActivity = {
                ...beaterActivity,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);

            expect(result[0].beaters).toEqual([
                {
                    guid: "cs",
                    userId: 23,
                    statusId: HuntEventStatus.Scheduled,
                    fullName: "Jānis Avots",
                },
            ]);
        });

        it("should combine active hunt with DeleteRegisteredBeater activity by adding it to PausedForParticipants", () => {
            const hunt = {
                ...mainHunt,
                beaters: [
                    {
                        ...beater,
                        statusId: HuntEventStatus.Active,
                    },
                ],
            };

            const activity: HuntActivity = {
                ...beaterActivity,
                type: HuntActivityType.DeleteRegisteredBeater,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);

            expect(result[0].beaters).toEqual([
                {
                    ...beater,
                    statusId: HuntEventStatus.PausedForParticipants,
                },
            ]);
        });

        it("should combine scheduled hunt with DeleteRegisteredBeater activity by removing the member", () => {
            const hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Scheduled,
                beaters: [beater],
            };

            const activity: HuntActivity = {
                ...beaterActivity,
                type: HuntActivityType.DeleteRegisteredBeater,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);

            expect(result[0].beaters).toEqual([]);
        });

        it("should combine active hunt with AddGuestBeater activity", () => {
            const activity: HuntActivity = {
                ...beaterActivity,
                type: HuntActivityType.AddGuestBeater,
            };

            const result = combineHuntsWithActivities([mainHunt], [activity], latestHuntFetchDate);
            expect(result[0].guestBeaters).toEqual([
                {
                    guid: "cs",
                    fullName: "Jānis Avots",
                    statusId: HuntEventStatus.Active,
                },
            ]);
        });

        it("should combine scheduled hunt with AddGuestBeater activity", () => {
            const hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Scheduled,
            };

            const activity: HuntActivity = {
                ...beaterActivity,
                type: HuntActivityType.AddGuestBeater,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);
            expect(result[0].guestBeaters).toEqual([
                {
                    guid: "cs",
                    fullName: "Jānis Avots",
                    statusId: HuntEventStatus.Scheduled,
                },
            ]);
        });

        it("should combine active hunt with DeleteGuestBeater activity by adding it to PausedForParticipants", () => {
            const hunt = {
                ...mainHunt,
                guestBeaters: [{ ...guestBeater, statusId: HuntEventStatus.Active }],
            };

            const activity: HuntActivity = {
                ...beaterActivity,
                type: HuntActivityType.DeleteGuestBeater,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);

            expect(result[0].guestBeaters).toEqual([
                {
                    guid: "cs",
                    fullName: "Jānis Zirnis",
                    statusId: HuntEventStatus.PausedForParticipants,
                },
            ]);
        });

        it("should combine scheduled hunt with DeleteGuestBeater activity by removing the member", () => {
            const hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Scheduled,
                guestBeaters: [
                    {
                        id: 55,
                        guid: "cs",
                        fullName: "Jānis Avots",
                        statusId: HuntEventStatus.Scheduled,
                    },
                ],
            };

            const activity: HuntActivity = {
                ...mainActivity,
                type: HuntActivityType.DeleteGuestBeater,
                participantGuid: "cs",
                fullName: "Jānis Avots",
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);

            expect(result[0].guestBeaters).toEqual([]);
        });
    });

    describe("Dog activities", () => {
        const dog = {
            guid: "vc1",
            dogBreedId: 2,
            count: 3,
        };

        const dogActivity: HuntActivity = {
            ...mainActivity,
            type: HuntActivityType.AddDog,
            dogGuid: "vc1",
            dogBreedId: 2,
            dogCount: 3,
        };

        it("should combine active hunt with AddDog activity", () => {
            const activity: HuntActivity = {
                ...dogActivity,
            };

            const result = combineHuntsWithActivities([mainHunt], [activity], latestHuntFetchDate);

            expect(result[0].dogs).toEqual([dog]);
        });

        it("should combine scheduled hunt with AddDog activity", () => {
            const hunt = {
                ...mainHunt,
                huntEventStatus: HuntEventStatus.Scheduled,
            };

            const activity: HuntActivity = {
                ...dogActivity,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);

            expect(result[0].dogs).toEqual([dog]);
        });

        it("should combine hunt with AddDog activity with other breed and subbreed", () => {
            const activity: HuntActivity = {
                ...dogActivity,
                dogSubbreedId: 3,
                dogBreedOther: "Cita",
                dogCount: 3,
            };

            const result = combineHuntsWithActivities([mainHunt], [activity], latestHuntFetchDate);

            expect(result[0].dogs).toEqual([
                {
                    ...dog,
                    dogBreedOther: "Cita",
                    dogSubbreedId: 3,
                    count: 3,
                },
            ]);
        });

        it("should combine hunt with DeleteDog activity", () => {
            const hunt = {
                ...mainHunt,
                huntEventStatusId: HuntEventStatus.Scheduled,
                dogs: [dog],
            };

            const activity: HuntActivity = {
                ...dogActivity,
                type: HuntActivityType.DeleteDog,
            };

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);
            expect(result[0].dogs).toEqual([]);
        });
    });

    describe("Species and gear individual hunt activities", () => {
        const hunt = {
            ...mainHunt,
            huntEventTypeId: HuntEventType.IndividualHunt,
            targetSpecies: [
                { speciesId: 2, permitTypeId: 5 },
                { speciesId: 2, permitTypeId: 6 },
                { speciesId: 2, permitTypeId: 7 },
                { speciesId: 4 },
            ],
            isSemiAutomaticWeaponUsed: false,
            isLightSourceUsed: false,
            isNightVisionUsed: false,
            isThermalScopeUsed: false,
        };

        const individualHuntGearActivity: HuntActivity = {
            ...mainActivity,
            type: HuntActivityType.AddSpeciesAndGear,
            isSemiAutomaticWeaponUsed: true,
            isLightSourceUsed: true,
            isNightVisionUsed: true,
            isThermalScopeUsed: true,
            targetSpecies: [{ speciesId: 9 }, { speciesId: 10 }],
        };

        it("should combine hunt with AddSpeciesAndGear activity", () => {
            const result = combineHuntsWithActivities([hunt], [individualHuntGearActivity], latestHuntFetchDate);
            expect(result[0].isSemiAutomaticWeaponUsed).toBe(true);
            expect(result[0].isLightSourceUsed).toBe(true);
            expect(result[0].isNightVisionUsed).toBe(true);
            expect(result[0].isThermalScopeUsed).toBe(true);
            expect(result[0].targetSpecies).toEqual([
                { speciesId: 2, permitTypeId: 5 },
                { speciesId: 2, permitTypeId: 6 },
                { speciesId: 2, permitTypeId: 7 },
                { speciesId: 9 },
                { speciesId: 10 },
            ]);
        });
    });

    describe("Activity filtering based on latestHuntFetchDate", () => {
        const hunterActivity: HuntActivity = {
            ...mainActivity,
            type: HuntActivityType.AddRegisteredHunter,
            participantGuid: "x",
            personId: 1,
            fullName: "Jānis Bērziņš",
            huntersCardNumber: "CC1",
            sentDate: "2025-01-17T07:38:06.789Z",
        };

        it("should skip activities if latestHuntFetchDate is newer than sentDate", () => {
            const latestHuntFetchDate = "2025-02-17T08:02:06.789Z";

            const result = combineHuntsWithActivities([mainHunt], [hunterActivity], latestHuntFetchDate);
            expect(result[0].hunters).toEqual([]);
        });

        it("should not skip activity if sentDate is undefined", () => {
            const hunt: Hunt = {
                ...mainHunt,
                huntEventTypeId: HuntEventType.IndividualHunt,
            };
            const activity: HuntActivity = {
                ...hunterActivity,
                sentDate: undefined,
            };

            const latestHuntFetchDate = "2025-02-17T08:02:06.789Z";

            const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);
            expect(result[0].hunters).toEqual([
                {
                    guid: "x",
                    personId: 1,
                    statusId: HuntEventStatus.Active,
                    fullName: "Jānis Bērziņš",
                    huntersCardNumber: "CC1",
                },
            ]);
        });
    });
});
