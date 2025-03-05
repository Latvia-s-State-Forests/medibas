import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { Collapsible } from "~/components/collapsible/collapsible";
import { Header } from "~/components/header";
import { LargeIcon, LargeIconName, SmallIcon } from "~/components/icon";
import { useReportCount, useReportProgress, useReports } from "~/components/reports-provider";
import { SmallSpinner } from "~/components/small-spinner";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { theme } from "~/theme";
import { DamageTypeId, ObservationTypeId, SpeciesId } from "~/types/classifiers";
import { FeatureLayer, Report } from "~/types/report";
import { getReportTitle } from "~/utils/get-report-title";

export function ReportListScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const reportCount = useReportCount();

    const reports = useReports();

    const orderedReports = reports
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const observationReports: Report[] = [];
    const damageReports: Report[] = [];
    const huntReports: Report[] = [];

    for (const report of orderedReports) {
        switch (report.edits[0].id) {
            case FeatureLayer.DirectlyObservedAnimalsObservation:
            case FeatureLayer.SignsOfPresenceObservation:
            case FeatureLayer.DeadObservation:
                observationReports.push(report);
                break;
            case FeatureLayer.AgriculturalLandDamage:
            case FeatureLayer.ForestDamage:
            case FeatureLayer.InfrastructureDamage:
                damageReports.push(report);
                break;
            case FeatureLayer.LimitedHuntReport:
            case FeatureLayer.UnlimitedHuntReport:
                huntReports.push(report);
                break;
        }
    }

    return (
        <View style={styles.container}>
            <Header title={t("reports.title")} />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <Text style={styles.text}>
                    {reportCount > 0
                        ? t("reports.submitted", { count: configuration.reports.daysToKeepEntriesFor })
                        : t("reports.notSubmitted", { count: configuration.reports.daysToKeepEntriesFor })}
                </Text>
                <Spacer size={16} />

                {observationReports.length > 0 ? (
                    <Collapsible
                        defaultCollapsed={false}
                        title={t("reports.group.observations")}
                        lastInList={damageReports.length === 0 && huntReports.length === 0}
                    >
                        <View style={styles.list}>
                            {observationReports.map((report) => (
                                <ReportListItem
                                    key={report.id}
                                    report={report}
                                    onPress={() => navigation.navigate("ReportDetailScreen", { reportId: report.id })}
                                />
                            ))}
                        </View>
                    </Collapsible>
                ) : null}

                {damageReports.length > 0 ? (
                    <Collapsible
                        defaultCollapsed={false}
                        title={t("reports.group.damage")}
                        lastInList={huntReports.length === 0}
                    >
                        <View style={styles.list}>
                            {damageReports.map((report) => (
                                <ReportListItem
                                    key={report.id}
                                    report={report}
                                    onPress={() => navigation.navigate("ReportDetailScreen", { reportId: report.id })}
                                />
                            ))}
                        </View>
                    </Collapsible>
                ) : null}

                {huntReports.length > 0 ? (
                    <Collapsible defaultCollapsed={false} title={t("reports.group.hunt")} lastInList>
                        <View style={styles.list}>
                            {huntReports.map((report) => {
                                return (
                                    <ReportListItem
                                        key={report.id}
                                        report={report}
                                        onPress={() =>
                                            navigation.navigate("ReportDetailScreen", { reportId: report.id })
                                        }
                                        inAfricanSwineFeverZone={report.inAfricanSwineFeverZone}
                                    />
                                );
                            })}
                        </View>
                    </Collapsible>
                ) : null}
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
        paddingTop: 24,
    },
    text: {
        textAlign: "center",
    },
    list: {
        rowGap: 8,
    },
});

type ReportListItemProps = {
    report: Report;
    onPress: () => void;
    inAfricanSwineFeverZone?: boolean;
};

function ReportListItem(props: ReportListItemProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const language = getAppLanguage();
    const progress = useReportProgress(props.report.id);

    const [pressed, setPressed] = React.useState(false);

    const titleText = getReportTitle(props.report, classifiers, language);

    const createdAtText = format(new Date(props.report.createdAt), "dd.MM.yyyy HH:mm");
    const statusText = match(props.report)
        .with({ status: "pending" }, () => t("reports.status.pending"))
        .with({ status: "loading" }, (report) =>
            t("reports.status.loading") + report.photo && progress !== undefined ? ` ${progress}%` : ""
        )
        .with({ status: "success" }, () => t("reports.status.success"))
        .with({ status: "failure" }, () => t("reports.status.failure"))
        .exhaustive();

    const statusIcon = match(props.report.status)
        .with("pending", () => <SmallIcon name="pending" color="warning" />)
        .with("loading", () => <SmallSpinner />)
        .with("success", () => <SmallIcon name="valid" color="success" />)
        .with("failure", () => <SmallIcon name="error" color="error" />)
        .exhaustive();
    const position = props.report.edits[0].adds[0].geometry;
    const positionText = `${t("reports.coordinates")}: ${position.y.toFixed(5)}, ${position.x.toFixed(5)}`;
    return (
        <Pressable
            onPress={props.onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={[riStyles.container, pressed ? riStyles.pressed : riStyles.shadow]}
        >
            <View style={riStyles.leftContainer}>
                <ReportIcon report={props.report} />
            </View>
            <View style={riStyles.rightContainer}>
                <View style={riStyles.firstRow}>
                    <Text weight="bold" style={riStyles.title}>
                        {titleText}
                    </Text>
                    {statusIcon}
                </View>

                <View style={riStyles.secondRow}>
                    <Text size={12} style={riStyles.date}>
                        {createdAtText}
                    </Text>
                    <Text size={12} style={riStyles.status}>
                        {statusText}
                    </Text>
                </View>

                <Text size={12}>{positionText}</Text>
                {props.inAfricanSwineFeverZone ? (
                    <Text size={12} color="information">
                        {t("reports.analysisRequired")}
                    </Text>
                ) : null}

                {props.report.status === "failure" ? (
                    <Text size={12} color="tealPressed">
                        {t("reports.tryAgain")}
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}

const riStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 16,
        gap: 16,
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
    leftContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    rightContainer: {
        flex: 1,
        gap: 6,
    },
    firstRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    title: {
        flex: 1,
    },
    secondRow: {
        flexDirection: "row",
        gap: 8,
    },
    date: {
        flex: 1,
    },
    status: {
        textAlign: "right",
    },
});

type ReportIconProps = {
    report: Report;
};

function ReportIcon({ report }: ReportIconProps) {
    let iconName: LargeIconName;

    switch (report.edits[0].id) {
        case FeatureLayer.DirectlyObservedAnimalsObservation:
            iconName = configuration.observations.typeIcons[ObservationTypeId.DirectlyObservedAnimals];
            break;
        case FeatureLayer.SignsOfPresenceObservation:
            iconName = configuration.observations.typeIcons[ObservationTypeId.SignsOfPresence];
            break;
        case FeatureLayer.DeadObservation:
            iconName = configuration.observations.typeIcons[ObservationTypeId.Dead];
            break;
        case FeatureLayer.AgriculturalLandDamage:
            iconName = configuration.damage.typeIcons[DamageTypeId.AgriculturalLand];
            break;
        case FeatureLayer.ForestDamage:
            iconName = configuration.damage.typeIcons[DamageTypeId.Forest];
            break;
        case FeatureLayer.InfrastructureDamage:
            iconName = configuration.damage.typeIcons[DamageTypeId.Infrastructure];
            break;
        case FeatureLayer.UnlimitedHuntReport: {
            const species: SpeciesId | undefined = report.edits[0].adds[0].attributes.speciesId;
            iconName = species ? configuration.hunt.speciesIcons[species] : "animals";
            break;
        }
        case FeatureLayer.LimitedHuntReport: {
            const species: SpeciesId | undefined = report.edits[0].adds[0].attributes.speciesId;
            iconName = species ? configuration.hunt.speciesIcons[species] : "animals";
            break;
        }
    }

    return <LargeIcon name={iconName} />;
}
