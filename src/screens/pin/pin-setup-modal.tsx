import { useMachine } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { Modal } from "~/components/modal/modal";
import { StatusModal } from "~/components/modal/status-modal";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { NumberPad } from "~/screens/pin/number-pad";
import { PinDisplay } from "~/screens/pin/pin-display";
import { pinSetupMachine } from "~/screens/pin/pin-setup-machine";

type PinSetupModalProps = {
    visible: boolean;
    onClose: () => void;
    reloadPinStatus: () => void;
};

export function PinSetupModal({ visible, onClose, reloadPinStatus }: PinSetupModalProps) {
    const { t } = useTranslation();
    const [state, send] = useMachine(pinSetupMachine);
    const isFailure = state.matches("failure");
    const isSuccess = state.matches("success");

    React.useEffect(() => {
        if (isSuccess || isFailure) {
            reloadPinStatus();

            const timeout = setTimeout(() => {
                onClose();
            }, 3000);
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [isSuccess, isFailure, onClose, reloadPinStatus]);

    function onEnterDigit(digit: number) {
        send({ type: "ENTER_DIGIT", digit });
    }

    function onRemoveDigit() {
        send({ type: "REMOVE_DIGIT" });
    }

    if (isSuccess) {
        return (
            <StatusModal
                visible={isSuccess}
                status="success"
                title={t("settings.pin.setup.success")}
                onClose={onClose}
            />
        );
    }

    if (isFailure) {
        return (
            <StatusModal
                visible={isFailure}
                status="failure"
                title={t("settings.pin.setup.failure")}
                onClose={onClose}
            />
        );
    }

    return (
        <Modal visible={visible} onClose={onClose}>
            <View style={styles.pinModal}>
                {state.matches("entering") && (
                    <>
                        <Text size={16} weight="bold">
                            {t("settings.pin.setup.enteringTitle")}
                        </Text>
                        <Spacer size={24} />
                        <PinDisplay length={state.context.length} filled={state.context.pin.length} />
                    </>
                )}
                {state.matches("confirming") && (
                    <>
                        <Text size={16} weight="bold">
                            {t("settings.pin.setup.confirmingTitle")}
                        </Text>
                        <Spacer size={24} />
                        <PinDisplay length={state.context.length} filled={state.context.pinConfirmation.length} />
                    </>
                )}
                <Spacer size={24} />
                <NumberPad onBackspacePress={onRemoveDigit} onNumberPress={onEnterDigit} />
                <Button title={t("modal.cancel")} onPress={onClose} variant="secondary-light" />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    pinModal: {
        padding: 16,
        alignItems: "center",
    },
});
