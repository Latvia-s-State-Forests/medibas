import * as React from "react";
import { useTranslation } from "react-i18next";
import { LargeIconName } from "~/components/icon";
import { configuration } from "~/configuration";
import {
    Classifiers,
    HuntedTypeId,
    HuntingSeasonsClassifierOption,
    PermitTypeClassifierOption,
    SpeciesId,
    SpeciesClassifierOption,
} from "~/types/classifiers";
import { LimitedSpecies, LimitedSpeciesType, LimitedSpeciesGender, UnlimitedSpecies } from "~/types/hunt";
import { formatLabel } from "~/utils/format-label";
import { isSpeciesValidForInjured } from "~/utils/hunt";

interface SpeciesResult {
    limitedSpecies: LimitedSpecies[];
    unlimitedSpecies: UnlimitedSpecies[];
    limitedUnlimitedSpecies: LimitedSpecies[];
}

export function useSpecies(classifiers?: Classifiers): SpeciesResult {
    //rerun on language changes
    useTranslation();
    if (!classifiers) {
        return { limitedSpecies: [], unlimitedSpecies: [], limitedUnlimitedSpecies: [] };
    }

    const limitedSpeciesClassifier = classifiers.animalSpecies.options.filter((animalSpecies) => {
        if (animalSpecies.isLimited && classifiers.speciesProfiles) {
            const speciesProfile = classifiers.speciesProfiles.options.find(
                (speciesProfileId) => speciesProfileId.id === animalSpecies.speciesProfileId
            );
            return speciesProfile?.isForDistrictMembersOnly && speciesProfile?.showPermitCount;
        }
        return false;
    });

    const unlimitedSpeciesClassifier = classifiers.animalSpecies.options.filter((animalSpecies) => {
        if (classifiers.speciesProfiles && !animalSpecies.isLimited) {
            const speciesProfile = classifiers.speciesProfiles.options.find(
                (speciesProfileId) => speciesProfileId.id === animalSpecies.speciesProfileId
            );

            return !speciesProfile?.isForDistrictMembersOnly;
        }

        return false;
    });

    const limitedUnlimitedSpeciesClassifier = classifiers.animalSpecies.options.filter((animalSpecies) => {
        if (classifiers.speciesProfiles && animalSpecies.isLimited) {
            const speciesProfile = classifiers.speciesProfiles.options.find(
                (speciesProfileId) => speciesProfileId.id === animalSpecies.speciesProfileId
            );

            return speciesProfile?.isForDistrictMembersOnly && !speciesProfile.showPermitCount;
        }

        return false;
    });

    const limitedSpecies: LimitedSpecies[] = getLimitedSpecies(limitedSpeciesClassifier, classifiers);
    const unlimitedSpecies: UnlimitedSpecies[] = getUnlimitedSpecies(unlimitedSpeciesClassifier, classifiers);
    const limitedUnlimitedSpecies: LimitedSpecies[] = getLimitedSpecies(limitedUnlimitedSpeciesClassifier, classifiers);

    return { limitedSpecies, unlimitedSpecies, limitedUnlimitedSpecies };
}

export const SpeciesContext = React.createContext<SpeciesResult | null>(null);

export function useSpeciesContext() {
    const context = React.useContext(SpeciesContext);

    if (context === null) {
        throw new Error("SpeciesContext not initialized");
    }

    return context;
}

function getSpeciesTypesFromPermits(
    classifiers: Classifiers,
    permitType: PermitTypeClassifierOption
): LimitedSpeciesType[] | undefined {
    const permitAllowances = classifiers.permitAllowances.options.filter(
        (permitAllowance) => permitAllowance.permitTypeId === permitType.id
    );

    const findPermitTypeSpecies = classifiers.permitTypes.options.find((huntedType) =>
        classifiers.animalSpecies.options.some((apt) => apt.id === huntedType.speciesId)
    );

    const permitTypeSpeciesId = findPermitTypeSpecies?.speciesId ?? 0;

    let defaultType = classifiers.huntedTypes.defaultValue;
    const defaultPermitAllowance = permitAllowances.find((permitAllowance) => permitAllowance.isDefault);
    if (defaultPermitAllowance) {
        defaultType = isSpeciesValidForInjured(permitTypeSpeciesId)
            ? defaultPermitAllowance.isValidForKilled
                ? HuntedTypeId.Hunted
                : HuntedTypeId.Injured
            : HuntedTypeId.Hunted;
    }

    const types: LimitedSpeciesType[] = classifiers.huntedTypes.options?.flatMap((type) => {
        if (type.id === HuntedTypeId.Injured && !isSpeciesValidForInjured(permitTypeSpeciesId)) {
            return [];
        }

        const genders: LimitedSpeciesGender[] = [];
        const filteredPermitAllowances = permitAllowances.filter((permitAllowance) =>
            type.id === HuntedTypeId.Hunted ? permitAllowance.isValidForKilled : true
        );
        filteredPermitAllowances.forEach((permitAllowance) => {
            const gender = genders.find((gender) => gender.id === permitAllowance.genderId) ?? {
                id: permitAllowance.genderId,
            };
            if (!gender.ages) {
                gender.ages = [];
            }
            gender.ages.push({
                id: permitAllowance.ageId,
                isDefault: permitAllowance.isDefault,
            });

            if (!gender.isDefault) {
                gender.isDefault = permitAllowance.isDefault;
            }

            if (!genders.find((gender) => gender.id === permitAllowance.genderId)) {
                genders.push(gender);
            }
        });

        return [
            {
                id: type.id,
                isDefault: defaultType ? defaultType === type.id : false,
                genders,
            },
        ];
    });

    return types;
}

function getTermStringFromPermitTypeArray(permitTypes: PermitTypeClassifierOption[]): string | undefined {
    if (permitTypes.length === 0) {
        return undefined;
    }
    if (permitTypes.length === 1) {
        return getTermStringFromPermitType(permitTypes[0]);
    }

    const sortedPermitTypes = [...permitTypes];

    const earliestStartPermitType = sortedPermitTypes.sort(
        (a, b) =>
            (a.seasonStartMonth ?? Infinity) - (b.seasonStartMonth ?? Infinity) ||
            (a.seasonStartDay ?? Infinity) - (b.seasonStartDay ?? Infinity)
    )[0];

    const latestEndPermitType = sortedPermitTypes.sort(
        (a, b) =>
            (b.seasonEndMonth ?? Infinity) - (a.seasonEndMonth ?? Infinity) ||
            (b.seasonEndDay ?? Infinity) - (a.seasonEndDay ?? Infinity)
    )[0];

    return getTermStringFromSeasonDays(
        earliestStartPermitType.seasonStartDay,
        earliestStartPermitType.seasonStartMonth,
        latestEndPermitType.seasonEndDay,
        latestEndPermitType.seasonEndMonth
    );
}

function getTermStringFromPermitType(permitType: PermitTypeClassifierOption): string | undefined {
    return getTermStringFromSeasonDays(
        permitType.seasonStartDay,
        permitType.seasonStartMonth,
        permitType.seasonEndDay,
        permitType.seasonEndMonth
    );
}

function getTermStringFromHuntingSeasonArray(huntingSeasons: HuntingSeasonsClassifierOption[]): string | undefined {
    if (huntingSeasons.length === 0) {
        return undefined;
    }
    if (huntingSeasons.length === 1) {
        return getTermStringFromHuntingSeason(huntingSeasons[0]);
    }

    const sortedHuntingSeasons = [...huntingSeasons];

    const earliestStartHuntingSeason = sortedHuntingSeasons.sort(
        (a, b) =>
            (a.seasonStartMonth ?? Infinity) - (b.seasonStartMonth ?? Infinity) ||
            (a.seasonStartDay ?? Infinity) - (b.seasonStartDay ?? Infinity)
    )[0];

    const latestEndHuntingSeason = sortedHuntingSeasons.sort(
        (a, b) =>
            (b.seasonEndMonth ?? Infinity) - (a.seasonEndMonth ?? Infinity) ||
            (b.seasonEndDay ?? Infinity) - (a.seasonEndDay ?? Infinity)
    )[0];

    return getTermStringFromSeasonDays(
        earliestStartHuntingSeason.seasonStartDay,
        earliestStartHuntingSeason.seasonStartMonth,
        latestEndHuntingSeason.seasonEndDay,
        latestEndHuntingSeason.seasonEndMonth
    );
}

function getTermStringFromHuntingSeason(huntingSeason: HuntingSeasonsClassifierOption): string | undefined {
    return getTermStringFromSeasonDays(
        huntingSeason.seasonStartDay,
        huntingSeason.seasonStartMonth,
        huntingSeason.seasonEndDay,
        huntingSeason.seasonEndMonth
    );
}

function getTermStringFromSeasonDays(
    startDay: number,
    startMonth: number,
    endDay: number,
    endMonth: number
): string | undefined {
    if (startDay === 1 && startMonth === 1 && endDay === 31 && endMonth === 12) {
        return undefined;
    }
    return `${startDay.toString().padStart(2, "0")}.${startMonth.toString().padStart(2, "0")}. - ${endDay
        .toString()
        .padStart(2, "0")}.${endMonth.toString().padStart(2, "0")}.`;
}

function getLimitedSpecies(limitedSpeciesClassifier: SpeciesClassifierOption[], classifiers: Classifiers) {
    return limitedSpeciesClassifier
        .sort((a, b) => {
            const orderA = a.listOrderHunt ?? Infinity;
            const orderB = b.listOrderHunt ?? Infinity;

            if (orderA === Infinity && orderB === Infinity) {
                return (a.description.lv ?? "").localeCompare(b.description.lv ?? "");
            }

            return orderA - orderB;
        })
        .map((species) => {
            const speciesIcon: LargeIconName = configuration.hunt.speciesIcons[species.id as SpeciesId] ?? "animals";
            const permitTypes = classifiers.permitTypes.options.filter(
                (permitType) => permitType.speciesId === species.id
            );
            const speciesTerm = getTermStringFromPermitTypeArray(permitTypes);
            const speciesTypes = permitTypes.length > 0 ? getSpeciesTypesFromPermits(classifiers, permitTypes[0]) : [];
            const speciesPermitTypeId = permitTypes.length === 1 ? permitTypes[0].id : 0;

            let subSpecies: Array<Omit<LimitedSpecies, "subspecies">> | undefined;
            if (permitTypes.length > 1) {
                subSpecies = permitTypes.map((permitType) => {
                    const subspeciesTerm = getTermStringFromPermitType(permitType);
                    const subspeciesTypes = getSpeciesTypesFromPermits(classifiers, permitType);

                    return {
                        id: species.id,
                        permitTypeId: permitType.id,
                        icon: speciesIcon,
                        description: permitType.description,
                        term: subspeciesTerm,
                        types: subspeciesTypes,
                    };
                });
            }

            return {
                id: species.id,
                permitTypeId: speciesPermitTypeId,
                description: species.description,
                icon: speciesIcon,
                subspecies: subSpecies,
                term: speciesTerm,
                types: speciesTypes,
            };
        });
}

function getUnlimitedSpecies(unlimitedSpeciesClassifier: SpeciesClassifierOption[], classifiers: Classifiers) {
    return unlimitedSpeciesClassifier
        .filter((species) => species.isMainGroupHunt)
        .sort((a, b) => (a.listOrderHunt ?? Infinity) - (b.listOrderHunt ?? Infinity))
        .map((species) => {
            const speciesIcon: LargeIconName = configuration.hunt.speciesIcons[species.id as SpeciesId] ?? "animals";

            const huntingSeason = classifiers.huntingSeasons.options.find(
                (huntingSeason) => huntingSeason.speciesId === species.id
            );
            let speciesTerm: string | undefined = undefined;
            if (huntingSeason) {
                speciesTerm = getTermStringFromHuntingSeason(huntingSeason);
            }

            let subSpecies: Array<{ value: string; label: string }> | undefined;
            const subSpeciesClassifier = unlimitedSpeciesClassifier.filter(
                (subSpecies) => subSpecies.subspeciesOfId === species.id
            );
            if (subSpeciesClassifier.length) {
                subSpecies = subSpeciesClassifier
                    .map((subSpecies) => {
                        return {
                            value: String(subSpecies.id),
                            label: formatLabel(subSpecies.description),
                        };
                    })
                    .sort((a, b) => {
                        const aSubSpecies = subSpeciesClassifier.find(
                            (subSpecies) => subSpecies.id === Number(a.value)
                        );
                        const bSubSpecies = subSpeciesClassifier.find(
                            (subSpecies) => subSpecies.id === Number(b.value)
                        );
                        return (
                            (aSubSpecies?.listOrderHunt ?? Infinity) - (bSubSpecies?.listOrderHunt ?? Infinity) ||
                            a.label.localeCompare(b.label)
                        );
                    });
                if (!huntingSeason) {
                    const subSpeciesIds = subSpeciesClassifier.map((subSpecies) => subSpecies.id);
                    const subSpeciesHuntingSeasons = classifiers.huntingSeasons.options.filter((huntingSeason) =>
                        subSpeciesIds.includes(huntingSeason.speciesId)
                    );
                    speciesTerm = getTermStringFromHuntingSeasonArray(subSpeciesHuntingSeasons);
                }
            }

            return {
                id: species.id,
                description: species.description,
                icon: speciesIcon,
                subspecies: subSpecies,
                term: speciesTerm,
            };
        });
}
