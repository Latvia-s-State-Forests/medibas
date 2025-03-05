import { District } from "~/types/districts";
import { isPositionInDistrict } from "./is-position-in-district";

const districts: District[] = [
    {
        id: 1,
        shapeWgs: {
            type: "MultiPolygon",
            coordinates: [
                [
                    [
                        [25.314680969757205, 56.655099078732604],
                        [25.314680969757205, 56.65256569064681],
                        [25.31938825827652, 56.65256569064681],
                        [25.31938825827652, 56.655099078732604],
                        [25.314680969757205, 56.655099078732604],
                    ],
                ],
            ],
        },
    },
];

describe("isPositionInDistrict", () => {
    it("returns true when in district", () => {
        const position = {
            latitude: 56.65464085894956,
            longitude: 25.316050502892182,
        };
        const result = isPositionInDistrict(position, 1, districts);
        expect(result).toBe(true);
    });

    it("returns true when in buffer-zone", () => {
        const position = {
            latitude: 56.65527367494727,
            longitude: 25.316062167066804,
        };
        const result = isPositionInDistrict(position, 1, districts);
        expect(result).toBe(true);
    });

    it("returns false when outside of buffer-zone", () => {
        const position = {
            latitude: 56.65578823025356,
            longitude: 25.316048827607148,
        };
        const result = isPositionInDistrict(position, 10009, districts);
        expect(result).toBe(false);
    });

    it("returns false when district not available", () => {
        const position = {
            latitude: 56.65464085894956,
            longitude: 25.316050502892182,
        };
        const result = isPositionInDistrict(position, 2, districts);
        expect(result).toBe(false);
    });
});
