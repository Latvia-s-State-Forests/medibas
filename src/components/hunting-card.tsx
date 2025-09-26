import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { QRContainer } from "~/components/qr-code/qr-container";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type HuntingCardStatus = "active" | "pause";

type HuntingCardProps = {
    name?: string;
    title: string;
    date: string;
    QRCodeValue?: string;
    hasQRCode?: boolean;
    onPress: () => void;
    permitCount?: number;
    status?: HuntingCardStatus;
    disabled?: boolean;
    qrDescription?: string;
};

export function HuntingCard({
    name,
    date,
    onPress,
    status,
    title,
    hasQRCode = false,
    QRCodeValue,
    disabled = false,
    qrDescription,
}: HuntingCardProps) {
    const { t } = useTranslation();
    const [isPressed, setIsPressed] = React.useState(false);

    return (
        <Pressable
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onPress={onPress}
            style={[styles.cardContainer, isPressed ? styles.pressed : styles.shadow]}
            disabled={disabled}
        >
            <View style={styles.innerContainer}>
                <View style={styles.topContainer}>
                    <View style={styles.title}>
                        <Text>{title}</Text>
                    </View>
                    {status ? (
                        <View style={styles.status}>
                            <HuntingCardStatusIndicator status={status} />
                        </View>
                    ) : null}
                </View>
                <Spacer size={10} />
                <View style={styles.bottomContainer}>
                    <View style={styles.bottomTextInfoContainer}>
                        {name && (
                            <>
                                <Text numberOfLines={1} weight="bold">
                                    {name}
                                </Text>
                                <Spacer size={7} />
                            </>
                        )}
                        <Text numberOfLines={1} size={12}>
                            {date}
                        </Text>
                    </View>
                    {hasQRCode ? (
                        <QRContainer
                            title={t("qrcode.title.hunt")}
                            description={qrDescription}
                            background={false}
                            value={QRCodeValue || ""}
                        />
                    ) : null}
                </View>
            </View>
        </Pressable>
    );
}

type HuntingCardStatusIndicatorProps = {
    status: HuntingCardStatus;
};

function HuntingCardStatusIndicator({ status }: HuntingCardStatusIndicatorProps) {
    const { t } = useTranslation();
    const dotColor =
        status === "active" ? { backgroundColor: theme.color.success } : { backgroundColor: theme.color.warning };

    return (
        <View style={statusStyles.container}>
            {status === "pause" ? (
                <Text color="gray6" size={12} style={statusStyles.text}>
                    {t("hunt.status.paused").toUpperCase()}
                </Text>
            ) : null}
            <Spacer horizontal size={4} />
            <View style={statusStyles.dotWrapper}>
                <View style={[statusStyles.dot, dotColor]}></View>
            </View>
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
    container: {
        flexDirection: "row",
    },
    text: {
        lineHeight: 15.6,
    },
    dotWrapper: {
        padding: 3,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
