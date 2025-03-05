import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { Header } from "~/components/header";
import { ReadOnlyField } from "~/components/read-only-field";
import { useReport } from "~/components/reports-provider";
import { Spacer } from "~/components/spacer";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { ReportStatusDisplay } from "~/screens/reports/report-status-display";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { PositionResult } from "~/types/position-result";
import { FeatureLayer } from "~/types/report";
import { formatDateTime } from "~/utils/format-date-time";
import { formatPosition } from "~/utils/format-position";
import { getReportTitle } from "~/utils/get-report-title";
import { AgriculturalLandDamageFields } from "./damages/agricultural-land-damage-fields";
import { ForestDamageFields } from "./damages/forest-damage-fields";
import { InfrastructureDamageFields } from "./damages/infrastructure-damage-fields";
import { LimitedHuntReportFields } from "./hunt/limited-hunt-report-fields";
import { UnlimitedHuntReportFields } from "./hunt/unlimited-hunt-report-fields";
import { DeadAnimalsObservationFields } from "./observations/dead-animals-observation-fields";
import { DirectlyObservedAnimalsFields } from "./observations/directly-observed-animals-fields";
import { SignsOfPresenceObservationFields } from "./observations/signs-of-presence-observation-fields";

type ReportDetailScreenProps = NativeStackScreenProps<RootNavigatorParams, "ReportDetailScreen">;

export function ReportDetailScreen(props: ReportDetailScreenProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const classifiers = useClassifiers();
    const { reportId } = props.route.params;
    const report = useReport(reportId);
    const language = getAppLanguage();

    let screenTitle = "";
    if (report) {
        screenTitle = getReportTitle(report, classifiers, language);
    }
    const registeredDate = formatDateTime(report?.edits[0].adds[0].attributes.reportCreated ?? "");

    let coordinates = "";

    if (report) {
        const position: PositionResult = {
            latitude: report.edits[0].adds[0].geometry.y,
            longitude: report.edits[0].adds[0].geometry.x,
        };
        coordinates = formatPosition(position);
    }

    const notes = report?.edits[0].adds[0].attributes.notes;

    return (
        <View style={styles.container}>
            <Header title={screenTitle} />
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
                <ReportStatusDisplay reportId={reportId} />
                <Spacer size={24} />
                <ReadOnlyField label={t("reports.registeredDate")} value={registeredDate} />
                <Spacer size={16} />
                <ReadOnlyField label={t("reports.coordinates")} value={coordinates} />
                <Spacer size={16} />
                {notes ? (
                    <>
                        <ReadOnlyField label={t("reports.notes")} value={notes} />
                        <Spacer size={16} />
                    </>
                ) : null}
                {match(report)
                    .with(
                        {
                            edits: [
                                {
                                    id: FeatureLayer.DirectlyObservedAnimalsObservation,
                                },
                            ],
                        },
                        (report) => {
                            return <DirectlyObservedAnimalsFields features={report.edits[0].adds} />;
                        }
                    )
                    .with({ edits: [{ id: FeatureLayer.SignsOfPresenceObservation }] }, (report) => {
                        return <SignsOfPresenceObservationFields feature={report.edits[0].adds[0]} />;
                    })
                    .with({ edits: [{ id: FeatureLayer.DeadObservation }] }, (report) => {
                        return <DeadAnimalsObservationFields feature={report.edits[0].adds[0]} />;
                    })
                    .with({ edits: [{ id: FeatureLayer.AgriculturalLandDamage }] }, (report) => {
                        return <AgriculturalLandDamageFields feature={report.edits[0].adds[0]} />;
                    })
                    .with({ edits: [{ id: FeatureLayer.ForestDamage }] }, (report) => {
                        return <ForestDamageFields feature={report.edits[0].adds[0]} />;
                    })
                    .with({ edits: [{ id: FeatureLayer.InfrastructureDamage }] }, (report) => {
                        return <InfrastructureDamageFields feature={report.edits[0].adds[0]} />;
                    })
                    .with({ edits: [{ id: FeatureLayer.LimitedHuntReport }] }, (report) => {
                        return <LimitedHuntReportFields reportId={reportId} feature={report.edits[0].adds[0]} />;
                    })
                    .with({ edits: [{ id: FeatureLayer.UnlimitedHuntReport }] }, (report) => {
                        return <UnlimitedHuntReportFields feature={report.edits[0].adds[0]} />;
                    })
                    .otherwise(() => null)}
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
});
