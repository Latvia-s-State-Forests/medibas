import { DistrictDamage } from "~/types/district-damages";

export function getCoordinates(damage: DistrictDamage): string {
    return damage.locationY + ", " + damage.locationX;
}
