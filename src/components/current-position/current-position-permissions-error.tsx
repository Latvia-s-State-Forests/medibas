import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type CurrentPositionPermissionsErrorProps = {
    onOpenSettings: () => void;
    onRetry: () => void;
};

export function CurrentPositionPermissionsError({ onOpenSettings, onRetry }: CurrentPositionPermissionsErrorProps) {
    const { t } = useTranslation();
    return (
        <View style={style.container}>
            <Text size={16} weight="bold" style={style.title}>
                {t("currentPosition.failure.title")}
            </Text>
            <Text size={16} style={style.description}>
                {t("currentPosition.failure.message.permissionDenied")}
            </Text>
            <Button
                onPress={onOpenSettings}
                variant="secondary-dark"
                title={t("currentPosition.failure.openSettings")}
                icon="settings"
            />
            <Button
                onPress={onRetry}
                variant="secondary-dark"
                title={t("currentPosition.failure.retry")}
                icon="marker"
            />
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        minHeight: 200,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingBottom: 18,
        paddingTop: 36,
        backgroundColor: theme.color.gray1,
    },
    title: {
        textAlign: "center",
        marginBottom: 14,
    },
    description: {
        textAlign: "center",
        marginBottom: 8,
    },
});
