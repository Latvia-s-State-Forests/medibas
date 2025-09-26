import { t } from "i18next";
import * as React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { LargeIcon } from "~/components/icon";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { theme } from "~/theme";
import { SpeciesId } from "~/types/classifiers";
import { StatisticsSpeciesItem } from "~/types/statistics";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { formatDateTime } from "~/utils/format-date-time";
import { formatPosition } from "~/utils/format-position";

export type SpeciesStatisticsReportItemProps = {
    statisticsItem: StatisticsSpeciesItem;
    onPress?: () => void;
};

export function SpeciesStatisticsReportItem(props: SpeciesStatisticsReportItemProps) {
    const classifiers = useClassifiers();
    const language = getAppLanguage();

    const speciesTitle =
        getDescriptionForClassifierOption(
            classifiers.animalSpecies.options,
            language,
            props.statisticsItem.speciesId
        ) ?? t("statistics.unknownSpecies");

    const permitTypeTitle =
        getDescriptionForClassifierOption(
            classifiers.permitTypes.options,
            language,
            props.statisticsItem?.permitTypeId
        ) ?? t("statistics.unknownType");

    const permitSpeciesTitle = `${permitTypeTitle} - ${props.statisticsItem.strapNumber || ""}`;
    const unlimitedSpeciesTitle = speciesTitle;
    const createdAtText = formatDateTime(props.statisticsItem.huntedTime);
    const positionText = formatPosition({
        latitude: props.statisticsItem.location[1],
        longitude: props.statisticsItem.location[0],
    });

    const displayTitle = props.statisticsItem.strapNumber ? permitSpeciesTitle : unlimitedSpeciesTitle;

    return (
        <Pressable
            onPress={props.onPress}
            style={({ pressed }) => [styles.container, pressed ? styles.pressed : styles.shadow]}
        >
            <View style={styles.iconContainer}>
                <LargeIcon
                    name={configuration.hunt.speciesIcons[props.statisticsItem.speciesId as SpeciesId] || "animals"}
                />
            </View>
            <View style={styles.textContent}>
                <Text weight="bold">{displayTitle}</Text>
                <Text size={12}>{createdAtText}</Text>
                <Text size={12}>{positionText}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
    },
    pressed: {
        backgroundColor: theme.color.gray2,
    },
    shadow: {
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowColor: theme.color.gray8,
                shadowRadius: 8,
                shadowOpacity: 0.08,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    textContent: {
        flex: 1,
        gap: 6,
        marginLeft: 16,
    },
});
