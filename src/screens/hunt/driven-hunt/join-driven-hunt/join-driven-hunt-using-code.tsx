import NetInfo from "@react-native-community/netinfo";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { api } from "~/api";
import { Button } from "~/components/button";
import { QRScannerModal } from "~/components/qr-code/qr-scanner-modal";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { ParticipantRole } from "~/types/hunts";
import { getErrorMessageFromApi } from "~/utils/error-message-from-api";
import { decodeHuntQrCode } from "../../encode-hunt-qr-code";
import { Modal } from "../modal";
import { FailureMessage } from "./failure-message";
import { getHuntTitle } from "./get-hunt-title";
import { HunterConfirmation } from "./hunter-confirmation";
import { LoadingMessage } from "./loading-message";
import { SuccessMessage } from "./success-message";

export function JoinDrivenHuntUsingCode() {
    const { t } = useTranslation();
    const profile = useProfile();
    const classifiers = useClassifiers();
    const [showScannerModal, setShowScannerModal] = React.useState(false);
    const [showStatusModal, setShowStatusModal] = React.useState(false);
    const [status, setStatus] = React.useState<
        | { type: "idle" }
        | { type: "confirming"; title: string; eventGuid: string }
        | { type: "joining" }
        | { type: "success" }
        | { type: "failureScanner" }
        | { type: "failureNetwork" }
        | { type: "failureCode"; errorCode: number }
        | { type: "failureOther" }
    >({
        type: "idle",
    });

    async function onScanned(qrCode: string) {
        if (!showScannerModal || showStatusModal) {
            return;
        }

        try {
            const { eventGuid, vmdCode, districts, plannedFrom } = decodeHuntQrCode(qrCode);
            const title = getHuntTitle(vmdCode, districts, plannedFrom);
            setStatus({ type: "confirming", title, eventGuid });
            setShowStatusModal(true);
            logger.log("JDHUC", "Scanner success", { title, eventGuid });
        } catch (error) {
            setStatus({ type: "failureScanner" });
            setShowStatusModal(true);
            logger.log("JDHUC", "Scanner failure", qrCode, error);
        }
    }

    async function onConfirm(eventGuid: string, role: ParticipantRole) {
        logger.log("JDHUC", "Join confirmed", { eventGuid, role });
        try {
            setStatus({ type: "joining" });
            const network = await NetInfo.fetch();
            if (!network.isConnected || !network.isInternetReachable) {
                setStatus({ type: "failureNetwork" });
                logger.log("JDHUC", "Join network failure");
                return;
            }

            const result = await api.joinHunt({
                eventGuid,
                participantGuid: randomUUID(),
                fullName: [profile.firstName, profile.lastName].join(" "),
                participantRoleId: role,
            });

            if (!result.success) {
                if (result.errorCode) {
                    setStatus({ type: "failureCode", errorCode: result.errorCode });
                    logger.log("JDHUC", "Join code failure", result.errorCode);
                } else {
                    setStatus({ type: "failureOther" });
                    logger.log("JDHUC", "Join other failure");
                }
                return;
            }

            await queryClient.invalidateQueries({ queryKey: queryKeys.hunts });

            setStatus({ type: "success" });
            logger.log("JDHUC", "Join success");
        } catch (error) {
            logger.error("Failed to join hunt due to an unexpected error", error);
            setStatus({ type: "failureOther" });
            logger.log("JDHUC", "Join other failure");
        }
    }

    return (
        <>
            <Button
                icon="scan"
                title={t("hunt.drivenHunt.join.scan")}
                variant="secondary-dark"
                onPress={() => {
                    setShowScannerModal(true);
                    logger.log("JDHUC", "Open scanner");
                }}
            />
            <QRScannerModal
                visible={showScannerModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setShowScannerModal(false);
                    logger.log("JDHUC", "Close scanner");
                }}
                onScanned={onScanned}
            >
                <Modal
                    visible={showStatusModal}
                    onBackButtonPress={() => {
                        if (status.type !== "joining") {
                            setShowStatusModal(false);
                            logger.log("JDHUC", "Close status");
                        }
                    }}
                >
                    {match(status)
                        .with({ type: "confirming" }, (status) => {
                            return (
                                <HunterConfirmation
                                    huntTitle={status.title}
                                    onConfirm={(role) => {
                                        onConfirm(status.eventGuid, role);
                                    }}
                                    onReject={() => {
                                        setShowStatusModal(false);
                                        logger.log("JDHUC", "Join rejected");
                                    }}
                                />
                            );
                        })
                        .with({ type: "joining" }, () => {
                            return <LoadingMessage title={t("hunt.drivenHunt.join.joining.title")} />;
                        })
                        .with({ type: "success" }, () => {
                            return (
                                <SuccessMessage
                                    onContinue={() => {
                                        setShowStatusModal(false);
                                        setShowScannerModal(false);
                                        logger.log("JDHUC", "Success confirmed");
                                    }}
                                />
                            );
                        })
                        .with({ type: "failureScanner" }, () => {
                            return (
                                <FailureMessage
                                    title={t("hunt.drivenHunt.join.failureScanner.title")}
                                    description={t("hunt.drivenHunt.join.failureScanner.description")}
                                    onClose={() => {
                                        setShowStatusModal(false);
                                        setShowScannerModal(false);
                                        logger.log("JDHUC", "Scanner failure confirmed");
                                    }}
                                />
                            );
                        })
                        .with({ type: "failureNetwork" }, () => {
                            return (
                                <FailureMessage
                                    title={t("hunt.drivenHunt.join.failureNetwork.title")}
                                    description={t("hunt.drivenHunt.join.failureNetwork.description")}
                                    onClose={() => {
                                        setShowStatusModal(false);
                                        setShowScannerModal(false);
                                        logger.log("JDHUC", "Network failure confirmed");
                                    }}
                                />
                            );
                        })
                        .with({ type: "failureCode" }, (status) => {
                            const description =
                                getErrorMessageFromApi(status.errorCode, classifiers) ??
                                t("hunt.drivenHunt.join.failureErrorCode.descriptionFallback");
                            return (
                                <FailureMessage
                                    title={t("hunt.drivenHunt.join.failureErrorCode.title")}
                                    description={description}
                                    onClose={() => {
                                        setShowStatusModal(false);
                                        setShowScannerModal(false);
                                        logger.log("JDHUC", "Code failure confirmed");
                                    }}
                                />
                            );
                        })
                        .with({ type: "failureOther" }, () => {
                            return (
                                <FailureMessage
                                    title={t("hunt.drivenHunt.join.failureOther.title")}
                                    description={t("hunt.drivenHunt.join.failureOther.description")}
                                    onClose={() => {
                                        setShowStatusModal(false);
                                        setShowScannerModal(false);
                                        logger.log("JDHUC", "Other failure confirmed");
                                    }}
                                />
                            );
                        })
                        .otherwise(() => null)}
                </Modal>
            </QRScannerModal>
        </>
    );
}
