import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { SmallIcon } from "~/components/icon";
import { Modal } from "~/components/modal/modal";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type DateInputProps = {
    label: string;
    minimumDate?: Date;
    maximumDate?: Date;
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    disabled?: boolean;
};
export function DateInput({ label, value, minimumDate, maximumDate, onChange, disabled }: DateInputProps) {
    const { t } = useTranslation();
    const [isPickerVisible, setIsPickerVisible] = React.useState(false);
    const [pickerValue, setPickerValue] = React.useState<Date | undefined>();

    function onShowPickerPress() {
        if (Platform.OS === "ios") {
            setIsPickerVisible(true);
            setPickerValue(value ?? minimumDate);
        } else {
            DateTimePickerAndroid.open({
                minimumDate,
                maximumDate,
                value: value ?? new Date(),
                onChange: (event, date) => {
                    if (event.type !== "dismissed") {
                        onChange(date);
                    }
                },
                mode: "date",
            });
        }
    }

    function onPickerValueChange(event: DateTimePickerEvent, date?: Date) {
        if (Platform.OS === "android" && event.type === "dismissed") {
            return;
        }
        setPickerValue(date);
    }

    function onClosePickerPress() {
        setIsPickerVisible(false);
        setPickerValue(undefined);
    }

    function onConfirmPickerPress() {
        setIsPickerVisible(false);
        setPickerValue(undefined);
        onChange(pickerValue);
    }

    return (
        <>
            <Pressable
                disabled={disabled}
                style={[
                    styles.container,
                    value ? styles.containerWithValue : styles.containerWithoutValue,
                    disabled && styles.disabled,
                ]}
                onPress={onShowPickerPress}
            >
                <View style={styles.containerContent}>
                    {value ? (
                        <View>
                            <Text color="gray7" weight="bold" style={styles.smallText} size={12}>
                                {label}
                            </Text>
                            <Text numberOfLines={1} style={styles.bigText} color="gray7">
                                {format(value, "dd.MM.yyyy")}
                            </Text>
                        </View>
                    ) : (
                        <Text numberOfLines={1} style={styles.bigText} color="gray5" size={18}>
                            {label}
                        </Text>
                    )}
                    <Spacer horizontal size={6} />
                    <SmallIcon name="calendar" />
                </View>
            </Pressable>
            {Platform.OS === "ios" ? (
                <Modal visible={isPickerVisible} onClose={onClosePickerPress}>
                    <DateTimePicker
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        value={pickerValue ?? new Date()}
                        onChange={onPickerValueChange}
                        accentColor={theme.color.teal}
                        mode="date"
                        display="inline"
                    />
                    <Button title={t("modal.accept")} onPress={onConfirmPickerPress} />
                    <Spacer size={32} />
                </Modal>
            ) : null}
        </>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.white,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        borderRadius: 8,
    },
    containerContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    containerWithValue: {
        paddingVertical: 7,
    },
    containerWithoutValue: {
        paddingTop: 15,
        paddingBottom: 16,
    },
    smallText: {
        lineHeight: 16,
    },
    bigText: {
        flex: 1,
        lineHeight: 24,
    },
    disabled: {
        opacity: 0.5,
    },
});
