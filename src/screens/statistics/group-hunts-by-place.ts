import { HuntPlace } from "~/types/hunts";
import { IndividualHuntStatisticsItem, DrivenHuntStatisticsItem } from "~/types/statistics";

// Inline helper function for getting hunt place names
function getHuntPlaceName(placeId: number, t: (key: string) => string): string {
    const HUNT_PLACE_ID: { [key in HuntPlace]: string } = {
        [HuntPlace.InTheStation]: t("hunt.individualHunt.inTheStation"),
        [HuntPlace.WaterBody]: t("hunt.individualHunt.waterBody"),
        [HuntPlace.OutSideStation]: t("hunt.individualHunt.outSideStation"),
    };

    return HUNT_PLACE_ID[placeId as HuntPlace] || "";
}

export interface HuntsByPlaceResult {
    placeId: number;
    totalTime: number;
    count: number;
    huntsWithAnimals: number;
    huntsWithoutAnimals: number;
    name: string;
    allHunts: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>;
    huntsWithAnimalsData: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>;
    huntsWithoutAnimalsData: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>;
}

/**
 * Groups hunts by place and calculates statistics for each place
 * @param hunts - Array of hunt statistics (individual or driven)
 * @param t - Translation function
 * @returns Array of hunt place statistics
 */
export function groupHuntsByPlace(
    hunts: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>,
    t: (key: string) => string
): HuntsByPlaceResult[] {
    const placeGroups: Record<
        number,
        {
            totalTime: number;
            count: number;
            huntsWithAnimals: number;
            huntsWithoutAnimals: number;
            name: string;
            allHunts: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>;
            huntsWithAnimalsData: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>;
            huntsWithoutAnimalsData: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>;
        }
    > = {};

    // Type guard to check if it's an individual hunt
    function isIndividualHunt(
        hunt: IndividualHuntStatisticsItem | DrivenHuntStatisticsItem
    ): hunt is IndividualHuntStatisticsItem {
        return "huntEventPlaceId" in hunt;
    }

    hunts.forEach((hunt) => {
        if (isIndividualHunt(hunt)) {
            // Individual hunts use huntEventPlaceId
            const placeId = hunt.huntEventPlaceId;
            const placeName = getHuntPlaceName(placeId, t);

            addHuntToPlace(placeId, placeName, hunt);
        } else {
            // Driven hunts - create separate entry for each district
            const drivenHunt = hunt as DrivenHuntStatisticsItem;
            drivenHunt.districts.forEach((district) => {
                const placeId = district.id;
                const placeName = district.descriptionLv;

                addHuntToPlace(placeId, placeName, hunt);
            });
        }
    });

    function addHuntToPlace(
        placeId: number,
        placeName: string,
        hunt: IndividualHuntStatisticsItem | DrivenHuntStatisticsItem
    ) {
        if (!placeGroups[placeId]) {
            placeGroups[placeId] = {
                totalTime: 0,
                count: 0,
                huntsWithAnimals: 0,
                huntsWithoutAnimals: 0,
                name: placeName,
                allHunts: [],
                huntsWithAnimalsData: [],
                huntsWithoutAnimalsData: [],
            };
        }

        placeGroups[placeId].totalTime += hunt.timeSpentInHuntMinutes;
        placeGroups[placeId].count++;
        placeGroups[placeId].allHunts.push(hunt);

        // Check if hunt has hunted animals
        if (hunt.huntedAnimals && hunt.huntedAnimals.length > 0) {
            placeGroups[placeId].huntsWithAnimals++;
            placeGroups[placeId].huntsWithAnimalsData.push(hunt);
        } else {
            placeGroups[placeId].huntsWithoutAnimals++;
            placeGroups[placeId].huntsWithoutAnimalsData.push(hunt);
        }
    }

    const result = Object.entries(placeGroups).map(([placeId, data]) => ({
        placeId: parseInt(placeId),
        ...data,
    }));

    return result;
}
