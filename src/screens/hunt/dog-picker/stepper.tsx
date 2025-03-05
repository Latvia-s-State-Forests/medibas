import { StyleSheet, View } from "react-native";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import { StepperButton } from "./stepper-button";

type StepperProps = {
    count: number;
    onIncrement: () => void;
    onDecrement: () => void;
    minCount?: number;
    maxCount?: number;
};

export function Stepper(props: StepperProps) {
    const minCount = props.minCount ?? 0;
    const maxCount = props.maxCount ?? 100;
    return (
        <View style={styles.container}>
            <Text weight="bold" size={18} color={props.count === 0 ? "gray5" : undefined}>
                {props.count}
            </Text>
            <View style={styles.buttons}>
                <StepperButton icon="minus" onPress={props.onDecrement} disabled={props.count <= minCount} />
                <View style={styles.separator} />
                <StepperButton icon="plus" onPress={props.onIncrement} disabled={props.count >= maxCount} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    buttons: {
        flexDirection: "row",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        overflow: "hidden",
    },
    separator: {
        width: 1,
        backgroundColor: theme.color.gray2,
    },
});
