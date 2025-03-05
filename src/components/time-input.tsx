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

type TimeInputProps = {
    label: string;
    value: Date | undefined;
    onChange: (time: Date | undefined) => void;
    minimumTime?: Date;
};

export function TimeInput({ label, value, onChange, minimumTime }: TimeInputProps) {
    const { t } = useTranslation();
    const [isPickerVisible, setIsPickerVisible] = React.useState(false);
    const [pickerValue, setPickerValue] = React.useState<Date | undefined>();

    function onShowPickerPress() {
        if (Platform.OS === "ios") {
            setIsPickerVisible(true);
            setPickerValue(value ?? new Date());
        } else {
            DateTimePickerAndroid.open({
                minimumDate: minimumTime,
                value: value ?? new Date(),
                onChange: (event, time) => {
                    if (event.type !== "dismissed") {
                        // If the selected time is smaller than the minimumTime, set to minimumTime
                        if (time && minimumTime && time < minimumTime) {
                            onChange(minimumTime);
                        } else {
                            onChange(time);
                        }
                    }
                },
                mode: "time",
            });
        }
    }

    function onPickerValueChange(event: DateTimePickerEvent, time?: Date) {
        setPickerValue(time);
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
                style={[styles.container, value ? styles.containerWithValue : styles.containerWithoutValue]}
                onPress={onShowPickerPress}
            >
                <View style={styles.containerContent}>
                    {value ? (
                        <View>
                            <Text color="gray7" weight="bold" style={styles.smallText} size={12}>
                                {label}
                            </Text>
                            <Text numberOfLines={1} style={styles.bigText} color="gray7">
                                {format(value, "HH:mm")}
                            </Text>
                        </View>
                    ) : (
                        <Text numberOfLines={1} style={styles.bigText} color="gray5" size={18}>
                            {label}
                        </Text>
                    )}
                    <SmallIcon name="time" />
                </View>
            </Pressable>
            {Platform.OS === "ios" ? (
                <Modal visible={isPickerVisible} onClose={onClosePickerPress}>
                    <DateTimePicker
                        value={pickerValue ?? new Date()}
                        onChange={onPickerValueChange}
                        textColor={theme.color.gray8}
                        mode="time"
                        display="spinner"
                        minimumDate={minimumTime}
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
});
