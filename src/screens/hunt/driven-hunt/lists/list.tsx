import { StyleSheet, View } from "react-native";
import { BorderlessBadge } from "~/components/borderless-badge";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type ListProps = {
    title: string;
    items: string[];
};

export function List(props: ListProps) {
    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Text size={12} color="gray7" weight="bold" style={styles.title}>
                    {props.title}
                </Text>
                <BorderlessBadge count={props.items.length} variant="default" />
            </View>
            <View style={styles.list}>
                {props.items.map((item, index) => {
                    return (
                        <View key={item + index} style={styles.listItem}>
                            <Text>{index + 1}.</Text>
                            <Text style={styles.label}>{item}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleRow: {
        flexDirection: "row",
        gap: 10,
        paddingRight: 20,
        paddingVertical: 10,
    },
    title: {
        flex: 1,
    },
    list: {
        borderTopWidth: 1,
        borderTopColor: theme.color.gray2,
    },
    listItem: {
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 4,
        borderBottomColor: theme.color.gray2,
        borderBottomWidth: 1,
        paddingRight: 4,
    },
    label: {
        flex: 1,
    },
});
