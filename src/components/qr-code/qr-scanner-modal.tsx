import { Camera, CameraView } from "expo-camera";
import * as Linking from "expo-linking";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AppState, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { logger } from "~/logger";
import { theme } from "~/theme";
import { Button } from "../button";
import { LargestIcon, MediumIcon } from "../icon";
import { Spinner } from "../spinner";
import { Text } from "../text";

type QRScannerModalProps = {
    visible: boolean;
    onScanned: (data: string) => void;
    onClose: () => void;
    children?: React.ReactNode;
};

export function QRScannerModal(props: QRScannerModalProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [permissions, setPermissions] = React.useState<"loading" | "granted" | "denied">("loading");

    const requestPermissions = React.useCallback(() => {
        if (!props.visible) {
            return;
        }

        Camera.getCameraPermissionsAsync()
            .then((response) => {
                if (response.granted) {
                    setPermissions("granted");
                    return;
                }

                Camera.requestCameraPermissionsAsync()
                    .then((response) => {
                        if (response.granted) {
                            setPermissions("granted");
                        } else {
                            setPermissions("denied");
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to request camera permissions", error);
                        setPermissions("denied");
                    });
            })
            .catch((error) => {
                logger.error("Failed to get camera permissions", error);
                setPermissions("denied");
            });
    }, [props.visible]);

    React.useEffect(() => {
        requestPermissions();
    }, [requestPermissions]);

    function onQrCodeScanned({ data }: { data: string }) {
        props.onScanned(data);
    }

    function onCloseScannerButtonPress() {
        props.onClose();
    }

    async function openSettings() {
        await Linking.openSettings();

        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                requestPermissions();
                subscription.remove();
            }
        });
    }

    return (
        <Modal visible={props.visible} onRequestClose={onCloseScannerButtonPress} statusBarTranslucent>
            <View style={[styles.statusBar, { height: insets.top }]} />
            <View style={styles.containerModal}>
                {match(permissions)
                    .with("loading", () => (
                        <View style={styles.loading}>
                            <Spinner />
                        </View>
                    ))
                    .with("denied", () => (
                        <View
                            style={[
                                styles.messageContainer,
                                {
                                    paddingTop: insets.top + 16,
                                    paddingRight: insets.right + 16,
                                    paddingBottom: insets.bottom + 16,
                                    paddingLeft: insets.left + 16,
                                },
                            ]}
                        >
                            <LargestIcon name="failure" />
                            <Text color="white" size={18} weight="bold" style={styles.title}>
                                {t("qrScanner.failure.title")}
                            </Text>
                            <Text color="white" style={styles.description}>
                                {t("qrScanner.failure.description")}
                            </Text>
                            <Button
                                title={t("qrScanner.failure.button")}
                                onPress={openSettings}
                                variant="link"
                                style={styles.button}
                            />
                        </View>
                    ))
                    .with("granted", () => (
                        <CameraView
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr"],
                            }}
                            onBarcodeScanned={onQrCodeScanned}
                            style={styles.camera}
                        />
                    ))
                    .exhaustive()}

                <TouchableOpacity
                    onPress={props.onClose}
                    activeOpacity={0.5}
                    style={[
                        styles.closeButton,
                        {
                            top: insets.top + 16,
                            right: insets.right + 16,
                        },
                    ]}
                >
                    <MediumIcon color="white" name="close" />
                </TouchableOpacity>
            </View>
            {props.children}
        </Modal>
    );
}

const styles = StyleSheet.create({
    statusBar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        opacity: 0.8,
        backgroundColor: theme.color.green,
        zIndex: 1,
    },
    containerModal: {
        flex: 1,
        backgroundColor: theme.color.gray9,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    camera: {
        height: "100%",
        width: "100%",
    },
    closeButton: {
        position: "absolute",
        backgroundColor: theme.color.gray8,
        padding: 12,
        borderRadius: 24,
        right: 16,
        top: 16,
        opacity: 0.8,
    },
    loading: {
        justifyContent: "center",
        alignItems: "center",
    },
    messageContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        marginTop: 24,
        textAlign: "center",
    },
    description: {
        marginTop: 12,
        textAlign: "center",
    },
    button: {
        marginTop: 16,
    },
});
