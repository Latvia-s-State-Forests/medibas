import { addDays } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DateInput } from "~/components/date-input";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { TimeInput } from "~/components/time-input";
import { theme } from "~/theme";

export function DateTimeInputExampleScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [date, setDate] = React.useState<Date | undefined>();
    const [dateSecond, setDateSecond] = React.useState<Date | undefined>();
    const [fromDate, setFromDate] = React.useState<Date | undefined>();
    const [toDate, setToDate] = React.useState<Date | undefined>();
    const [time, setTime] = React.useState<Date | undefined>();
    const [timeSecond, setTimeSecond] = React.useState<Date | undefined>();
    const maximumAllowedDate = fromDate ? addDays(fromDate, 2) : undefined;

    return (
        <View style={styles.container}>
            <Header title="Date Time Input" />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                        paddingRight: insets.right + 16,
                    },
                ]}
            >
                <Text>Input with calendar</Text>
                <Spacer size={16} />
                <DateInput label={t("dateInput.date")} value={date} onChange={setDate} />
                <Spacer size={16} />
                <Text>Input with minimum date</Text>
                <Spacer size={16} />
                <DateInput minimumDate={new Date()} label={t("dateInput.date")} value={date} onChange={setDate} />
                <Spacer size={16} />
                <Text>Input with date to and from</Text>
                <Spacer size={16} />
                <DateInput
                    minimumDate={new Date()}
                    label={t("hunt.individualHunt.date.startDate")}
                    value={fromDate}
                    onChange={setFromDate}
                />
                <Spacer size={16} />
                <DateInput
                    disabled={!fromDate}
                    minimumDate={fromDate}
                    maximumDate={maximumAllowedDate}
                    label={t("hunt.individualHunt.date.endDate")}
                    value={toDate}
                    onChange={setToDate}
                />
                <Spacer size={24} />
                <Text>Input with clock</Text>
                <Spacer size={16} />
                <TimeInput label={t("timeInput.time")} value={timeSecond} onChange={setTimeSecond} />
                <Spacer size={16} />
                <Text>Input with minimum time</Text>
                <Spacer size={16} />
                <TimeInput
                    minimumTime={new Date()}
                    label={t("timeInput.time")}
                    value={timeSecond}
                    onChange={setTimeSecond}
                />
                <Spacer size={24} />
                <Text>Input with calendar and clock side by side</Text>
                <Spacer size={16} />
                <View style={styles.rowContent}>
                    <DateInput label={t("dateInput.date")} value={dateSecond} onChange={setDateSecond} />
                    <Spacer horizontal size={10} />
                    <TimeInput label={t("timeInput.time")} value={time} onChange={setTime} />
                </View>
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
    rowContent: {
        flexDirection: "row",
    },
});
