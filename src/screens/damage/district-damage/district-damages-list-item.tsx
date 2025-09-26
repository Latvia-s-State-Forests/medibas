import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { LargeIcon, LargeIconName } from "~/components/icon";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import { formatDateTime } from "~/utils/format-date-time";

type DistrictDamageListItemProps = {
    iconName: LargeIconName;
    type: string;
    time: string;
    position: string;
    onPress: () => void;
};

export function DistrictDamageListItem(props: DistrictDamageListItemProps) {
    const { t } = useTranslation();
    const [isPressed, setPressed] = React.useState(false);
    const formattedDateTime = formatDateTime(props.time);

    return (
        <Pressable
            onPress={props.onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={[styles.cardContainer, isPressed ? styles.pressed : styles.shadow]}
        >
            <View style={styles.icon}>
                <LargeIcon name={props.iconName} />
            </View>
            <View style={styles.innerContainer}>
                <Text weight="bold">{props.type}</Text>
                <Text style={styles.text} size={12}>
                    {formattedDateTime}
                </Text>
                <Text size={12}>
                    {t("reports.coordinates")} {props.position}
                </Text>
            </View>
        </Pressable>
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
    icon: {
        justifyContent: "center",
    },
    innerContainer: {
        flex: 1,
        marginLeft: 16,
    },
    text: {
        marginVertical: 6,
    },
    pressed: {
        backgroundColor: theme.color.gray2,
    },
});
