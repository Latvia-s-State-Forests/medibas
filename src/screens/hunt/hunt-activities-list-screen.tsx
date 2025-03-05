import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { Button } from "~/components/button";
import { Header } from "~/components/header";
import { useHuntActivities, useHuntActivitiesContext } from "~/components/hunt-activities-provider";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { useClassifiers } from "~/hooks/use-classifiers";
import { DEFAULT_APP_LANGUAGE, getAppLanguage } from "~/i18n";
import { theme } from "~/theme";
import { HuntActivityType } from "~/types/hunt-activities";
import { formatDateTime } from "~/utils/format-date-time";

export function HuntActivitiesListScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const classifiers = useClassifiers();
    const huntActivities = useHuntActivities();
    const { retryActivity } = useHuntActivitiesContext();

    const reversedActivities = React.useMemo(() => {
        return huntActivities.slice().reverse();
    }, [huntActivities]);

    const dogBreedDescriptionById = React.useMemo(() => {
        const appLanguage = getAppLanguage();
        const dogBreedDescriptionById = new Map<number, string>();
        for (const breed of classifiers.dogBreeds.options) {
            const description = breed.description[appLanguage] ?? breed.description[DEFAULT_APP_LANGUAGE] ?? "??";
            dogBreedDescriptionById.set(breed.id, description);
        }
        return dogBreedDescriptionById;
    }, [classifiers.dogBreeds.options]);
    const dogSubbreedDescriptionById = React.useMemo(() => {
        const appLanguage = getAppLanguage();
        const dogSubbreedDescriptionById = new Map<number, string>();
        for (const subBreed of classifiers.dogSubbreeds.options) {
            const description = subBreed.description[appLanguage] ?? subBreed.description[DEFAULT_APP_LANGUAGE] ?? "??";
            dogSubbreedDescriptionById.set(subBreed.id, description);
        }
        return dogSubbreedDescriptionById;
    }, [classifiers.dogSubbreeds.options]);

    return (
        <View style={styles.container}>
            <Header title={t("hunt.huntActivitiesList.title")} />
            <FlatList
                data={reversedActivities}
                keyExtractor={(activity) => activity.guid}
                renderItem={({ item: activity }) => {
                    return (
                        <View
                            key={activity.guid}
                            style={[
                                styles.listItem,
                                {
                                    paddingLeft: insets.left + 16,
                                    paddingRight: insets.right + 16,
                                },
                            ]}
                        >
                            <View style={styles.row}>
                                <Text style={styles.flex} weight="bold">
                                    {activity.huntCode}
                                </Text>

                                {match(activity.status)
                                    .with("pending", () => (
                                        <Text color="teal">{t("hunt.huntActivitiesList.status.pending")}</Text>
                                    ))
                                    .with("active", () => (
                                        <Text color="teal">{t("hunt.huntActivitiesList.status.active")}</Text>
                                    ))
                                    .with("success", () => (
                                        <Text color="success">{t("hunt.huntActivitiesList.status.success")}</Text>
                                    ))
                                    .with("failure", () => (
                                        <Text color="error">{t("hunt.huntActivitiesList.status.failure")}</Text>
                                    ))
                                    .exhaustive()}
                            </View>

                            <View style={styles.details}>
                                {match(activity)
                                    .with({ type: HuntActivityType.StartHunt }, () => (
                                        <Text>{t("hunt.huntActivitiesList.type.startHunt")}</Text>
                                    ))
                                    .with({ type: HuntActivityType.PauseHunt }, () => (
                                        <Text>{t("hunt.huntActivitiesList.type.pauseHunt")}</Text>
                                    ))
                                    .with({ type: HuntActivityType.ResumeHunt }, () => (
                                        <Text>{t("hunt.huntActivitiesList.type.resumeHunt")}</Text>
                                    ))
                                    .with({ type: HuntActivityType.EndHunt }, () => (
                                        <Text>{t("hunt.huntActivitiesList.type.endHunt")}</Text>
                                    ))
                                    .with({ type: HuntActivityType.AddRegisteredHunter }, (activity) => (
                                        <>
                                            <Text>{t("hunt.huntActivitiesList.type.addRegisteredHunter")}</Text>
                                            <Text>
                                                {activity.fullName} {activity.huntersCardNumber}
                                            </Text>
                                        </>
                                    ))
                                    .with({ type: HuntActivityType.DeleteRegisteredHunter }, (activity) => (
                                        <>
                                            <Text>{t("hunt.huntActivitiesList.type.deleteRegisteredHunter")}</Text>
                                            <Text>
                                                {activity.fullName} {activity.huntersCardNumber}
                                            </Text>
                                        </>
                                    ))
                                    .with({ type: HuntActivityType.AddGuestHunter }, (activity) => (
                                        <>
                                            <Text>{t("hunt.huntActivitiesList.type.addGuestHunter")}</Text>
                                            <Text>
                                                {activity.fullName} {activity.guestHuntersCardNumber}
                                            </Text>
                                        </>
                                    ))
                                    .with({ type: HuntActivityType.DeleteGuestHunter }, (activity) => (
                                        <>
                                            <Text>{t("hunt.huntActivitiesList.type.deleteGuestHunter")}</Text>
                                            <Text>
                                                {activity.fullName} {activity.guestHuntersCardNumber}
                                            </Text>
                                        </>
                                    ))
                                    .with({ type: HuntActivityType.AddRegisteredBeater }, (activity) => (
                                        <>
                                            <Text>{t("hunt.huntActivitiesList.type.addRegisteredBeater")}</Text>
                                            <Text>
                                                {activity.fullName} ({activity.userId})
                                            </Text>
                                        </>
                                    ))
                                    .with({ type: HuntActivityType.DeleteRegisteredBeater }, (activity) => (
                                        <>
                                            <Text>{t("hunt.huntActivitiesList.type.deleteRegisteredBeater")}</Text>
                                            <Text>
                                                {activity.fullName} ({activity.userId})
                                            </Text>
                                        </>
                                    ))
                                    .with({ type: HuntActivityType.AddGuestBeater }, (activity) => (
                                        <>
                                            <Text>{t("hunt.huntActivitiesList.type.addGuestBeater")}</Text>
                                            <Text>{activity.fullName}</Text>
                                        </>
                                    ))
                                    .with({ type: HuntActivityType.DeleteGuestBeater }, (activity) => (
                                        <>
                                            <Text>{t("hunt.huntActivitiesList.type.deleteGuestBeater")}</Text>
                                            <Text>{activity.fullName}</Text>
                                        </>
                                    ))
                                    .with({ type: HuntActivityType.AddDog }, (activity) => {
                                        const breedDescription =
                                            dogBreedDescriptionById.get(activity.dogBreedId) ??
                                            String(activity.dogBreedId);
                                        let description: string;
                                        if (activity.dogSubbreedId) {
                                            const subBreedDescription =
                                                dogSubbreedDescriptionById.get(activity.dogSubbreedId) ??
                                                String(activity.dogSubbreedId);
                                            description = `${breedDescription} (${subBreedDescription})`;
                                        } else if (activity.dogBreedOther) {
                                            description = `${breedDescription} (${activity.dogBreedOther})`;
                                        } else {
                                            description = breedDescription;
                                        }
                                        description = `${description} × ${activity.dogCount}`;

                                        return (
                                            <>
                                                <Text>{t("hunt.huntActivitiesList.type.addDog")}</Text>
                                                <Text>{description}</Text>
                                            </>
                                        );
                                    })
                                    .with({ type: HuntActivityType.DeleteDog }, (activity) => {
                                        const breedDescription =
                                            dogBreedDescriptionById.get(activity.dogBreedId) ??
                                            String(activity.dogBreedId);
                                        let description: string;
                                        if (activity.dogSubbreedId) {
                                            const subBreedDescription =
                                                dogSubbreedDescriptionById.get(activity.dogSubbreedId) ??
                                                String(activity.dogSubbreedId);
                                            description = `${breedDescription} (${subBreedDescription})`;
                                        } else if (activity.dogBreedOther) {
                                            description = `${breedDescription} (${activity.dogBreedOther})`;
                                        } else {
                                            description = breedDescription;
                                        }

                                        return (
                                            <>
                                                <Text>{t("hunt.huntActivitiesList.type.deleteDog")}</Text>
                                                <Text>{description}</Text>
                                            </>
                                        );
                                    })
                                    .with({ type: HuntActivityType.AddSpeciesAndGear }, () => (
                                        <Text>{t("hunt.huntActivitiesList.type.addAdditionalEquipment")}</Text>
                                    ))
                                    .otherwise(() => (
                                        <Text>{t("hunt.huntActivitiesList.type.unknown")}</Text>
                                    ))}
                                <Text>{formatDateTime(activity.date)}</Text>
                            </View>

                            {activity.status === "failure" ? (
                                <Button
                                    title={t("hunt.huntActivitiesList.retry")}
                                    onPress={() => {
                                        retryActivity(activity.guid);
                                    }}
                                />
                            ) : null}
                        </View>
                    );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListHeaderComponent={() => <Spacer size={24} />}
                ListFooterComponent={() => <Spacer size={insets.bottom + 24} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    separator: {
        height: 1,
        backgroundColor: theme.color.gray2,
        marginVertical: 16,
    },
    listItem: {
        gap: 8,
    },
    row: {
        flexDirection: "row",
        gap: 16,
        alignItems: "center",
    },
    flex: {
        flex: 1,
    },
    details: {
        flex: 1,
        gap: 8,
    },
});
