import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { LargestIcon } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";

type Props = {
    onContinue: () => void;
};

export function SuccessMessage({ onContinue }: Props) {
    const { t } = useTranslation();
    return (
        <View>
            <Spacer size={18} />
            <View style={styles.iconContainer}>
                <LargestIcon name="success" />
            </View>
            <Spacer size={24} />
            <Text size={22} weight="bold" style={styles.title}>
                {t("hunt.drivenHunt.join.success.title")}
            </Text>
            <Spacer size={34} />
            <Button title={t("hunt.drivenHunt.join.success.continue")} onPress={onContinue} />
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
