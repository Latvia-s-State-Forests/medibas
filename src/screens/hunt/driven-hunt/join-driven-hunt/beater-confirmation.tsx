import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { LargestIcon } from "~/components/icon";
import { Input } from "~/components/input";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { useProfile } from "~/hooks/use-profile";
import { useUserStorage } from "~/machines/authentication-machine";

type Props = {
    huntTitle: string;
    onConfirm: (fullName: string) => void;
    onReject: () => void;
};

export function BeaterConfirmation({ huntTitle, onConfirm, onReject }: Props) {
    const { t } = useTranslation();
    const profile = useProfile();
    const userStorage = useUserStorage();

    const profileName = React.useMemo(() => {
        return userStorage.getProfileName();
    }, [userStorage]);

    const [firstName, setFirstName] = React.useState(profile.firstName ?? profileName?.firstName ?? "");
    const [lastName, setLastName] = React.useState(profile.lastName ?? profileName?.lastName ?? "");

    return (
        <View>
            <Spacer size={18} />
            <View style={styles.iconContainer}>
                <LargestIcon name="hunt" />
            </View>
            <Spacer size={24} />
            <Text size={22} weight="bold" style={styles.title}>
                {t("hunt.drivenHunt.join.beaterConfirmation.title", { huntTitle })}
            </Text>
            <Spacer size={34} />
            <Input
                label={t("hunt.drivenHunt.join.beaterConfirmation.firstName")}
                value={firstName}
                onChangeText={setFirstName}
            />
            <Spacer size={16} />
            <Input
                label={t("hunt.drivenHunt.join.beaterConfirmation.lastName")}
                value={lastName}
                onChangeText={setLastName}
            />
            <Spacer size={16} />
            <Button
                title={t("hunt.drivenHunt.join.beaterConfirmation.confirm")}
                onPress={() => {
                    onConfirm([firstName.trim(), lastName.trim()].join(" "));
                }}
                disabled={!firstName.trim() || !lastName.trim()}
            />
            <Spacer size={8} />
            <Button
                title={t("hunt.drivenHunt.join.beaterConfirmation.reject")}
                variant="secondary-outlined"
                onPress={onReject}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: "center",
    },
    title: {
        textAlign: "center",
    },
});
