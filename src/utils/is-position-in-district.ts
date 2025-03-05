import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import buffer from "@turf/buffer";
import { point } from "@turf/helpers";
import { configuration } from "~/configuration";
import { District } from "~/types/districts";
import { PositionResult } from "~/types/position-result";

export function isPositionInDistrict(position: PositionResult, districtId: number, districts: District[]): boolean {
    const district = districts.find((district) => district.id === districtId);

    if (!district) {
        return false;
    } else {
        const pointPosition = point([position.longitude, position.latitude]);

        const bufferedPolygon = buffer(
            {
                type: "Feature",
                properties: {},
                geometry: district.shapeWgs,
            },
            configuration.currentPosition.minAccuracy,
            { units: "meters" }
        );

        return booleanPointInPolygon(pointPosition, bufferedPolygon);
    }
}
