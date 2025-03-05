import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { Text } from "~/components/text";
import { GuestHunter } from "~/types/hunts";
import { MessageModal } from "./message-modal";
import { Modal } from "./modal";

const MAX_LENGTH = 85;

type HunterFormModalProps = {
    visible: boolean;
    onConfirm: (fullName: string, cardNumber: string) => void;
    onReject: () => void;
    guestHunters: GuestHunter[];
};

export function HunterFormModal(props: HunterFormModalProps) {
    const { t } = useTranslation();
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [cardNumber, setCardNumber] = React.useState("");
    const [duplicateFailure, setDuplicateFailure] = React.useState(false);

    function onSubmit() {
        const guestHunter = props.guestHunters.find(
            (guestHunter) => guestHunter.guestHuntersCardNumber === cardNumber.trim()
        );
        if (guestHunter) {
            setDuplicateFailure(true);
            return;
        }
        props.onConfirm(firstName.trim() + " " + lastName.trim(), cardNumber.trim());
    }

    const isSubmitButtonEnabled = firstName.trim() && lastName.trim() && cardNumber.trim();

    return (
        <Modal
            visible={props.visible}
            onBackButtonPress={props.onReject}
            children={
                <View>
                    <Text style={styles.title} size={18} weight="bold">
                        {t("hunt.drivenHunt.hunterManagement.form.title")}
                    </Text>
                    <View style={styles.inputsContainer}>
                        <Input
                            label={t("hunt.drivenHunt.hunterManagement.form.firstName")}
                            value={firstName}
                            onChangeText={setFirstName}
                            maxLength={MAX_LENGTH}
                        />
                        <Input
                            label={t("hunt.drivenHunt.hunterManagement.form.lastName")}
                            value={lastName}
                            onChangeText={setLastName}
                            maxLength={MAX_LENGTH}
                        />
                        <Input
                            label={t("hunt.drivenHunt.hunterManagement.form.cardNumber")}
                            value={cardNumber}
                            onChangeText={setCardNumber}
                            maxLength={MAX_LENGTH}
                        />
                    </View>
                    <View style={styles.buttonsContainer}>
                        <Button
                            title={t("hunt.drivenHunt.hunterManagement.form.submit")}
                            onPress={onSubmit}
                            disabled={!isSubmitButtonEnabled}
                        />
                        <Button
                            variant="secondary-outlined"
                            title={t("hunt.drivenHunt.hunterManagement.form.reject")}
                            onPress={props.onReject}
                        />
                    </View>
                    <MessageModal
                        visible={duplicateFailure}
                        icon="failure"
                        title={t("hunt.drivenHunt.hunterManagement.scanner.duplicateFailure.title")}
                        description={t("hunt.drivenHunt.hunterManagement.scanner.duplicateFailure.description", {
                            hunter: [firstName, lastName, cardNumber].join(" "),
                        })}
                        buttons={
                            <Button
                                title={t("hunt.drivenHunt.hunterManagement.scanner.duplicateFailure.button")}
                                onPress={() => {
                                    setDuplicateFailure(false);
                                }}
                            />
                        }
                    />
                </View>
            }
        />
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
