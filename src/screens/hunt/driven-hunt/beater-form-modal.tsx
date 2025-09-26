import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { Text } from "~/components/text";
import { Modal } from "./modal";

const MAX_LENGTH = 85;

type BeaterFormModalProps = {
    visible: boolean;
    onConfirm: (fullName: string) => void;
    onReject: () => void;
};

export function BeaterFormModal(props: BeaterFormModalProps) {
    const { t } = useTranslation();
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");

    function onSubmit() {
        props.onConfirm(firstName.trim() + " " + lastName.trim());
    }

    const isSubmitButtonEnabled = firstName.trim() && lastName.trim();

    return (
        <Modal visible={props.visible} onBackButtonPress={props.onReject}>
            <View>
                <Text style={styles.title} size={18} weight="bold">
                    {t("hunt.drivenHunt.beaterManagement.form.title")}
                </Text>
                <View style={styles.inputsContainer}>
                    <Input
                        label={t("hunt.drivenHunt.beaterManagement.form.firstName")}
                        value={firstName}
                        onChangeText={setFirstName}
                        maxLength={MAX_LENGTH}
                    />
                    <Input
                        label={t("hunt.drivenHunt.beaterManagement.form.lastName")}
                        value={lastName}
                        onChangeText={setLastName}
                        maxLength={MAX_LENGTH}
                    />
                </View>
                <View style={styles.buttonsContainer}>
                    <Button
                        title={t("hunt.drivenHunt.beaterManagement.form.confirm")}
                        onPress={onSubmit}
                        disabled={!isSubmitButtonEnabled}
                    />
                    <Button
                        variant="secondary-outlined"
                        title={t("hunt.drivenHunt.beaterManagement.form.reject")}
                        onPress={props.onReject}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    title: {
        marginTop: 8,
    },
    inputsContainer: {
        marginTop: 16,
        gap: 8,
    },
    buttonsContainer: {
        marginTop: 16,
        gap: 8,
    },
});
