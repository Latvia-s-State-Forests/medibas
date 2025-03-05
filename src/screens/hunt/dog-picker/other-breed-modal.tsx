import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { Stepper } from "~/components/stepper";
import { Text } from "~/components/text";
import { Modal } from "../driven-hunt/modal";

type OtherBreedModalProps = {
    visible: boolean;
    onConfirm: (otherBreed: string, count: number) => void;
    onReject: () => void;
};

export function OtherBreedModal(props: OtherBreedModalProps) {
    const { t } = useTranslation();
    const [otherBreed, setOtherBreed] = React.useState("");
    const [count, setCount] = React.useState(1);

    React.useEffect(() => {
        if (props.visible) {
            setOtherBreed("");
            setCount(1);
        }
    }, [props.visible]);

    function onConfirm() {
        props.onConfirm(otherBreed.trim(), count);
    }

    function onReject() {
        props.onReject();
    }

    return (
        <Modal visible={props.visible} onBackButtonPress={onReject}>
            <View style={styles.container}>
                <Text size={18} weight="bold">
                    {t("hunt.otherBreedModal.title")}
                </Text>
                <Input label={t("hunt.otherBreedModal.breed")} value={otherBreed} onChangeText={setOtherBreed} />
                <Stepper label={t("hunt.otherBreedModal.count")} value={count} onChange={setCount} minValue={1} />
                <View style={styles.buttons}>
                    <Button title={t("hunt.otherBreedModal.confirm")} onPress={onConfirm} disabled={!otherBreed} />
                    <Button variant="secondary-outlined" title={t("hunt.otherBreedModal.reject")} onPress={onReject} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        marginTop: 8,
    },
    buttons: {
        gap: 8,
    },
});
