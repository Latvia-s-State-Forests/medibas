import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { BorderlessBadge } from "~/components/borderless-badge";
import { Text } from "~/components/text";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage, DEFAULT_APP_LANGUAGE } from "~/i18n";
import { theme } from "~/theme";
import { DrivenHuntStatisticsItem } from "~/types/statistics";

type DogListStatisticsProps = {
    hunt: DrivenHuntStatisticsItem;
};

export function DogListStatistics({ hunt }: DogListStatisticsProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const appLanguage = getAppLanguage();

    const dogs = React.useMemo(() => {
        const dogsList: Array<{ name: string; count: number }> = [];

        for (const dog of hunt.dogs) {
            if (dog.dogBreedId && dog.count) {
                // Find breed name
                const breed = classifiers.dogBreeds.options.find((b) => b.id === dog.dogBreedId);
                let breedName = breed?.description[appLanguage] ?? breed?.description[DEFAULT_APP_LANGUAGE] ?? "??";

                // If there's a sub-breed, use that instead
                if (dog.dogSubbreedId) {
                    const subBreed = classifiers.dogSubbreeds.options.find((sb) => sb.id === dog.dogSubbreedId);
                    if (subBreed && breed) {
                        const subBreedName =
                            subBreed.description[appLanguage] ?? subBreed.description[DEFAULT_APP_LANGUAGE] ?? "??";
                        breedName = `${breedName} (${subBreedName})`;
                    }
                }

                dogsList.push({ name: breedName, count: dog.count });
            }
        }

        dogsList.sort((a, b) => a.name.localeCompare(b.name));
        return dogsList;
    }, [hunt.dogs, classifiers.dogBreeds.options, classifiers.dogSubbreeds.options, appLanguage]);

    if (dogs.length > 0) {
        return (
            <View style={styles.container}>
                <View style={styles.titleRow}>
                    <Text size={12} color="gray7" weight="bold" style={styles.title}>
                        {t("statistics.drivenHunt.details.dogs")}
                    </Text>
                    <BorderlessBadge count={dogs.length} variant="default" />
                </View>
                <View style={styles.list}>
                    {dogs.map((dog, index) => {
                        return (
                            <View key={dog.name + index} style={styles.listItem}>
                                <Text>{index + 1}.</Text>
                                <Text style={styles.listItemTitle}>{dog.name}</Text>
                                <Text style={styles.listItemCount} weight="bold">
                                    {`× ${dog.count}`}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    }
    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleRow: {
        flexDirection: "row",
        gap: 10,
        paddingRight: 20,
        paddingVertical: 10,
    },
    title: {
        flex: 1,
    },
    list: {
        borderTopWidth: 1,
        borderTopColor: theme.color.gray2,
    },
    listItem: {
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 4,
        borderBottomColor: theme.color.gray2,
        borderBottomWidth: 1,
        paddingRight: 4,
    },
    listItemTitle: {
        flex: 1,
    },
    listItemCount: {
        marginRight: 16,
    },
});
