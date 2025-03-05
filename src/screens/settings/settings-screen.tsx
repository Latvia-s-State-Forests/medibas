import { useInterpret } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { appStorage } from "~/app-storage";
import { FieldLabel } from "~/components/field-label";
import { Header } from "~/components/header";
import { PressableListItem } from "~/components/list/pressable-list-item";
import { DeleteConfirmationModal } from "~/components/modal/delete-confirmation-modal";
import { StatusModal } from "~/components/modal/status-modal";
import { SegmentedControl } from "~/components/segmented-control";
import { AppLanguage, getAppLanguage, setAppLanguage } from "~/i18n";
import { logger } from "~/logger";
import { PinSetupModal } from "~/screens/pin/pin-setup-modal";
import { theme } from "~/theme";
import { deletePin, getPin } from "~/utils/secure-storage";
import { accountDeletionMachine } from "./account-deletion-machine";
import { AccountDeletionStatus } from "./account-deletion-status";

interface SettingsState {
    pinStatus: "loading" | "available" | "missing";
    isPinSetupOpen: boolean;
    isPinDeleteConfirmationOpen: boolean;
    isPinDeletedConfirmationOpen: boolean;
}

export function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [state, setState] = React.useState<SettingsState>({
        pinStatus: "loading",
        isPinSetupOpen: false,
        isPinDeleteConfirmationOpen: false,
        isPinDeletedConfirmationOpen: false,
    });

    const accountDeletionActor = useInterpret(() => accountDeletionMachine);

    // Check if PIN is configured
    React.useEffect(() => {
        if (state.pinStatus === "loading") {
            getPin()
                .then((pin) => {
                    setState((state) => ({ ...state, pinStatus: pin ? "available" : "missing" }));
                })
                .catch((error) => {
                    setState((state) => ({ ...state, pinStatus: "missing" }));
                    logger.error("Failed to get pin", error);
                });
        }
    }, [state.pinStatus]);

    // Close PIN deleted confirmation
    React.useEffect(() => {
        if (state.isPinDeletedConfirmationOpen) {
            const timeout = setTimeout(closePinDeletedConfirmation, 3000);

            return () => {
                clearTimeout(timeout);
            };
        }
    }, [state.isPinDeletedConfirmationOpen]);

    function onLanguageChange(language: string) {
        setAppLanguage(language as AppLanguage);
        appStorage.setLanguage(language as AppLanguage);
    }

    function onDeleteAccountPress() {
        accountDeletionActor.send({ type: "DELETE" });
    }

    function openPinSetup() {
        setState((state) => ({ ...state, isPinSetupOpen: true }));
    }

    function closePinDeleteConfirmation() {
        setState((state) => ({ ...state, isPinDeleteConfirmationOpen: false }));
    }

    function openPinDeleteConfirmation() {
        setState((state) => ({ ...state, isPinDeleteConfirmationOpen: true }));
    }

    function closePinDeletedConfirmation() {
        setState((state) => ({ ...state, isPinDeletedConfirmationOpen: false }));
    }

    const closePinSetup = React.useCallback(() => {
        setState((state) => ({ ...state, isPinSetupOpen: false }));
    }, []);

    const reloadPinStatus = React.useCallback(() => {
        setState((state) => ({ ...state, pinStatus: "loading" }));
    }, []);

    async function removePin() {
        try {
            await deletePin();
        } catch (error) {
            logger.error("Failed to remove pin", error);
        } finally {
            setState((state) => ({
                ...state,
                pinStatus: "missing",
                isPinDeleteConfirmationOpen: false,
                isPinDeletedConfirmationOpen: true,
            }));
        }
    }

    const language = getAppLanguage();

    return (
        <>
            <View style={styles.container}>
                <Header title={t("settings.title")} />
                <ScrollView contentContainerStyle={styles.body}>
                    <SegmentedControl
                        style={{ paddingLeft: insets.left + 16, paddingRight: insets.right + 16 }}
                        value={language}
                        onChange={onLanguageChange}
                        label={t("settings.language.label")}
                        options={[
                            {
                                label: t("settings.language.lv"),
                                value: "lv",
                            },
                            {
                                label: t("settings.language.en"),
                                value: "en",
                            },
                            {
                                label: t("settings.language.ru"),
                                value: "ru",
                            },
                        ]}
                    />

                    <FieldLabel
                        label={t("settings.pin.label")}
                        style={[styles.label, { paddingLeft: insets.left + 16, paddingRight: insets.right + 16 }]}
                    />
                    {state.pinStatus === "available" && (
                        <>
                            <PressableListItem
                                label={t("settings.pin.actions.change")}
                                onPress={openPinSetup}
                                background="white"
                            />
                            <PressableListItem
                                label={t("settings.pin.actions.delete")}
                                onPress={openPinDeleteConfirmation}
                                background="white"
                            />
                        </>
                    )}
                    {state.pinStatus === "missing" && (
                        <>
                            <PressableListItem
                                label={t("settings.pin.actions.setup")}
                                onPress={openPinSetup}
                                background="white"
                            />
                        </>
                    )}

                    <FieldLabel
                        label={t("settings.deleteAccount.label")}
                        style={[styles.label, { paddingLeft: insets.left + 16, paddingRight: insets.right + 16 }]}
                    />
                    <PressableListItem
                        label={t("settings.deleteAccount.button")}
                        onPress={onDeleteAccountPress}
                        background="white"
                    />
                </ScrollView>
            </View>

            {state.isPinSetupOpen && (
                <PinSetupModal
                    reloadPinStatus={reloadPinStatus}
                    visible={state.isPinSetupOpen}
                    onClose={closePinSetup}
                />
            )}

            {state.isPinDeleteConfirmationOpen && (
                <DeleteConfirmationModal
                    visible={state.isPinDeleteConfirmationOpen}
                    variant="danger"
                    title={t("settings.pin.deleteConfirmation.title")}
                    onClose={closePinDeleteConfirmation}
                    onCancel={closePinDeleteConfirmation}
                    onConfirm={removePin}
                />
            )}
            {state.isPinDeletedConfirmationOpen && (
                <StatusModal
                    status="success"
                    title={t("settings.pin.deletedConfirmation.title")}
                    visible={state.isPinDeletedConfirmationOpen}
                    onClose={closePinDeletedConfirmation}
                />
            )}

            <AccountDeletionStatus actor={accountDeletionActor} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        paddingVertical: 24,
    },
    label: {
        marginTop: 24,
        marginBottom: 16,
    },
});
