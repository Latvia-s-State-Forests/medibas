import { useSelector } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { Button } from "~/components/button";
import { Header } from "~/components/header";
import { LargeIcon } from "~/components/icon";
import { useInfrastructureContext } from "~/components/infrastructure-provider";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { DEFAULT_APP_LANGUAGE, getAppLanguage } from "~/i18n";
import { theme } from "~/theme";
import { HuntingInfrastructureTypeId } from "~/types/classifiers";
import { formatDateTime } from "~/utils/format-date-time";
import { formatPosition } from "~/utils/format-position";

export function DistrictInfrastructureChangesListScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { actor } = useInfrastructureContext();
    const changes = useSelector(actor, (state) => state.context.changes.slice().reverse());
    const profile = useProfile();
    const classifiers = useClassifiers();

    const districts = React.useMemo(() => {
        const districts = new Map<number, string>();
        for (const membership of profile.memberships) {
            districts.set(membership.huntingDistrictId, membership.huntingDistrict.descriptionLv);
        }
        return districts;
    }, [profile.memberships]);

    const infrastructureTypes = React.useMemo(() => {
        const infrastructureTypes = new Map<number, string>();
        const language = getAppLanguage();
        for (const infrastructureType of classifiers.huntingInfrastructureTypes.options) {
            const description =
                infrastructureType.description[language] ?? infrastructureType.description[DEFAULT_APP_LANGUAGE];
            if (description) {
                infrastructureTypes.set(infrastructureType.id, description);
            }
        }
        return infrastructureTypes;
    }, [classifiers.huntingInfrastructureTypes]);

    return (
        <View style={styles.container}>
            <Header title={t("mtl.infrastructureChangesList.title")} />
            <FlatList
                data={changes}
                ListHeaderComponent={() => {
                    return (
                        <View>
                            <Text
                                style={[
                                    styles.headerText,
                                    { paddingLeft: insets.left + 16, paddingRight: insets.right + 16 },
                                ]}
                            >
                                {t("mtl.infrastructureChangesList.submitted", {
                                    count: configuration.huntingInfrastructure.daysToKeepChangesFor,
                                })}
                            </Text>
                        </View>
                    );
                }}
                renderItem={({ item: change }) => {
                    const { infrastructure } = change;
                    const id = infrastructure.id === -1 ? infrastructure.guid.split("-").pop() : infrastructure.id;
                    const district =
                        districts.get(infrastructure.huntingDistrictId)?.trim() ??
                        t("mtl.infrastructureChangesList.unknownDistrict", {
                            district: infrastructure.huntingDistrictId,
                        });
                    const type =
                        infrastructureTypes.get(infrastructure.typeId)?.trim() ??
                        t("mtl.infrastructureChangesList.type.unknown", {
                            type: infrastructure.typeId,
                        });
                    const notes = infrastructure.notes?.trim();
                    return (
                        <View
                            style={[
                                styles.itemContainer,
                                { paddingLeft: insets.left + 16, paddingRight: insets.right + 16 },
                            ]}
                        >
                            <View style={styles.itemRow}>
                                <LargeIcon
                                    name={
                                        configuration.huntingInfrastructure.typeIcons[
                                            infrastructure.typeId as HuntingInfrastructureTypeId
                                        ] ?? "cross"
                                    }
                                />
                                <View style={styles.itemContent}>
                                    <View style={styles.itemHeader}>
                                        <Text weight="bold" style={styles.itemHeaderType}>
                                            {match(change.type)
                                                .with("create", () =>
                                                    t("mtl.infrastructureChangesList.type.create", { id })
                                                )
                                                .with("update", () =>
                                                    t("mtl.infrastructureChangesList.type.update", { id })
                                                )
                                                .with("delete", () =>
                                                    t("mtl.infrastructureChangesList.type.delete", { id })
                                                )
                                                .exhaustive()}
                                        </Text>
                                        {match(change.status)
                                            .with("pending", () => (
                                                <Text color="teal" weight="bold">
                                                    {t("mtl.infrastructureChangesList.status.pending")}
                                                </Text>
                                            ))
                                            .with("active", () => (
                                                <Text color="teal" weight="bold">
                                                    {t("mtl.infrastructureChangesList.status.active")}
                                                </Text>
                                            ))
                                            .with("success", () => (
                                                <Text color="success" weight="bold">
                                                    {t("mtl.infrastructureChangesList.status.success")}
                                                </Text>
                                            ))
                                            .with("failure", () => (
                                                <Text color="error" weight="bold">
                                                    {t("mtl.infrastructureChangesList.status.failure")}
                                                </Text>
                                            ))
                                            .exhaustive()}
                                    </View>
                                    <Text>
                                        {district}, {type}
                                    </Text>
                                    {notes ? <Text>{notes}</Text> : null}
                                    <Text>
                                        {formatPosition({
                                            latitude: infrastructure.locationY,
                                            longitude: infrastructure.locationX,
                                        })}
                                    </Text>
                                    <Text>{formatDateTime(change.created)}</Text>
                                </View>
                            </View>
                            {change.status === "failure" ? (
                                <Button
                                    title={t("mtl.infrastructureChangesList.retry")}
                                    onPress={() => {
                                        actor.send({ type: "RETRY_CHANGE", id: change.id });
                                    }}
                                />
                            ) : null}
                        </View>
                    );
                }}
                ItemSeparatorComponent={() => {
                    return <View style={styles.separator} />;
                }}
                ListFooterComponent={() => {
                    return <View style={{ height: insets.bottom + 24 }} />;
                }}
                keyExtractor={(change) => change.id}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    itemContainer: {
        gap: 16,
        backgroundColor: theme.color.white,
        paddingVertical: 16,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    itemContent: {
        flex: 1,
        gap: 4,
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    itemHeaderType: {
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: theme.color.gray2,
    },
    headerText: {
        textAlign: "center",
        paddingVertical: 24,
    },
});
