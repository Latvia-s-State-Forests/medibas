import { Buffer } from "buffer";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/button";
import { QRScannerModal } from "~/components/qr-code/qr-scanner-modal";
import { logger } from "~/logger";
import { Beater, Hunter, HuntEventStatus } from "~/types/hunts";
import { ProfileQrCode, profileQrCodeSchema } from "~/types/profile";
import { MessageModal } from "./message-modal";

type BeaterScannerModalProps = {
    visible: boolean;
    hunters: Hunter[];
    beaters: Beater[];
    onConfirm: (userId: number, fullName: string, personId?: number) => void;
    onReject: () => void;
};

export function BeaterScannerModal(props: BeaterScannerModalProps) {
    const { t } = useTranslation();
    const [profile, setProfile] = React.useState<ProfileQrCode | undefined>();
    const [confirmation, setConfirmation] = React.useState(false);
    const [parseFailure, setParseFailure] = React.useState(false);
    const [duplicateFailure, setDuplicateFailure] = React.useState(false);
    const [mismatchFailure, setMismatchFailure] = React.useState(false);

    function onScanned(data: string) {
        const encodedData = Buffer.from(data, "base64").toString("utf-8");
        if (confirmation || parseFailure || mismatchFailure) {
            return;
        }
        try {
            const profile = profileQrCodeSchema.parse(JSON.parse(encodedData));
            setProfile(profile);

            const beater = props.beaters.find(
                (beater) =>
                    (beater.userId === profile.uid || (profile.pid && beater.hunterPersonId === profile.pid)) &&
                    beater.statusId !== HuntEventStatus.PausedForParticipants
            );
            if (beater) {
                setDuplicateFailure(true);
                return;
            }

            const hunter = props.hunters.find(
                (hunter) => hunter.personId === profile.pid && hunter.statusId !== HuntEventStatus.PausedForParticipants
            );
            if (hunter) {
                setMismatchFailure(true);
                return;
            }

            setConfirmation(true);
        } catch (error) {
            logger.error("Failed to parse beater's code", data, error);
            setParseFailure(true);
        }
    }

    function onConfirm() {
        if (profile) {
            props.onConfirm(profile.uid, [profile.fn, profile.ln].join(" "), profile.pid);
            setConfirmation(false);
        }
    }

    return (
        <QRScannerModal visible={props.visible} onScanned={onScanned} onClose={props.onReject}>
            <MessageModal
                visible={confirmation}
                icon="hunt"
                title={t("hunt.drivenHunt.beaterManagement.scanner.confirmation.title", {
                    beater: profile ? [profile.fn, profile.ln].join(" ") : "??",
                })}
                onBackButtonPress={() => {
                    setConfirmation(false);
                }}
                buttons={
                    <>
                        <Button
                            title={t("hunt.drivenHunt.beaterManagement.scanner.confirmation.confirm")}
                            onPress={onConfirm}
                        />
                        <Button
                            title={t("hunt.drivenHunt.beaterManagement.scanner.confirmation.reject")}
                            onPress={() => {
                                setConfirmation(false);
                            }}
                            variant="secondary-outlined"
                        />
                    </>
                }
            />
            <MessageModal
                visible={parseFailure}
                icon="failure"
                title={t("hunt.drivenHunt.beaterManagement.scanner.parseFailure.title")}
                description={t("hunt.drivenHunt.beaterManagement.scanner.parseFailure.description")}
                buttons={
                    <Button
                        title={t("hunt.drivenHunt.beaterManagement.scanner.parseFailure.button")}
                        onPress={() => {
                            setParseFailure(false);
                        }}
                    />
                }
            />
            <MessageModal
                visible={duplicateFailure}
                icon="failure"
                title={t("hunt.drivenHunt.beaterManagement.scanner.duplicateFailure.title")}
                description={t("hunt.drivenHunt.beaterManagement.scanner.duplicateFailure.description", {
                    beater: profile ? [profile.fn, profile.ln].join(" ") : "??",
                })}
                buttons={
                    <Button
                        title={t("hunt.drivenHunt.beaterManagement.scanner.duplicateFailure.button")}
                        onPress={() => {
                            setDuplicateFailure(false);
                        }}
                    />
                }
            />
            <MessageModal
                visible={mismatchFailure}
                icon="failure"
                title={t("hunt.drivenHunt.beaterManagement.scanner.mismatchFailure.title")}
                description={t("hunt.drivenHunt.beaterManagement.scanner.mismatchFailure.description", {
                    beater: profile ? [profile.fn, profile.ln].join(" ") : "??",
                })}
                buttons={
                    <Button
                        title={t("hunt.drivenHunt.beaterManagement.scanner.mismatchFailure.button")}
                        onPress={() => {
                            setMismatchFailure(false);
                        }}
                    />
                }
            />
        </QRScannerModal>
    );
}
