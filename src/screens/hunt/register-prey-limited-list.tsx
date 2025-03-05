import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { useSelectedDistrictId } from "~/hooks/use-selected-district-id";
import { useValidPermits } from "~/hooks/use-valid-permits";
import { RegisterPreyListItem } from "~/screens/hunt/register-prey-list-item";
import { LimitedSpecies } from "~/types/hunt";
import { Hunter } from "~/types/hunts";
import { StrapStatusId } from "~/types/permits";
import { formatLabel } from "~/utils/format-label";

type RegisterPreyLimitedListProps = {
    type: "species" | "subspecies";
    species: LimitedSpecies[];
    unlimited?: boolean;
    activeHuntHunters?: Hunter[];
};

export function RegisterPreyLimitedList({
    type,
    species,
    unlimited = false,
    activeHuntHunters,
}: RegisterPreyLimitedListProps) {
    const { t } = useTranslation();
    const validPermits = useValidPermits();
    const profile = useProfile();
    const [selectedDistrictId] = useSelectedDistrictId();
    const navigation = useNavigation();
    const selectedDistrictName = profile.memberships.find(
        (membership) => membership.huntingDistrictId === selectedDistrictId
    )?.huntingDistrict.descriptionLv;
    const classifiers = useClassifiers();
    return (
        <View>
            {selectedDistrictName && (
                <>
                    <Text weight="bold" color="green" size={16}>{`${t("mtl.district")}: ${selectedDistrictName}`}</Text>
                    <Spacer size={12} />
                </>
            )}

            {species.map((species) => {
                let permitCount: number | undefined = validPermits.filter((permit) => {
                    if (type === "species") {
                        const permitType = classifiers.permitTypes.options.find(
                            (option) => option.id === permit.permitTypeId
                        );
                        return permitType?.speciesId === species.id;
                    }
                    return permit.permitTypeId === species.permitTypeId;
                }).length;

                if (unlimited) {
                    if (permitCount > 0) {
                        permitCount = undefined;
                    } else {
                        permitCount = -1;
                    }
                }

                return (
                    <RegisterPreyListItem
                        key={`${species.id}_${species.permitTypeId}`}
                        iconName={species.icon}
                        type={formatLabel(species.description)}
                        term={species.term ?? t("hunt.unlimitedTerm")}
                        permitCount={permitCount}
                        onPress={() => {
                            if (type === "species" && species.subspecies) {
                                navigation.navigate("LimitedPreySubspeciesScreen", {
                                    activeHuntHunters,
                                    species,
                                    unlimited,
                                });
                            } else {
                                const permit = validPermits.find(
                                    (permit) =>
                                        permit.permitTypeId === species.permitTypeId &&
                                        permit.strapStatusId === StrapStatusId.Unused
                                );
                                if (permit && selectedDistrictId) {
                                    navigation.navigate("LimitedPreyScreen", {
                                        permit,
                                        huntingDistrictId: selectedDistrictId,
                                        activeHuntHunters,
                                    });
                                }
                            }
                        }}
                    />
                );
            })}
        </View>
    );
}
