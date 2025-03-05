import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet } from "react-native";
import { FieldLabel } from "~/components/field-label";
import { SmallIcon } from "~/components/icon";
import { ReadOnlyField } from "~/components/read-only-field";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";

type FullNameFieldProps = {
    firstName?: string;
    lastName?: string;
    hasVMD?: boolean;
    onAddMorePress: () => void;
    rightPadding?: number;
};

export function FullNameField(props: FullNameFieldProps) {
    const hasName = props.firstName && props.lastName && props.firstName !== undefined && props.lastName !== undefined;
    const { t } = useTranslation();
    const rightPaddingStyle = { paddingRight: props.rightPadding };

    return (
        <>
            {props.hasVMD || hasName ? (
                <ReadOnlyField
                    style={rightPaddingStyle}
                    label={t("profile.firstName") + ", " + t("profile.lastName").toLowerCase()}
                    value={props.firstName + " " + props.lastName}
                />
            ) : (
                <>
                    <FieldLabel label={t("profile.firstName") + ", " + t("profile.lastName").toLowerCase()} />

                    <Pressable style={styles.addMoreButton} onPress={props.onAddMorePress}>
                        <Text style={styles.text} weight="bold">
                            {t("profile.addMemberName")}
                        </Text>
                        <Spacer horizontal size={4} />
                        <SmallIcon name="plus" color="teal" />
                    </Pressable>
                </>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    addMoreButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    text: {
        lineHeight: 24,
    },
});
