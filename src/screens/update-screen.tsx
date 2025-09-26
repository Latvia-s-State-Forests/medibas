import React from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { OtherSplashIcon } from "~/components/icons/other-splash-icon";
import { ScreenBackgroundLayout } from "~/components/screen-background-layout";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { i18n } from "~/i18n";
import { theme } from "~/theme";

type UpdateScreenProps = {
    mandatory: boolean;
    onPostpone: () => void;
};

export function UpdateScreen(props: UpdateScreenProps) {
    return (
        <ScreenBackgroundLayout>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <OtherSplashIcon width={150} />
                </View>
                {props.mandatory ? <UpdateMandatoryPopup /> : <UpdateOptionalPopup onPostpone={props.onPostpone} />}
            </View>
        </ScreenBackgroundLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
    },
    logoContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

function UpdateOptionalPopup(props: { onPostpone: () => void }) {
    return (
        <View style={popupStyles.container}>
            <View style={popupStyles.textContainer}>
                <Text size={18} weight="bold" style={popupStyles.text}>
                    {i18n.t("appUpdate.optional.title")}
                </Text>
                <Text style={popupStyles.text}>{i18n.t("appUpdate.optional.description")}</Text>
            </View>
            <View style={popupStyles.buttonContainer}>
                <UpdateButton />
                <Button variant="secondary-outlined" onPress={props.onPostpone} title={i18n.t("appUpdate.later")} />
            </View>
        </View>
    );
}

function UpdateMandatoryPopup() {
    return (
        <View style={popupStyles.container}>
            <View style={popupStyles.textContainer}>
                <Text size={18} weight="bold" style={popupStyles.text}>
                    {i18n.t("appUpdate.mandatory.title")}
                </Text>
                <Text style={popupStyles.text}>{i18n.t("appUpdate.mandatory.description")}</Text>
            </View>
            <UpdateButton />
        </View>
    );
}

function UpdateButton() {
    function onPress() {
        const url = Platform.select({
            ios: configuration.store.ios,
            android: configuration.store.android,
        });

        if (!url) {
            return;
        }

        Linking.canOpenURL(url).then((supported) => supported && Linking.openURL(url));
    }

    return <Button onPress={onPress} title={i18n.t("appUpdate.update")} />;
}

const popupStyles = StyleSheet.create({
    container: {
        paddingTop: 24,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: theme.color.white,
        borderRadius: 8,
        gap: 24,
    },
    textContainer: {
        gap: 16,
    },
    text: {
        textAlign: "center",
    },
    buttonContainer: {
        gap: 16,
    },
});
