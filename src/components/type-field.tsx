import * as React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Badge } from "~/components/badge";
import { CardButton } from "~/components/card-button";
import { FieldLabel } from "~/components/field-label";
import { LargeIconName } from "~/components/icon";

type Option<T> = {
    iconName: LargeIconName;
    label: string;
    value: T;
    badgeCount?: number;
};

type TypeFieldProps<T extends string | number> = {
    options: Array<Option<T>>;
    value: T;
    label: string;
    onChange: (value: T) => void;
    style?: StyleProp<ViewStyle>;
};

export function TypeField<T extends string | number>({ label, options, value, onChange, style }: TypeFieldProps<T>) {
    function renderChildren() {
        return options.map((option, index) => {
            const margin = index !== 0 && styles.marginLeft;
            return (
                <View key={option.value.toString()} style={[styles.optionContainer, margin]}>
                    <Option
                        badgeCount={option.badgeCount}
                        iconName={option.iconName}
                        label={option.label}
                        active={option.value === value}
                        onPress={() => onChange(option.value)}
                    />
                </View>
            );
        });
    }

    return (
        <View style={style}>
            <FieldLabel style={styles.fieldLabel} label={label} />
            <View style={styles.container}>{renderChildren()}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
    },
    optionContainer: {
        flex: 1,
    },
    marginLeft: {
        marginLeft: 8,
    },
    fieldLabel: {
        marginBottom: 16,
    },
});

type OptionProps = {
    label: string;
    onPress: () => void;
    iconName: LargeIconName;
    disabled?: boolean;
    badgeCount?: number;
    active: boolean;
};

function Option({ label, onPress, iconName, active, disabled, badgeCount }: OptionProps) {
    return (
        <View style={optionStyles.container}>
            <CardButton
                onPress={onPress}
                disabled={disabled}
                iconName={iconName}
                label={label}
                active={active}
                style={optionStyles.cardButton}
            />
            <View style={optionStyles.badge}>{active && badgeCount && <Badge count={badgeCount} />}</View>
        </View>
    );
}

const optionStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
    },
    cardButton: {
        flex: 1,
    },
    badge: {
        position: "absolute",
        top: -12,
    },
});
