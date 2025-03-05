import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { Text } from "~/components/text";
import { Modal } from "./modal";

type BeaterMenuModalProps = {
    visible: boolean;
    onListOpen: () => void;
    onScannerOpen: () => void;
    onFormOpen: () => void;
    onCancel: () => void;
    children?: React.ReactNode;
};

export function BeaterMenuModal(props: BeaterMenuModalProps) {
    const { t } = useTranslation();
    return (
        <Modal
            visible={props.visible}
            onBackButtonPress={props.onCancel}
            children={
                <View>
                    <Text style={styles.title} size={18} weight="bold">
                        {t("hunt.drivenHunt.beaterManagement.menu.title")}
                    </Text>
                    <View style={styles.buttonsContainer}>
                        <Button
                            icon="register"
                            title={t("hunt.drivenHunt.beaterManagement.menu.list")}
                            onPress={props.onListOpen}
                        />
                        <Button
                            icon="scan"
                            title={t("hunt.drivenHunt.beaterManagement.menu.scanner")}
                            onPress={props.onScannerOpen}
                        />
                        <Button
                            icon="edit"
                            title={t("hunt.drivenHunt.beaterManagement.menu.form")}
                            onPress={props.onFormOpen}
                        />
                        <Button
                            icon="cross"
                            variant="secondary-outlined"
                            title={t("hunt.drivenHunt.beaterManagement.menu.cancel")}
                            onPress={props.onCancel}
                        />
                    </View>
                    {props.children}
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    title: {
        marginTop: 8,
        marginBottom: 16,
    },
    buttonsContainer: {
        gap: 8,
    },
});
