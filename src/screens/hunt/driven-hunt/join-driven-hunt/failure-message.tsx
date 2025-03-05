import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { LargestIcon } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";

type Props = {
    title: string;
    description?: string;
    onClose: () => void;
};

export function FailureMessage({ title, description, onClose }: Props) {
    const { t } = useTranslation();

    return (
        <View>
            <Spacer size={18} />
            <View style={styles.iconContainer}>
                <LargestIcon name="failure" />
            </View>
            <Spacer size={24} />
            <Text size={22} weight="bold" style={styles.title}>
                {title}
            </Text>
            {description ? (
                <>
                    <Spacer size={12} />
                    <Text style={styles.description}>{description}</Text>
                </>
            ) : null}
            <Spacer size={34} />
            <Button title={t("hunt.drivenHunt.join.failureCommon.close")} onPress={onClose} />
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
    description: {
        textAlign: "center",
    },
});
