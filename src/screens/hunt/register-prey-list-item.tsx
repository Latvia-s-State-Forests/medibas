import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { BorderlessBadge } from "~/components/borderless-badge";
import { LargeIcon, LargeIconName, SmallIcon } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type RegisterPreyListItemProps = {
    iconName: LargeIconName;
    type: string;
    term: string | undefined;
    onPress: () => void;
    permitCount?: number;
};

export function RegisterPreyListItem({ iconName, type, term, onPress, permitCount }: RegisterPreyListItemProps) {
    const isDisabled = permitCount === 0 || permitCount === -1;
    const { t } = useTranslation();
    const [isPressed, setIsPressed] = React.useState(false);

    return (
        <>
            <Pressable
                onPress={onPress}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                style={[
                    styles.cardContainer,
                    !term ? styles.typeContainer : null,
                    isDisabled || isPressed ? null : styles.shadow,
                    isPressed ? styles.pressed : null,
                    isDisabled ? styles.disabled : null,
                ]}
                disabled={isDisabled}
            >
                <View style={styles.icon}>
                    <LargeIcon name={iconName} />
                </View>
                <View style={styles.innerContainer}>
                    <Text style={styles.typeText} weight="bold">
                        {type}
                    </Text>
                    <View style={styles.infoContainer}>
                        {term ? (
                            <Text style={styles.termText} size={14}>
                                {term}
                            </Text>
                        ) : null}

                        {permitCount !== undefined ? (
                            <View style={styles.preyPermitsContainer}>
                                {permitCount > 0 ? (
                                    <>
                                        <BorderlessBadge variant="available" count={permitCount} />
                                        <Spacer horizontal size={6} />

                                        <Text style={styles.permitText} size={14}>
                                            {t("hunt.permits")}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <SmallIcon name="notValid" color="error" />
                                        <Spacer horizontal size={6} />

                                        <Text style={styles.permitText} size={14}>
                                            {permitCount === -1 ? t("hunt.unavailable") : t("hunt.noPermits")}
                                        </Text>
                                    </>
                                )}
                            </View>
                        ) : null}
                    </View>
                </View>
            </Pressable>
            <Spacer size={8} />
        </>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        padding: 16,
        flexDirection: "row",
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
    },
    typeContainer: {
        paddingVertical: 22,
    },
    shadow: {
        shadowColor: theme.color.gray8,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowColor: theme.color.gray8,
                shadowRadius: 8,
                shadowOpacity: 0.08,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    pressed: {
        backgroundColor: theme.color.gray2,
    },
    icon: {
        justifyContent: "center",
    },
    innerContainer: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "center",
    },
    typeText: {
        lineHeight: 20,
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    termText: {
        marginTop: 6,
    },
    preyPermitsContainer: {
        alignSelf: "flex-end",
        flexDirection: "row",
        alignItems: "center",
    },
    permitText: {
        lineHeight: 18,
    },
    disabled: {
        borderColor: `${theme.color.gray2}7F`,
        backgroundColor: `${theme.color.white}7F`,
    },
});
