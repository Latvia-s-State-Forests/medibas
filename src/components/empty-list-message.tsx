import { StyleSheet, View } from "react-native";
import { MediumIcon, MediumIconName } from "./icon";
import { Spacer } from "./spacer";
import { Text } from "./text";

type EmptyListMessageProps = {
    icon: MediumIconName;
    label: string;
};

export function EmptyListMessage(props: EmptyListMessageProps) {
    return (
        <View style={styles.container}>
            <MediumIcon name={props.icon} width={48} height={48} color="gray4" />
            <Spacer size={10} />
            <Text style={styles.text}>{props.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        textAlign: "center",
    },
});
