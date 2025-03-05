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

type SpeciesFieldProps = {
    options: Option[];
    value: string;
    label: string;
    onChange: (value: string) => void;
};

export function SpeciesField({ label, options, value, onChange }: SpeciesFieldProps) {
    return (
        <View style={styles.container}>
            <FieldLabel style={styles.fieldLabel} label={label} />
            <ScrollView showsHorizontalScrollIndicator={false} horizontal contentContainerStyle={styles.scrollView}>
                {options.map((option, index) => {
                    const margin = index !== 0 && styles.marginLeft;
                    return (
                        <CardButton
                            key={option.value}
                            iconName={option.iconName}
                            label={option.label}
                            active={option.value === value}
                            onPress={() => onChange(option.value)}
                            style={[styles.cardButton, margin]}
                        />
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
