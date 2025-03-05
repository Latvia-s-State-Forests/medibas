import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { LargestIcon } from "~/components/icon";
import { SegmentedControl } from "~/components/segmented-control";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { ParticipantRole } from "~/types/hunts";

type Props = {
    huntTitle: string;
    onConfirm: (role: ParticipantRole) => void;
    onReject: () => void;
};

export function HunterConfirmation({ huntTitle, onConfirm, onReject }: Props) {
    const { t } = useTranslation();
    const [role, setRole] = React.useState(String(ParticipantRole.Hunter));

    const roleOptions = React.useMemo(() => {
        return [
            {
                label: t("hunt.drivenHunt.join.hunterConfirmation.hunter"),
                value: String(ParticipantRole.Hunter),
            },
            {
                label: t("hunt.drivenHunt.join.hunterConfirmation.beater"),
                value: String(ParticipantRole.Beater),
            },
        ];
    }, [t]);

    return (
        <View>
            <Spacer size={18} />
            <View style={styles.iconContainer}>
                <LargestIcon name="hunt" />
            </View>
            <Spacer size={24} />
            <Text size={22} weight="bold" style={styles.title}>
                {t("hunt.drivenHunt.join.hunterConfirmation.title", { huntTitle })}
            </Text>
            <Spacer size={34} />
            <SegmentedControl
                label={t("hunt.drivenHunt.join.hunterConfirmation.role")}
                options={roleOptions}
                value={role}
                onChange={setRole}
            />
            <Spacer size={16} />
            <Button
                title={t("hunt.drivenHunt.join.hunterConfirmation.confirm")}
                onPress={() => {
                    if (role === String(ParticipantRole.Hunter)) {
                        onConfirm(ParticipantRole.Hunter);
                    } else {
                        onConfirm(ParticipantRole.Beater);
                    }
                }}
            />
            <Spacer size={8} />
            <Button
                title={t("hunt.drivenHunt.join.hunterConfirmation.reject")}
                variant="secondary-outlined"
                onPress={onReject}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: "center",
    },
    title: {
        textAlign: "center",
    },
});
