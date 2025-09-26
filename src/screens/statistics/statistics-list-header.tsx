import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";

type HuntListStatisticsHeaderProps = {
    place: string;
    season?: string;
    filterType?: "all" | "withAnimals" | "withoutAnimals";
};
export function HuntListStatisticsHeader({ place, season, filterType = "all" }: HuntListStatisticsHeaderProps) {
    const { t } = useTranslation();

    function getHeaderText() {
        const seasonText = season ? ` ${season}` : "";

        switch (filterType) {
            case "withAnimals":
                return t("statistics.huntsWithAnimalsInSeason", { place, season: seasonText });
            case "withoutAnimals":
                return t("statistics.huntsWithoutAnimalsInSeason", { place, season: seasonText });
            default:
                return season ? t("statistics.allHuntsInPlaceAndSeason", { place, season }) : null;
        }
    }

    const headerText = getHeaderText();

    if (!headerText) {
        return null;
    }

    return (
        <>
            <Spacer size={24} />
            <Text style={styles.text}>{headerText}</Text>
            <Spacer size={24} />
        </>
    );
}

const styles = StyleSheet.create({
    text: { textAlign: "center" },
});
