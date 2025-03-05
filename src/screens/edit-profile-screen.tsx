import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { Header } from "~/components/header";
import { InputProfile } from "~/components/input-profile";
import { Spacer } from "~/components/spacer";
import { useUserStorage } from "~/machines/authentication-machine";
import { theme } from "~/theme";

export function EditProfileScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { t } = useTranslation();
    const lastNameInputRef = React.useRef<TextInput>(null);
    const userStorage = useUserStorage();
    const profileName = userStorage.getProfileName();
    const [firstName, setName] = React.useState(profileName?.firstName ?? "");
    const [lastName, setLastName] = React.useState(profileName?.lastName ?? "");

    function onSavePress() {
        userStorage.setProfileName({ firstName, lastName });
        navigation.navigate("ProfileScreen", { edited: true });
    }

    const isNameUnchanged = firstName === profileName?.firstName && lastName === profileName?.lastName;

    return (
        <View style={styles.container}>
            <Header title={t("profile.basicInfo")} />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingRight: insets.right + 16,
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <View>
                    <InputProfile
                        label={t("profile.firstName")}
                        value={firstName}
                        onChangeText={setName}
                        returnKeyType="next"
                        autoFocus={true}
                        onSubmitEditing={() => {
                            lastNameInputRef.current?.focus();
                        }}
                    />
                    <Spacer size={16} />
                    <InputProfile
                        label={t("profile.lastName")}
                        value={lastName}
                        onChangeText={setLastName}
                        ref={lastNameInputRef}
                        returnKeyType="done"
                        onSubmitEditing={() => {
                            if (firstName && lastName) {
                                onSavePress();
                            }
                        }}
                    />
                </View>
                <Spacer size={24} />
                <Button
                    disabled={!firstName || !lastName || isNameUnchanged}
                    title={t("general.save")}
                    onPress={onSavePress}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        paddingTop: 24,
        justifyContent: "space-between",
        flexGrow: 1,
    },
});
