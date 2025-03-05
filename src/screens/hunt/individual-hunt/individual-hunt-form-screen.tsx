import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { TypeField } from "~/components/type-field";
import { IndividualHuntForm } from "~/screens/hunt/individual-hunt/individual-hunt-form";
import { theme } from "~/theme";
import { HuntPlace } from "~/types/hunts";
import { RootNavigatorParams } from "~/types/navigation";

type IndividualHuntFormState = {
    type: HuntPlace;
};

function getDefaultIndividualHuntFormState(huntEventPlaceId?: HuntPlace | undefined): IndividualHuntFormState {
    return {
        type: huntEventPlaceId ?? HuntPlace.InTheStation,
    };
}

type IndividualHuntScreeFormProps = NativeStackScreenProps<RootNavigatorParams, "IndividualHuntFormScreen">;

export function IndividualHuntFormScreen({ route }: IndividualHuntScreeFormProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [individualHunt, setIndividualHunt] = React.useState<IndividualHuntFormState>(() =>
        getDefaultIndividualHuntFormState(route.params.hunt?.huntEventPlaceId)
    );

    function onTypeChange(typeValue: HuntPlace) {
        setIndividualHunt({ ...individualHunt, type: typeValue });
    }

    return (
        <View style={styles.container}>
            <Header title={t("hunt.individualHunt.hunt")} />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingRight: insets.right + 16,
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <TypeField
                    label={t("hunt.individualHunt.huntType")}
                    options={[
                        {
                            label: t("hunt.individualHunt.inTheStation"),
                            value: HuntPlace.InTheStation,
                            iconName: "infrastructure",
                        },
                        {
                            label: t("hunt.individualHunt.waterBody"),
                            value: HuntPlace.WaterBody,
                            iconName: "water",
                        },
                        {
                            label: t("hunt.individualHunt.outSideStation"),
                            value: HuntPlace.OutSideStation,
                            iconName: "forest",
                        },
                    ]}
                    value={individualHunt.type}
                    onChange={onTypeChange}
                />
                <View style={styles.innerContainer}>
                    <IndividualHuntForm huntPlace={individualHunt.type} hunt={route.params?.hunt} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        flexGrow: 1,
        paddingTop: 24,
    },
    innerContainer: {
        flex: 1,
    },
});
