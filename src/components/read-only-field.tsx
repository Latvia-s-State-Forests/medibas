import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native";
import { FieldLabel } from "~/components/field-label";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type ReadOnlyFieldProps = {
    label: string;
    value: string;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

function TextWithLinks({ text, style }: { text: string; style: TextStyle }) {
    const urlRegex = /(https?:\/\/[^\s,]+)(?=[\s,]|$)/g;
    const parts = text.split(urlRegex);
    return (
        <Text selectable style={style}>
            {parts.map((part, i) =>
                urlRegex.test(part) ? (
                    <Text
                        key={i}
                        onPress={() => {
                            WebBrowser.openBrowserAsync(part);
                        }}
                        style={styles.link}
                    >
                        {part}
                    </Text>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                )
            )}
        </Text>
    );
}

export function ReadOnlyField({ style, value, label, icon }: ReadOnlyFieldProps) {
    return (
        <View style={style}>
            <FieldLabel label={label} />
            <View style={styles.row}>
                {icon ? <View style={styles.icon}>{icon}</View> : null}
                <TextWithLinks text={value} style={styles.input} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        color: theme.color.gray7,
    },
    link: {
        color: theme.color.information,
        textDecorationLine: "underline",
        textDecorationColor: theme.color.information,
    },
});
