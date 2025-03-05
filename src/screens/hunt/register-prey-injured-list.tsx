import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import * as React from "react";
import { View } from "react-native";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useInjuredAnimalPermits } from "~/hooks/use-injured-animal-permits";
import { useSelectedDistrictId } from "~/hooks/use-selected-district-id";
import { RegisterPreyListItem } from "~/screens/hunt/register-prey-list-item";
import { LimitedSpecies } from "~/types/hunt";
import { Hunter } from "~/types/hunts";
import { formatLabel } from "~/utils/format-label";

type RegisterPreyInjuredListProps = {
    species: LimitedSpecies[];
    activeHuntHunters?: Hunter[];
};

export function RegisterPreyInjuredList({ species, activeHuntHunters }: RegisterPreyInjuredListProps) {
    const injuredAnimalPermits = useInjuredAnimalPermits();
    const classifiers = useClassifiers();
    const navigation = useNavigation();
    const [selectedDistrictId] = useSelectedDistrictId();

    return (
        <View>
            {injuredAnimalPermits.map((permit) => {
                const permitType = classifiers.permitTypes.options.find((option) => option.id === permit.permitTypeId);
                const showSpecies = species.find((species) => species.id === permitType?.speciesId);

                if (!showSpecies) {
                    return null;
                }

                const permitAllowance = classifiers.permitAllowances.options.find(
                    (permitAllowance) => permitAllowance.id === permit.permitAllowanceId
                );

                if (!permitAllowance) {
                    return null;
                }

                const permitInjuredDate = permit.injuredDate ? new Date(permit.injuredDate) : new Date(); // TODO: remove temporary check after injuredDate is implemented
                const injuredDate = format(permitInjuredDate, "dd.MM.yyyy HH:mm:ss");

                return (
                    <RegisterPreyListItem
                        key={permit.id}
                        iconName={showSpecies.icon}
                        type={formatLabel(permitType?.description)}
                        term={injuredDate}
                        onPress={() => {
                            navigation.navigate("LimitedPreyScreen", {
                                permit,
                                huntingDistrictId: selectedDistrictId!,
                                activeHuntHunters,
                            });
                        }}
                    />
                );
            })}
        </View>
    );
}
