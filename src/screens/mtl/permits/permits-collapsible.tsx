import * as React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { MediumIcon } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { PermitCount } from "~/screens/mtl/permits/permit-count";
import { PermitTag } from "~/screens/mtl/permits/permit-tag";
import { theme } from "~/theme";

type PermitsCollapsibleProps = {
    title: string;
    availableCount: number;
    totalCount: number;
    usedCount: number;
    defaultCollapsed?: boolean;
    lastInList?: boolean;
    hasContracts?: boolean;
    onEdit: () => void;
    style?: StyleProp<ViewStyle>;
};

export function PermitsCollapsible({
    title,
    availableCount,
    totalCount,
    usedCount,
    hasContracts,
    defaultCollapsed = true,
    lastInList = false,
    onEdit,
}: PermitsCollapsibleProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const { t } = useTranslation();

    function onToggle() {
        setIsCollapsed((isCollapsed) => !isCollapsed);
    }

    return (
        <View style={(isCollapsed || !lastInList) && styles.bottomBorder}>
            <Pressable style={styles.container} onPress={onToggle}>
                <Text style={styles.text} weight="bold">
                    {title}
                </Text>
                <Spacer horizontal size={20} />
                <PermitTag count={availableCount} variant="available" />
                <Spacer horizontal size={8} />
                <PermitTag count={totalCount} variant="issued" />
                <Spacer horizontal size={20} />
                <MediumIcon color="greenActive" name={isCollapsed ? "chevronDown" : "chevronUp"} />
            </Pressable>
            {!isCollapsed && (
                <View style={styles.collapsedContainer}>
                    <PermitCount title={t("mtl.issuedPermits")} count={totalCount} />
                    <Spacer size={4} />
                    <PermitCount
                        style={styles.permitCountRow}
                        onPress={onEdit}
                        title={t("mtl.availablePermits")}
                        isEditable={hasContracts}
                        count={availableCount}
                    />
                    <Spacer size={4} />
                    <PermitCount title={t("mtl.usedPermits")} count={usedCount} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 52,
        alignItems: "center",
        flexDirection: "row",
    },
    bottomBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.color.gray2,
    },
    text: {
        flex: 1,
        paddingVertical: 16,
    },
    collapsedContainer: {
        paddingBottom: 16,
    },
    permitCountRow: {
        height: 48,
    },
});
