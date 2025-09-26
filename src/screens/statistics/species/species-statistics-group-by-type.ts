import { configuration } from "~/configuration";
import { AppLanguage } from "~/i18n";
import { Classifiers } from "~/types/classifiers";
import { LimitedSpecies, UnlimitedSpecies } from "~/types/hunt";
import { StatisticsSpeciesItem } from "~/types/statistics";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";

export type LimitedSpeciesGroup = {
    speciesId: number;
    permitTypeId: number;
    count: number;
    permitTypeName: string;
    speciesName: string;
    displayName: string;
    items: StatisticsSpeciesItem[];
};

export type UnlimitedSpeciesGroup = {
    speciesId: number;
    count: number;
    speciesName: string;
    displayName: string;
    items: StatisticsSpeciesItem[];
};

export type UnlimitedWithLimitedUnlimitedGroup = {
    speciesId: number;
    permitTypeId: number;
    count: number;
    speciesName: string;
    displayName: string; // species or permit type name
    items: StatisticsSpeciesItem[];
};

export type BirdSpeciesGroup = {
    speciesId: number;
    count: number;
    speciesName: string;
    items: StatisticsSpeciesItem[];
};

const UNLIMITED_SPECIES_PERMIT_ID = configuration.statistics.unlimitedSpeciesPermitId;

// Helper function to group statistics data by key
function groupStatisticsData<T extends string>(
    statisticsData: StatisticsSpeciesItem[],
    getKey: (item: StatisticsSpeciesItem) => T
): Record<T, StatisticsSpeciesItem[]> {
    return statisticsData.reduce(
        (acc, item) => {
            const key = getKey(item);
            (acc[key] ||= []).push(item);
            return acc;
        },
        {} as Record<T, StatisticsSpeciesItem[]>
    );
}

function getSpeciesName(species: { description?: Record<string, string | null> }, language: AppLanguage): string {
    return species?.description?.[language] || "";
}

function getUniquePermitTypeIds(items: StatisticsSpeciesItem[]): number[] {
    return Array.from(
        new Set(items.map((i) => i.permitTypeId).filter((id) => id && id !== 0 && id !== UNLIMITED_SPECIES_PERMIT_ID))
    );
}

function findSubspeciesInfo(
    speciesInfo: LimitedSpecies,
    permitTypeId: number
): { description: Record<string, string | null> } | undefined {
    return speciesInfo?.subspecies?.find((sub) => "permitTypeId" in sub && sub.permitTypeId === permitTypeId) as
        | { description: Record<string, string | null> }
        | undefined;
}

export function groupLimitedSpeciesStatistics(
    statisticsData: StatisticsSpeciesItem[],
    limitedSpecies: LimitedSpecies[],
    language: AppLanguage
): LimitedSpeciesGroup[] {
    const groups = groupStatisticsData(statisticsData, (item) => `${item.speciesId}-${item.permitTypeId}`);

    return Object.entries(groups)
        .map(([key, items]) => {
            const [speciesIdStr, permitTypeIdStr] = key.split("-");
            const speciesId = Number(speciesIdStr);
            const permitTypeId = Number(permitTypeIdStr);

            const speciesInfo = limitedSpecies.find((species) => species.id === speciesId);
            if (!speciesInfo) {
                return null;
            }

            // Find subspecies with matching permitTypeId
            const subspeciesInfo = speciesInfo.subspecies?.find((sub) => sub.permitTypeId === permitTypeId);

            let permitTypeName = "";
            let speciesName = "";

            if (subspeciesInfo) {
                // Use subspecies description as the permit type name
                permitTypeName = getSpeciesName(subspeciesInfo, language);
                speciesName = getSpeciesName(speciesInfo, language);
            } else {
                // Fallback: use species name when no subspecies match
                speciesName = getSpeciesName(speciesInfo, language);
                permitTypeName = speciesName;
            }

            return {
                speciesId,
                permitTypeId,
                count: items.length,
                permitTypeName,
                speciesName,
                displayName: permitTypeName,
                items,
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => {
            return a.permitTypeName.localeCompare(b.permitTypeName);
        });
}

export function groupUnlimitedSpeciesStatistics(
    statisticsData: StatisticsSpeciesItem[],
    allUnlimitedSpecies: Array<UnlimitedSpecies | LimitedSpecies>,
    language: AppLanguage
): UnlimitedSpeciesGroup[] {
    const groups = groupStatisticsData(statisticsData, (item) => `${item.speciesId}`);

    return Object.entries(groups)
        .map(([key, items]) => {
            const speciesId = Number(key);
            const speciesInfo = allUnlimitedSpecies.find((species) => species.id === speciesId);

            if (!speciesInfo) {
                return null;
            }

            let speciesName = "";

            // For unlimited species, we just use the main species name
            speciesName = getSpeciesName(speciesInfo, language);

            return {
                speciesId,
                count: items.length,
                speciesName,
                displayName: speciesName,
                items,
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => a.speciesName.localeCompare(b.speciesName));
}

export function groupUnlimitedWithLimitedUnlimited(
    statisticsData: StatisticsSpeciesItem[],
    allUnlimitedSpecies: Array<UnlimitedSpecies | LimitedSpecies>,
    limitedUnlimitedSpecies: Array<UnlimitedSpecies | LimitedSpecies>,
    language: AppLanguage
): UnlimitedWithLimitedUnlimitedGroup[] {
    if (!statisticsData?.length) {
        return [];
    }

    // Group raw stats by species
    const speciesGroups = groupStatisticsData(statisticsData, (item) => `${item.speciesId}`);
    // Creates an object where each key is a speciesId and value is an array of items for that species.

    const result: UnlimitedWithLimitedUnlimitedGroup[] = [];

    for (const [speciesIdStr, items] of Object.entries(speciesGroups)) {
        const speciesId = Number(speciesIdStr);

        const speciesInfo = allUnlimitedSpecies.find((s) => s.id === speciesId);
        if (!speciesInfo) {
            continue;
        }

        const speciesName = getSpeciesName(speciesInfo, language);

        const isLimitedUnlimited = limitedUnlimitedSpecies.some((s) => s.id === speciesId);
        // Check if this species is in limitedUnlimitedSpecies.

        if (isLimitedUnlimited) {
            const limitedUnlimitedSpeciesInfo = limitedUnlimitedSpecies.find(
                (s) => s.id === speciesId
            ) as LimitedSpecies;

            const permitTypeIds = getUniquePermitTypeIds(items);
            // Get unique permitTypeIds from items, excluding 0 and undefined.

            for (const permitTypeId of permitTypeIds) {
                let permitTypeName = "";

                // First try to find in subspecies data for LimitedSpecies (which have subspecies with permitTypeId)
                const subspeciesInfo = findSubspeciesInfo(limitedUnlimitedSpeciesInfo, permitTypeId);

                if (subspeciesInfo?.description) {
                    permitTypeName = getSpeciesName(subspeciesInfo, language) || speciesName;
                } else if (limitedUnlimitedSpeciesInfo.permitTypeId === permitTypeId) {
                    // If the permit type matches the species' main permitTypeId, use species name
                    permitTypeName = speciesName;
                } else {
                    // Skip if we can't find permit type name in subspecies data or main species
                    continue;
                }

                const variantItems = items.filter((i) => i.permitTypeId === permitTypeId);
                if (!variantItems.length) {
                    continue;
                }
                // Filter items for this permitTypeId. Skip if none.

                result.push({
                    speciesId,
                    permitTypeId,
                    count: variantItems.length,
                    speciesName,
                    displayName: permitTypeName,
                    items: variantItems,
                });
            }

            // If there are variant permit types we DO NOT create a base group (e.g. deer has only male / female+juvenile)
            if (permitTypeIds.length === 0) {
                // No variant permit types actually present in data; fall back to single group
                result.push({
                    speciesId,
                    permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
                    count: items.length,
                    speciesName,
                    displayName: speciesName,
                    items,
                });
                // Add a group for species with no permit type variants.
            }
        } else {
            // Plain unlimited species without variants
            result.push({
                speciesId,
                permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
                count: items.length,
                speciesName,
                displayName: speciesName,
                items,
            });
        }
    }

    return result.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function groupBirdSpeciesStatistics(
    birdStatisticsData: StatisticsSpeciesItem[],
    classifiers: Classifiers | undefined,
    language: AppLanguage
): BirdSpeciesGroup[] {
    const groups = groupStatisticsData(birdStatisticsData, (item) => `${item.speciesId}`);

    return Object.entries(groups)
        .map(([key, items]) => {
            const speciesId = Number(key);

            if (!classifiers) {
                return null;
            }

            const speciesName =
                getDescriptionForClassifierOption(classifiers.animalSpecies.options, language, speciesId) ?? "";

            if (!speciesName) {
                return null;
            }

            return {
                speciesId,
                count: items.length,
                speciesName,
                items,
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => a.speciesName.localeCompare(b.speciesName));
}
