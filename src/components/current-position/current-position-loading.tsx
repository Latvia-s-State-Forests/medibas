import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Spacer } from "~/components/spacer";
import { Spinner } from "~/components/spinner";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function CurrentPositionLoading() {
    const { t } = useTranslation();

    return (
        <View style={style.container}>
            <Spinner />
            <Spacer size={24} />
            <Text size={16} weight="bold">
                {t("currentPosition.loading")}
            </Text>
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        minHeight: 200,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingVertical: 28,
        backgroundColor: theme.color.gray1,
    },
});
