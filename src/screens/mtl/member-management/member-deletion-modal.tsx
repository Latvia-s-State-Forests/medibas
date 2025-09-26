import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useActorRef } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { CheckboxButton } from "~/components/checkbox-button";
import { LargestIcon } from "~/components/icon";
import { Text } from "~/components/text";
import { useDarkStatusBar } from "~/hooks/use-status-bar";
import { logger } from "~/logger";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { DeleteMemberStatusDialog, deleteMemberMachine } from "./delete-member-status-dialog";
import { formatMemberLabel } from "./format-member-label";

type MemberDeletionModalProps = NativeStackScreenProps<RootNavigatorParams, "MemberDeletionModal">;

export function MemberDeletionModal(props: MemberDeletionModalProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { member, districts, preSelectedDistrictId } = props.route.params;
    const [selectedDistrictIds, setSelectedDistrictIds] = React.useState([preSelectedDistrictId]);

    const actor = useActorRef(
        deleteMemberMachine.provide({
            actions: {
                onDeleteSuccess: () => {
                    navigation.goBack();
                },
            },
        }),
        {
            inspect: (inspectEvent) => {
                if (inspectEvent.type === "@xstate.snapshot") {
                    const snapshot = inspectEvent.actorRef?.getSnapshot();
                    if (snapshot?.machine?.id === deleteMemberMachine.id) {
                        logger.log("DM " + JSON.stringify(snapshot.value) + " " + JSON.stringify(inspectEvent.event));
                    }
                }
            },
        }
    );

    useDarkStatusBar();

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + 24, paddingLeft: insets.left + 16, paddingRight: insets.right + 16 },
                ]}
            >
                <LargestIcon name="delete" />
                <Text size={22} weight="bold" style={styles.title}>
                    {t("mtl.deleteMember.modal.title", {
                        member: formatMemberLabel(member.cardNumber, member.firstName, member.lastName),
                    })}
                </Text>

                <CheckboxButton
                    state={
                        selectedDistrictIds.length === districts.length
                            ? "checked"
                            : selectedDistrictIds.length > 0
                              ? "indeterminate"
                              : "unchecked"
                    }
                    label={t("mtl.deleteMember.modal.allDistricts")}
                    onPress={() => {
                        setSelectedDistrictIds((ids) => {
                            if (ids.length === districts.length) {
                                return [];
                            } else {
                                return districts.map((district) => district.id);
                            }
                        });
                    }}
                />
                <View style={styles.separator} />
                {districts.map((district) => (
                    <CheckboxButton
                        key={district.id}
                        state={selectedDistrictIds.includes(district.id) ? "checked" : "unchecked"}
                        label={district.name}
                        onPress={() => {
                            setSelectedDistrictIds((ids) => {
                                if (ids.includes(district.id)) {
                                    return ids.filter((id) => id !== district.id);
                                } else {
                                    return ids.concat(district.id);
                                }
                            });
                        }}
                    />
                ))}
            </ScrollView>

            <View
                style={[
                    styles.footer,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <Button
                    title={t("mtl.deleteMember.modal.delete")}
                    variant="danger"
                    onPress={() => {
                        actor.send({
                            type: "DELETE_FROM_MULTIPLE_DISTRICTS",
                            member,
                            districts: districts.filter((district) => selectedDistrictIds.includes(district.id)),
                        });
                    }}
                    disabled={selectedDistrictIds.length === 0}
                />
                <Button
                    title={t("mtl.deleteMember.modal.cancel")}
                    variant="secondary-outlined"
                    onPress={() => navigation.goBack()}
                />
            </View>

            <DeleteMemberStatusDialog actor={actor} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    content: {
        alignItems: "center",
    },
    title: {
        textAlign: "center",
        marginVertical: 18,
    },
    separator: {
        width: "100%",
        height: 1,
        backgroundColor: theme.color.gray2,
    },
    footer: {
        paddingTop: 16,
        gap: 16,
    },
});
