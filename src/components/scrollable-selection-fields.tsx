import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { CardButton } from "~/components/card-button";
import { FieldLabel } from "~/components/field-label";
import { LargeIconName } from "~/components/icon";

type Option = {
    iconName: LargeIconName;
    label: string;
    value: string;
};

type ScrollableSelectionFieldsProps = {
    options: Option[];
    value: string;
    label: string;
    onChange: (value: string) => void;
};

export function ScrollableSelectionFields({ label, options, value, onChange }: ScrollableSelectionFieldsProps) {
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [itemLayouts, setItemLayouts] = React.useState<{ [key: string]: number }>({});
    const hasScrolledRef = React.useRef(false);
    const initialValueRef = React.useRef(value);

    // Scroll to selected item only if there was an initial value
    React.useEffect(() => {
        // Get the initial value from ref (not the current value which might have changed)
        const initialValue = initialValueRef.current;

        const hadInitialSelection = initialValue !== "";

        if (
            scrollViewRef.current &&
            hadInitialSelection &&
            itemLayouts[initialValue] !== undefined &&
            !hasScrolledRef.current
        ) {
            scrollViewRef.current?.scrollTo({
                x: Math.max(0, itemLayouts[initialValue] - 50),
                animated: false,
            });
            hasScrolledRef.current = true;
        }
    }, [itemLayouts]);

    return (
        <View style={styles.container}>
            <FieldLabel style={styles.fieldLabel} label={label} />
            <ScrollView
                ref={scrollViewRef}
                showsHorizontalScrollIndicator={false}
                horizontal
                contentContainerStyle={styles.scrollView}
            >
                {options.map((option, index) => {
                    const margin = index !== 0 && styles.marginLeft;
                    return (
                        <View
                            key={option.value}
                            onLayout={(event) => {
                                const { x } = event.nativeEvent.layout;
                                setItemLayouts((prevLayouts) => ({
                                    ...prevLayouts,
                                    [option.value]: x,
                                }));
                            }}
                        >
                            <CardButton
                                iconName={option.iconName}
                                label={option.label}
                                active={option.value === value}
                                onPress={() => onChange(option.value)}
                                style={[styles.cardButton, margin]}
                            />
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: -16,
    },
    scrollView: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    marginLeft: {
        marginLeft: 8,
    },
    fieldLabel: {
        marginBottom: 16,
        marginHorizontal: 16,
    },
    cardButton: {
        flex: 1,
        width: 100,
    },
});
