import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { SmallIcon, SmallIconName } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { Color, theme } from "~/theme";

export type IndividualHuntCardStatus = "seen" | "declined" | "waiting-for-approval-or-deny" | "pause" | "active";

type IndividualHuntingCardProps = {
    date: string;
    hunterName: string;
    title: string;
    disabled?: boolean;
    onPress: () => void;
    description?: string;
    status?: IndividualHuntCardStatus;
};

export function IndividualHuntingCard(props: IndividualHuntingCardProps) {
    const [isPressed, setIsPressed] = React.useState(false);

    return (
        <Pressable
            onPress={props.onPress}
            disabled={props.disabled}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            style={[styles.cardContainer, isPressed ? styles.pressed : styles.shadow]}
        >
            <View style={styles.innerContainer}>
                <View style={styles.topContainer}>
                    <View style={styles.title}>
                        <Text>{props.title}</Text>
                    </View>
                    {props.status ? (
                        <View style={styles.status}>
                            <HuntingCardStatus status={props.status} />
                        </View>
                    ) : null}
                </View>
                <Spacer size={10} />
                <View style={styles.bottomContainer}>
                    <View style={styles.bottomTextInfoContainer}>
                        <Text numberOfLines={1} weight="bold">
                            {props.description}
                        </Text>
                        <Spacer size={7} />
                        <Text numberOfLines={1}>
                            {props.date}, {props.hunterName}
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

type HuntingCardStatusProps = {
    status: IndividualHuntCardStatus;
};

function HuntingCardStatus(props: HuntingCardStatusProps) {
    const { t } = useTranslation();

    const statusOptions = React.useMemo(() => {
        const statusOptions: {
            [key in IndividualHuntCardStatus]: {
                color: Color;
                text?: string;
                icon?: SmallIconName;
            };
        } = {
            "waiting-for-approval-or-deny": {
                text: t("hunt.individualHunt.status.new"),
                color: "teal",
                icon: "pending",
            },
            seen: {
                text: t("hunt.individualHunt.status.seen"),
                color: "success",
                icon: "valid",
            },
            declined: {
                text: t("hunt.individualHunt.status.declined"),
                color: "orange",
                icon: "denied",
            },
            pause: {
                color: "warning",
            },
            active: {
                color: "success",
            },
        };

        return statusOptions[props.status];
    }, [props.status, t]);

    const iconColor = theme.color[statusOptions.color];

    return (
        <View style={statusStyles.topRightContent}>
            {statusOptions.text ? (
                <Text color={statusOptions.color} size={12}>
                    {statusOptions.text}
                </Text>
            ) : (
                <>
                    <View
                        style={[
                            statusStyles.dot,
                            {
                                backgroundColor: iconColor,
                            },
                        ]}
                    ></View>
                </>
            )}

            <Spacer horizontal size={4} />
            {statusOptions.icon && <SmallIcon name={statusOptions.icon} color={statusOptions.color} />}
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        paddingLeft: 16,
        paddingBottom: 17,
        flexDirection: "row",
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
    },
    innerContainer: {
        flex: 1,
    },
    topContainer: {
        flexDirection: "row",
    },
    title: {
        flex: 1,
        paddingTop: 14,
        paddingRight: 16,
    },
    pressed: {
        backgroundColor: theme.color.gray2,
    },
    shadow: {
        shadowColor: theme.color.gray8,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                shadowOpacity: 0.08,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    bottomContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 16,
    },
    bottomTextInfoContainer: {
        flex: 1,
    },
    status: {
        top: 5,
        right: 5,
    },
});

const statusStyles = StyleSheet.create({
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    topRightContent: {
        flexDirection: "row",
        alignItems: "center",
    },
});
