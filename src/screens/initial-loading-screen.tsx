import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { LargestIcon } from "~/components/icon";
import { ScreenBackgroundLayout } from "~/components/screen-background-layout";
import { Spacer } from "~/components/spacer";
import { Spinner } from "~/components/spinner";
import { Text } from "~/components/text";
import { logger } from "~/logger";
import { useAuth } from "~/machines/authentication-machine";
import { theme } from "~/theme";

export function InitialLoadingActiveScreen() {
    const { t } = useTranslation();
    const [showLogoutButton, setShowLogoutButton] = React.useState(false);
    const [showConfirmLogout, setShowConfirmLogout] = React.useState(false);
    const [, send] = useAuth();

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setShowLogoutButton(true);
        }, 15_000);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    function onLogoutConfirmed() {
        send({ type: "LOGOUT" });
    }

    return (
        <ScreenBackgroundLayout>
            <View style={styles.container}>
                <Spinner />
                <Spacer size={42} />
                <Text size={22} style={styles.text} weight="bold">
                    {t("initialLoading.active")}
                </Text>
                {showLogoutButton ? (
                    <>
                        <Spacer size={30} />
                        <Button
                            onPress={() => setShowConfirmLogout(true)}
                            variant="secondary-outlined"
                            title={t("menu.exit.button")}
                        />
                    </>
                ) : null}
            </View>

            <Dialog
                visible={showConfirmLogout}
                icon="lock"
                title={t("menu.exit.title")}
                buttons={
                    <>
                        <Button title={t("menu.exit.button")} onPress={onLogoutConfirmed} />
                        <Button
                            title={t("modal.cancel")}
                            variant="secondary-outlined"
                            onPress={() => setShowConfirmLogout(false)}
                        />
                    </>
                }
                onBackButtonPress={() => setShowConfirmLogout(false)}
            />
        </ScreenBackgroundLayout>
    );
}

type InitialLoadingFailedScreenProps = {
    onRetry: () => void;
};

export function InitialLoadingFailedScreen(props: InitialLoadingFailedScreenProps) {
    const { t } = useTranslation();
    const [, send] = useAuth();
    const [showDebugDialog, setShowDebugDialog] = React.useState(false);
    const [showConfirmLogout, setShowConfirmLogout] = React.useState(false);
    const [isShareLogsInProgress, setIsShareLogsInProgress] = React.useState(false);

    function onModalClose() {
        setShowDebugDialog(false);
    }

    function onShareLogsPress() {
        setIsShareLogsInProgress(true);
        logger
            .share()
            .catch((error) => {
                logger.error("Failed to share logs", error);
                setShowDebugDialog(true);
            })
            .finally(() => {
                setIsShareLogsInProgress(false);
            });
    }

    function onLogoutConfirmed() {
        send({ type: "LOGOUT" });
    }

    return (
        <ScreenBackgroundLayout>
            <View style={styles.container}>
                <View style={styles.alignItems}>
                    <LargestIcon name="failure" />
                </View>
                <Spacer size={42} />
                <Text size={22} style={styles.text} weight="bold">
                    {t("initialLoading.failure")}
                </Text>
                <Spacer size={30} />
                <Button onPress={props.onRetry} title={t("initialLoading.retry")} />
                <Spacer size={16} />
                <Button
                    onPress={() => setShowConfirmLogout(true)}
                    variant="secondary-outlined"
                    title={t("menu.exit.button")}
                />
                <Spacer size={16} />
                <Button
                    onPress={onShareLogsPress}
                    variant="secondary-dark"
                    title={t("initialLoading.sendDebugInfo")}
                    disabled={isShareLogsInProgress}
                />
            </View>
            <Dialog
                visible={showDebugDialog}
                icon="failure"
                title={t("about.debugInfo.failure.title")}
                buttons={<Button title={t("modal.close")} onPress={onModalClose} />}
            />
            <Dialog
                visible={showConfirmLogout}
                icon="lock"
                title={t("menu.exit.title")}
                buttons={
                    <>
                        <Button title={t("menu.exit.button")} onPress={onLogoutConfirmed} />
                        <Button
                            title={t("modal.cancel")}
                            variant="secondary-outlined"
                            onPress={() => setShowConfirmLogout(false)}
                        />
                    </>
                }
                onBackButtonPress={() => setShowConfirmLogout(false)}
            />
        </ScreenBackgroundLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingVertical: 34,
        paddingHorizontal: 36,
        borderRadius: 8,
        backgroundColor: theme.color.white,
    },
    alignItems: {
        alignItems: "center",
    },
    text: {
        textAlign: "center",
    },
});
