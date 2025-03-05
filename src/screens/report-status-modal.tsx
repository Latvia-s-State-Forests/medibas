import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { useDarkStatusBar } from "~/hooks/use-status-bar";
import { getAppLanguage } from "~/i18n";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";

type ReportStatusModalProps = NativeStackScreenProps<RootNavigatorParams, "ReportStatusModal">;

export function ReportStatusModal(props: ReportStatusModalProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const reportId = props.route.params.reportId;
    const report = useReport(reportId);
    const isPendingNetwork = useIsReportWaitingForNetwork(reportId);
    const progress = useReportProgress(reportId);
    const { errorMessages } = useClassifiers();
    const reportsService = useReportsContext();

    useDarkStatusBar();

    if (!report) {
        navigation.goBack();
        return null;
    }

    let icon;
    let title;
    let description;
    let buttons;

    if (isPendingNetwork) {
        icon = <Spinner />;
        title = t("reportStatus.pendingNetwork");
        description = t("reportStatus.info");
        buttons = <Button title={t("reportStatus.continueInItemsList")} onPress={() => navigation.goBack()} />;
    } else if (report.status === "pending") {
        icon = <Spinner />;
        title = t("reportStatus.pending");
        description = t("reportStatus.info");
        buttons = <Button title={t("reportStatus.continueInItemsList")} onPress={() => navigation.goBack()} />;
    } else if (report.status === "loading") {
        icon = <Spinner progress={report.photo ? progress : undefined} />;
        title = t("reportStatus.loading");
        description = t("reportStatus.info");
        buttons = <Button title={t("reportStatus.continueInItemsList")} onPress={() => navigation.goBack()} />;
    } else if (report.status === "success") {
        icon = <LargestIcon name="success" />;
        title = t("reportStatus.success");
        const strapNumber = report.result?.strapNumber;
        description = strapNumber
            ? t("reportStatus.strapNumberUsed", { strapNumber })
            : (description = t("reportStatus.info"));
        buttons = <Button title={t("reportStatus.continue")} onPress={() => navigation.goBack()} />;
    } else if (report.status === "failure") {
        const language = getAppLanguage();
        description = match(report.error)
            .with({ type: "server" }, (error) => {
                const defaultErrorMessage = t("reportStatus.unknownError");
                try {
                    const errorDescription = error.description ? JSON.parse(error.description) : undefined;
                    let errorMessage = errorMessages.options.find(
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
                } catch (error) {
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
            <>
                <Button
                    title={t("reportStatus.retry")}
                    onPress={() => reportsService.send({ type: "RETRY", reportId })}
                />
                <Button
                    title={t("reportStatus.retryLater")}
                    variant="secondary-outlined"
                    onPress={() => navigation.goBack()}
                />
            </>
        );
    } else {
        navigation.goBack();
        return null;
    }

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top + 16,
                    paddingBottom: insets.bottom + 16,
                    paddingRight: insets.right + 16,
                    paddingLeft: insets.left + 16,
                },
            ]}
        >
            <View style={styles.headerContainer}>
                {icon}
                <Spacer size={42} />
                <Text size={22} weight="bold" style={styles.title}>
                    {title}
                </Text>
                <Spacer size={12} />
                <Text style={styles.description}>{description}</Text>
                {report.inAfricanSwineFeverZone ? (
                    <>
                        <Spacer size={12} />
                        <Text style={styles.warning}>{t("reports.analysisRequired")}</Text>
                    </>
                ) : null}
            </View>
            <Spacer size={30} />
            <View style={styles.footerContainer}>{buttons}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    headerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
    footerContainer: {
        rowGap: 16,
    },
});
