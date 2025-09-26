import { useMachine } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ScreenBackgroundLayout } from "~/components/screen-background-layout";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { AuthAction } from "~/machines/authentication-machine";
import { LoadingScreen } from "~/screens/loading-screen";
import { NumberPad } from "~/screens/pin/number-pad";
import { PinDisplay } from "~/screens/pin/pin-display";
import { pinValidatorMachine } from "~/screens/pin/pin-validator-machine";
import { theme } from "~/theme";

export function PinValidatorScreen() {
    const { t } = useTranslation();

    const [state, send] = useMachine(
        pinValidatorMachine.provide({
            actions: {
                onSuccess: () => {
                    AuthAction.pinValid();
                },
                onFailure: () => {
                    AuthAction.pinInvalid();
                },
            },
        })
    );
    const { remainingAttempts, configuredPin, pin } = state.context;

    function onEnterDigit(digit: number) {
        send({ type: "ENTER_DIGIT", digit });
    }

    function onRemoveDigit() {
        send({ type: "REMOVE_DIGIT" });
    }

    if (state.matches("loading")) {
        return <LoadingScreen />;
    }

    return (
        <ScreenBackgroundLayout>
            <View style={styles.container}>
                <Text size={16} weight="bold">
                    {t("pinValidator.title")}
                </Text>
                {remainingAttempts < configuration.pin.maxValidationAttemptCount ? (
                    <Text style={styles.error}>{t("pinValidator.message", { remainingAttempts })}</Text>
                ) : (
                    <Spacer size={24} />
                )}
                <PinDisplay length={configuredPin.length} filled={pin.length} />
                <Spacer size={24} />
                <NumberPad onBackspacePress={onRemoveDigit} onNumberPress={onEnterDigit} />
            </View>
        </ScreenBackgroundLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 34,
        paddingHorizontal: 36,
        borderRadius: 8,
        backgroundColor: theme.color.white,
        alignItems: "center",
    },
    error: {
        color: theme.color.error,
        marginTop: 20,
        marginBottom: 24,
    },
});
