import { Buffer } from "buffer";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { Button } from "~/components/button";
import { QRScannerModal } from "~/components/qr-code/qr-scanner-modal";
import { logger } from "~/logger";
import { Beater, Hunter, HuntEventStatus } from "~/types/hunts";
import { ProfileQrCode, profileQrCodeSchema } from "~/types/profile";
import { MessageModal } from "./message-modal";

type HunterScannerModalProps = {
    visible: boolean;
    hunters: Hunter[];
    beaters: Beater[];
    onConfirm: (personId: number, fullName: string, cardNumber: string) => void;
    onReject: () => void;
};

export function HunterScannerModal(props: HunterScannerModalProps) {
    const { t } = useTranslation();
    const [profile, setProfile] = React.useState<ProfileQrCode | undefined>();
    const [confirmation, setConfirmation] = React.useState(false);
    const [parseFailure, setParseFailure] = React.useState(false);
    const [cardFailure, setCardFailure] = React.useState(false);
    const [duplicateFailure, setDuplicateFailure] = React.useState(false);
    const [mismatchFailure, setMismatchFailure] = React.useState(false);

    function onScanned(data: string) {
        const encodedData = Buffer.from(data, "base64").toString("utf-8");
        if (confirmation || parseFailure || cardFailure || duplicateFailure || mismatchFailure) {
            return;
        }
        try {
            const profile = profileQrCodeSchema.parse(JSON.parse(encodedData));
            setProfile(profile);

            const hunter = props.hunters.find(
                (hunter) => hunter.personId === profile.pid && hunter.statusId !== HuntEventStatus.PausedForParticipants
            );
            if (hunter) {
                setDuplicateFailure(true);
                return;
            }

            const beater = props.beaters.find(
                (beater) =>
                    (beater.userId === profile.uid || (profile.pid && beater.hunterPersonId === profile.pid)) &&
                    beater.statusId !== HuntEventStatus.PausedForParticipants
            );
            if (beater) {
                setMismatchFailure(true);
                return;
            }

            if (!profile.sc) {
                setCardFailure(true);
                return;
            }

            setConfirmation(true);
        } catch (error) {
            logger.error("Failed to parse hunters's code", data, error);
            setParseFailure(true);
        }
    }

    function onConfirm() {
        if (profile && profile.pid && profile.cn) {
            props.onConfirm(profile.pid, [profile.fn, profile.ln].join(" "), profile.cn);
            setConfirmation(false);
        }
    }

    const showMessageModal = React.useMemo(
        () => confirmation || parseFailure || cardFailure || duplicateFailure || mismatchFailure,
        [confirmation, parseFailure, cardFailure, duplicateFailure, mismatchFailure]
    );

    return (
        <QRScannerModal visible={props.visible} onScanned={onScanned} onClose={props.onReject}>
            {match({ confirmation, parseFailure, cardFailure, duplicateFailure, mismatchFailure })
                .with({ parseFailure: true }, () => (
                    <MessageModal
                        visible={showMessageModal}
                        icon="failure"
                        title={t("hunt.drivenHunt.hunterManagement.scanner.parseFailure.title")}
                        description={t("hunt.drivenHunt.hunterManagement.scanner.parseFailure.description")}
                        buttons={
                            <Button
                                title={t("hunt.drivenHunt.hunterManagement.scanner.parseFailure.button")}
                                onPress={() => {
                                    setParseFailure(false);
                                }}
                            />
                        }
                    />
                ))
                .with({ cardFailure: true }, () => (
                    <MessageModal
                        visible={showMessageModal}
                        icon="failure"
                        title={t("hunt.drivenHunt.hunterManagement.scanner.cardFailure.title")}
                        description={t("hunt.drivenHunt.hunterManagement.scanner.cardFailure.description", {
                            hunter: profile ? [profile.fn, profile.ln, profile.cn].join(" ") : "??",
                        })}
                        buttons={
                            <Button
                                title={t("hunt.drivenHunt.hunterManagement.scanner.cardFailure.button")}
                                onPress={() => {
                                    setCardFailure(false);
                                }}
                            />
                        }
                    />
                ))
                .with({ duplicateFailure: true }, () => (
                    <MessageModal
                        visible={showMessageModal}
                        icon="failure"
                        title={t("hunt.drivenHunt.hunterManagement.scanner.duplicateFailure.title")}
                        description={t("hunt.drivenHunt.hunterManagement.scanner.duplicateFailure.description", {
                            hunter: profile ? [profile.fn, profile.ln, profile.cn].join(" ") : "??",
                        })}
                        buttons={
                            <Button
                                title={t("hunt.drivenHunt.hunterManagement.scanner.duplicateFailure.button")}
                                onPress={() => {
                                    setDuplicateFailure(false);
                                }}
                            />
                        }
                    />
                ))
                .with({ mismatchFailure: true }, () => (
                    <MessageModal
                        visible={showMessageModal}
                        icon="failure"
                        title={t("hunt.drivenHunt.hunterManagement.scanner.mismatchFailure.title")}
                        description={t("hunt.drivenHunt.hunterManagement.scanner.mismatchFailure.description", {
                            hunter: profile ? [profile.fn, profile.ln, profile.cn].join(" ") : "??",
                        })}
                        buttons={
                            <Button
                                title={t("hunt.drivenHunt.hunterManagement.scanner.mismatchFailure.button")}
                                onPress={() => {
                                    setMismatchFailure(false);
                                }}
                            />
                        }
                    />
                ))
                .otherwise(() => (
                    <MessageModal
                        visible={showMessageModal}
                        icon="hunt"
                        title={t("hunt.drivenHunt.hunterManagement.scanner.confirmation.title", {
                            hunter: profile ? [profile.fn, profile.ln, profile.cn].join(" ") : "??",
                        })}
                        onBackButtonPress={() => {
                            setConfirmation(false);
                        }}
                        buttons={
                            <>
                                <Button
                                    title={t("hunt.drivenHunt.hunterManagement.scanner.confirmation.confirm")}
                                    onPress={onConfirm}
                                />
                                <Button
                                    title={t("hunt.drivenHunt.hunterManagement.scanner.confirmation.reject")}
                                    onPress={() => {
                                        setConfirmation(false);
                                    }}
                                    variant="secondary-outlined"
                                />
                            </>
                        }
                    />
                ))}
        </QRScannerModal>
    );
}
