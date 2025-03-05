import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { CurrentPosition, CurrentPositionHandle } from "~/components/current-position/current-position";
import { CurrentPositionError } from "~/components/current-position/current-position-error";
import { CurrentPositionIdle } from "~/components/current-position/current-position-idle";
import { CurrentPositionLoading } from "~/components/current-position/current-position-loading";
import { CurrentPositionPermissionsError } from "~/components/current-position/current-position-permissions-error";
import { Header } from "~/components/header";
import { RadioButtonList } from "~/components/radio-button-list";
import { ReadOnlyField } from "~/components/read-only-field";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import { PositionResult } from "~/types/position-result";
import { formatPosition } from "~/utils/format-position";

export function CurrentPositionExampleScreen() {
    const insets = useSafeAreaInsets();
    const [state, setState] = React.useState("loading");
    const [position, setPosition] = React.useState<PositionResult | undefined>();
    const currentPositionRef = React.useRef<CurrentPositionHandle>(null);

    function ignore() {
        // ignore
    }

    return (
        <View style={styles.container}>
            <Header title="Current Position" />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <Text weight="bold">Individual states</Text>
                <Spacer size={16} />
                {state === "loading" && <CurrentPositionLoading />}
                {state === "permissionError" && (
                    <CurrentPositionPermissionsError onOpenSettings={ignore} onRetry={ignore} />
                )}
                {state === "serviceError" && <CurrentPositionError type="other" onRetry={ignore} />}
                {state === "accuracyError" && <CurrentPositionError type="accuracy" onRetry={ignore} />}
                {state === "idle" && (
                    <CurrentPositionIdle
                        position={{ latitude: 56.91867, longitude: 24.09172, accuracy: 10 }}
                        onRetry={ignore}
                    />
                )}
                <Spacer size={24} />
                <RadioButtonList
                    label="Current position state"
                    onChange={setState}
                    value={state}
                    options={[
                        { label: "Loading", value: "loading" },
                        { label: "Permission error", value: "permissionError" },
                        { label: "Service error", value: "serviceError" },
                        { label: "Accuracy error", value: "accuracyError" },
                        { label: "Idle", value: "idle" },
                    ]}
                />
                <Spacer size={24} />
                <Text weight="bold">End result</Text>
                <Spacer size={16} />
                <CurrentPosition ref={currentPositionRef} onChange={setPosition} />
                <Spacer size={24} />
                <ReadOnlyField label="Location coordinates" value={position ? formatPosition(position) : " "} />
                <Spacer size={24} />
                <Button title="Reset position" onPress={() => currentPositionRef.current?.reset()} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        paddingTop: 24,
    },
});
