import * as React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { MediumIcon } from "~/components/icon";
import { Text } from "~/components/text";
import { onAppSelect, onNavigate } from "~/utils/navigate-to-location";
import { Modal } from "../screens/hunt/driven-hunt/modal";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Spacer } from "./spacer";

type NavigationButtonProps = {
    latitude: number;
    longitude: number;
    locationLabel: string;
};

export function NavigationButton(props: NavigationButtonProps) {
    const { t } = useTranslation();
    const [availableAppsDialogVisible, setAvailableAppsDialogVisible] = React.useState(false);
    const [failureDialogVisible, setFailureDialogVisible] = React.useState(false);
    const [availableApps, setAvailableApps] = React.useState<Array<{ name: string; link: string }>>([]);
    const [isPressed, setIsPressed] = React.useState(false);

    function onNavigatePress() {
        onNavigate(
            props.latitude,
            props.longitude,
            props.locationLabel,
            setAvailableApps,
            setAvailableAppsDialogVisible,
            setFailureDialogVisible
        );
    }

    function onAppSelectPress(appName: string) {
        onAppSelect(
            appName,
            availableApps,
            props.latitude,
            props.longitude,
            props.locationLabel,
            setAvailableAppsDialogVisible
        );
    }

    function onPressIn() {
        setIsPressed(true);
    }

    function onPressOut() {
        setIsPressed(false);
    }

    const pressedStyle = isPressed ? "tealPressed" : "teal";

    return (
        <>
            <Pressable
                onPress={onNavigatePress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={styles.navigateButton}
            >
                <Text color={pressedStyle} weight="bold">
                    {t("navigation.navigate")}
                </Text>
                <Spacer horizontal size={16} />
                <MediumIcon name="marker" color={pressedStyle} />
            </Pressable>
            <Modal visible={availableAppsDialogVisible} onBackButtonPress={() => setAvailableAppsDialogVisible(false)}>
                <View>
                    <Text style={styles.title} size={18} weight="bold">
                        {t("navigation.chooseApp")}
                    </Text>
                    <View style={styles.appButtonsContainer}>
                        {availableApps.map((app, index) => (
                            <View key={`${index}-${app.name}`}>
                                <Button title={app.name} onPress={() => onAppSelectPress(app.name)} />
                            </View>
                        ))}
                        <Button
                            variant="secondary-outlined"
                            title={t("navigation.cancel")}
                            onPress={() => setAvailableAppsDialogVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
            <Dialog
                visible={failureDialogVisible}
                icon="failure"
                title={t("navigation.androidError")}
                buttons={<Button title={t("general.close")} onPress={() => setFailureDialogVisible(false)} />}
            />
        </>
    );
}

const styles = StyleSheet.create({
    navigateButton: {
        height: 48,
        paddingLeft: 16,
        alignItems: "center",
        flexDirection: "row",
    },
    title: {
        marginTop: 8,
        marginBottom: 16,
    },
    appButtonsContainer: {
        gap: 8,
    },
});
