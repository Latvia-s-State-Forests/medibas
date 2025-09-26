import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { match } from "ts-pattern";
import { Button } from "~/components/button";
import { LargestIcon } from "~/components/icon";
import {
    useIsReportWaitingForNetwork,
    useReport,
    useReportProgress,
    useReportsContext,
} from "~/components/reports-provider";
import { Spacer } from "~/components/spacer";
import { Spinner } from "~/components/spinner";
import { Text } from "~/components/text";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { theme } from "~/theme";

type ReportStatusDisplayProps = {
    reportId: string;
};

export function ReportStatusDisplay(props: ReportStatusDisplayProps) {
    const { t } = useTranslation();
    const reportId = props.reportId;
    const report = useReport(reportId);
    const isPendingNetwork = useIsReportWaitingForNetwork(reportId);
    const progress = useReportProgress(reportId);
    const classifiers = useClassifiers();
    const reportsService = useReportsContext();
    const language = getAppLanguage();

    let icon;
    let title;
    let description;
    let buttons;

    if (isPendingNetwork) {
        icon = <Spinner />;
        title = t("reportStatus.pendingNetwork");
    } else if (report?.status === "pending") {
        icon = <Spinner />;
        title = t("reportStatus.pending");
    } else if (report?.status === "loading") {
        icon = <Spinner progress={report?.photo ? progress : undefined} />;
        title = t("reportStatus.loading");
    } else if (report?.status === "success") {
        icon = <LargestIcon name="success" />;
        title = t("reportStatus.success");
        const strapNumber = report.result?.strapNumber;
        description = strapNumber ? t("reportStatus.strapNumberUsed", { strapNumber }) : undefined;
    } else if (report?.status === "failure") {
        description = match(report?.error)
            .with({ type: "server" }, (error) => {
                const defaultErrorMessage = t("reportStatus.unknownError");
                try {
                    const errorDescription = error.description ? JSON.parse(error.description) : undefined;
                    let errorMessage = classifiers.errorMessages.options.find(
                        (errorMessage) => errorMessage.isUserFriendly && errorMessage.id === error.code
                    )?.description[language];

                    if (errorMessage) {
                        const templateVariables = errorMessage.match(/{([^}]+)}/g);
                        if (templateVariables) {
                            templateVariables.forEach((templateVariable) => {
                                const templateValue = errorDescription[templateVariable.slice(1, -1)];
                                if (templateValue) {
                                    errorMessage = errorMessage?.replace(templateVariable, templateValue);
                                }
                            });
                        }
                    }

                    return errorMessage ?? defaultErrorMessage;
                } catch {
                    return defaultErrorMessage;
                }
            })
            .with({ type: "network" }, () => t("reportStatus.networkError"))
            .with({ type: "timeout" }, (error) => {
                const timeoutInMinutes = error.timeout / 1000 / 60;
                return t("reportStatus.timeoutError", {
                    count: timeoutInMinutes,
                });
            })
            .otherwise(() => t("reportStatus.unknownError"));
        icon = <LargestIcon name="failure" />;
        title = t("reportStatus.failure");
        buttons = (
            <Button title={t("reportStatus.retry")} onPress={() => reportsService.send({ type: "RETRY", reportId })} />
        );
    }

    const warning = report?.inAfricanSwineFeverZone ? t("reports.analysisRequired") : undefined;

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {icon}
                <View style={styles.textContainer}>
                    <Text size={22} weight="bold" style={styles.title}>
                        {title}
                    </Text>
                    {description ? <Text style={styles.description}>{description}</Text> : null}
                    {warning ? <Text style={styles.warning}>{warning}</Text> : null}
                </View>
            </View>
            {buttons ? <View style={styles.buttonContainer}>{buttons}</View> : <Spacer size={24} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.white,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        marginTop: 14,
        gap: 12,
    },
    title: {
        textAlign: "center",
    },
    description: {
        textAlign: "center",
    },
    warning: {
        textAlign: "center",
        color: theme.color.information,
    },
    buttonContainer: {
        marginTop: 24,
        marginBottom: 16,
        gap: 16,
    },
});
