import { useSelector } from "@xstate/react";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { CheckboxButton } from "~/components/checkbox-button";
import { ScreenBackgroundLayout } from "~/components/screen-background-layout";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { authenticationActor } from "~/machines/authentication-machine";
import { theme } from "~/theme";
import { LoadingScreen } from "./loading-screen";

export function LoginScreen() {
    const { t } = useTranslation();
    const [checked, setChecked] = React.useState(false);
    const [isTermsAndConditionsPressed, setIsTermsAndConditionsPressed] = React.useState(false);
    const [isPrivacyPolicyPressed, setIsPrivacyPolicyPressed] = React.useState(false);

    function toggle() {
        setChecked((checked) => !checked);
    }

    function onTermsAndConditionsOpen() {
        WebBrowser.openBrowserAsync("https://mezaipasnieki.lv/lv/lietotnes-mednis-visparigie-lietosanas-noteikumi", {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
            createTask: false,
        });
    }

    function onPrivacyPolicyOpen() {
        WebBrowser.openBrowserAsync("https://mezaipasnieki.lv/lv/lietotnes-mednis-privatuma-politika", {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
            createTask: false,
        });
    }

    function onLoginButtonPress() {
        authenticationActor.send({ type: "LOGIN" });
    }

    function onRegisterButtonPress() {
        authenticationActor.send({ type: "REGISTER" });
    }

    const isLoggedOutIdle = useSelector(authenticationActor, (state) => state.matches({ loggedOut: "idle" }));

    if (!isLoggedOutIdle) {
        return <LoadingScreen />;
    }

    return (
        <ScreenBackgroundLayout>
            <View style={styles.container}>
                <Button onPress={onLoginButtonPress} title={t("login.login")} icon="key" />
                <Spacer size={16} />
                <Button
                    variant="secondary-outlined"
                    disabled={!checked}
                    icon="userNew"
                    onPress={onRegisterButtonPress}
                    title={t("login.register")}
                />
                <Spacer size={16} />
                <CheckboxButton
                    variant="teal"
                    state={checked ? "checked" : "unchecked"}
                    onPress={toggle}
                    label={
                        <Trans
                            i18nKey="login.agreements"
                            components={{
                                1: (
                                    <Text
                                        onPressIn={() => setIsTermsAndConditionsPressed(true)}
                                        onPressOut={() => setIsTermsAndConditionsPressed(false)}
                                        onPress={onTermsAndConditionsOpen}
                                        style={!isTermsAndConditionsPressed ? styles.teal : styles.tealPressed}
                                        color="teal"
                                    />
                                ),
                                2: (
                                    <Text
                                        onPressIn={() => setIsPrivacyPolicyPressed(true)}
                                        onPressOut={() => setIsPrivacyPolicyPressed(false)}
                                        onPress={onPrivacyPolicyOpen}
                                        style={!isPrivacyPolicyPressed ? styles.teal : styles.tealPressed}
                                        color="teal"
                                    />
                                ),
                            }}
                        />
                    }
                />
            </View>
        </ScreenBackgroundLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: theme.color.white,
        borderRadius: 8,
    },
    teal: {
        color: theme.color.teal,
    },
    tealPressed: {
        color: theme.color.tealPressed,
    },
});
