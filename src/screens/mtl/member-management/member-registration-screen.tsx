import { useNavigation } from "@react-navigation/native";
import { useActorRef } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { ActorRefFrom, assign, fromCallback, setup } from "xstate";
import { RegisterMemberBody, api } from "~/api";
import { Button } from "~/components/button";
import { CheckboxButton } from "~/components/checkbox-button";
import { Dialog } from "~/components/dialog";
import { FieldLabel } from "~/components/field-label";
import { Header } from "~/components/header";
import { Input } from "~/components/input";
import { Spacer } from "~/components/spacer";
import { Spinner } from "~/components/spinner";
import { useMemberships } from "~/hooks/use-memberships";
import { usePermissions } from "~/hooks/use-permissions";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";
import { NetworkStatusEvent, networkStatusMachine } from "~/utils/network-status-machine";

export function MemberRegistrationScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const permissions = usePermissions();
    const memberships = useMemberships();

    const [hunterCardNumber, setHunterCardNumber] = React.useState("");
    const [selectedDistrictIds, setSelectedDistrictIds] = React.useState<number[]>([]);

    const actor = useActorRef(registerMemberMachine, {
        inspect: (inspectEvent) => {
            if (inspectEvent.type === "@xstate.snapshot") {
                const snapshot = inspectEvent.actorRef?.getSnapshot();
                if (snapshot?.machine?.id === registerMemberMachine.id) {
                    logger.log("RM " + JSON.stringify(snapshot.value) + " " + JSON.stringify(inspectEvent.event));
                }
            }
        },
    });

    function onSubmit() {
        actor.send({
            type: "REGISTER_MEMBER",
            payload: {
                cardNumber: hunterCardNumber,
                addToDistrictIds: selectedDistrictIds.map((district) => Number(district)),
            },
        });
    }

    const districts = memberships
        .filter((membership) => permissions.createDistrictMember(membership.id))
        .map((membership) => ({
            id: membership.id,
            name: membership.name,
        }));

    return (
        <>
            <View style={styles.container}>
                <Header title={t("mtl.registerMember.title")} />
                <View style={styles.content}>
                    <KeyboardAwareScrollView
                        bottomOffset={Platform.select({ ios: 24, android: 48 })}
                        contentContainerStyle={[
                            {
                                paddingRight: insets.right + 16,
                                paddingLeft: insets.left + 16,
                            },
                            styles.form,
                        ]}
                    >
                        <Input
                            label={t("mtl.registerMember.hunterCardNumber")}
                            value={hunterCardNumber}
                            onChangeText={setHunterCardNumber}
                        />

                        <Spacer size={24} />

                        <FieldLabel label={t("mtl.registerMember.huntingDistricts")} />
                        <Spacer size={4} />
                        <CheckboxButton
                            state={
                                selectedDistrictIds.length === districts.length
                                    ? "checked"
                                    : selectedDistrictIds.length > 0
                                      ? "indeterminate"
                                      : "unchecked"
                            }
                            label={t("mtl.registerMember.allDistricts")}
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
                    </KeyboardAwareScrollView>
                    <View
                        style={[
                            {
                                paddingRight: insets.right + 16,
                                paddingLeft: insets.left + 16,
                                paddingBottom: insets.bottom + 24,
                            },
                            styles.footer,
                        ]}
                    >
                        <Button
                            onPress={onSubmit}
                            variant="primary"
                            title={t("mtl.registerMember.addMember")}
                            disabled={!hunterCardNumber || !selectedDistrictIds.length}
                        />
                    </View>
                </View>
            </View>

            <RegisterMemberStatusDialog actor={actor} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    content: {
        flex: 1,
    },
    form: {
        paddingVertical: 24,
    },
    separator: {
        width: "100%",
        height: 1,
        backgroundColor: theme.color.gray2,
    },
    footer: {
        marginTop: 16,
    },
});

type RegisterMemberEvent =
    | { type: "REGISTER_MEMBER"; payload: RegisterMemberBody }
    | { type: "REGISTER_MEMBER_SUCCESS" }
    | { type: "REGISTER_MEMBER_FAILURE" }
    | { type: "UPDATE_MEMBERSHIPS_SUCCESS" }
    | { type: "UPDATE_MEMBERSHIPS_FAILURE" }
    | { type: "RESET" }
    | NetworkStatusEvent;

const registerMemberMachine = setup({
    types: {
        events: {} as RegisterMemberEvent,
        context: {} as { payload?: RegisterMemberBody },
    },
    actions: {
        setPayload: assign({
            payload: ({ context, event }) => {
                if (event.type !== "REGISTER_MEMBER") {
                    return context.payload;
                }
                return event.payload;
            },
        }),
        resetPayload: assign({
            payload: undefined,
        }),
    },
    actors: {
        registerMember: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: RegisterMemberEvent) => void;
                input: { payload?: RegisterMemberBody };
            }) => {
                const payload = input?.payload;
                if (!payload) {
                    logger.error("Failed to register member, payload is missing");
                    sendBack({ type: "REGISTER_MEMBER_FAILURE" });
                    return;
                }

                api.registerMembership(payload)
                    .then(() => {
                        sendBack({ type: "REGISTER_MEMBER_SUCCESS" });
                    })
                    .catch((error) => {
                        logger.error("Failed to register member", error);
                        sendBack({ type: "REGISTER_MEMBER_FAILURE" });
                    });
            }
        ),
        updateMemberships: fromCallback(({ sendBack }: { sendBack: (event: RegisterMemberEvent) => void }) => {
            queryClient
                .refetchQueries({ queryKey: queryKeys.memberships }, { throwOnError: true })
                .then(() => {
                    sendBack({ type: "UPDATE_MEMBERSHIPS_SUCCESS" });
                })
                .catch((error) => {
                    logger.error("Failed to update memberships", error);
                    sendBack({ type: "UPDATE_MEMBERSHIPS_FAILURE" });
                });
        }),
    },
}).createMachine({
    id: "registerMember",
    initial: "idle",
    states: {
        idle: {
            on: {
                REGISTER_MEMBER: { target: "verifyingNetworkConnection", actions: ["setPayload"] },
            },
        },

        verifyingNetworkConnection: {
            invoke: { src: networkStatusMachine },
            on: {
                NETWORK_AVAILABLE: { target: "registeringMember" },
                NETWORK_UNAVAILABLE: { target: "networkFailure" },
            },
        },

        registeringMember: {
            invoke: { src: "registerMember", input: ({ context }) => ({ payload: context.payload }) },
            on: {
                REGISTER_MEMBER_SUCCESS: { target: "updatingMemberships" },
                REGISTER_MEMBER_FAILURE: { target: "otherFailure" },
            },
        },

        updatingMemberships: {
            invoke: { src: "updateMemberships" },
            on: {
                UPDATE_MEMBERSHIPS_SUCCESS: { target: "success" },
                UPDATE_MEMBERSHIPS_FAILURE: { target: "otherFailure" },
            },
        },

        success: {
            type: "final",
        },

        networkFailure: {
            on: {
                RESET: { target: "idle", actions: ["resetPayload"] },
            },
        },

        otherFailure: {
            on: {
                RESET: { target: "idle", actions: ["resetPayload"] },
            },
        },
    },
});

type RegisterMemberStatusDialogProps = {
    actor: ActorRefFrom<typeof registerMemberMachine>;
};

function RegisterMemberStatusDialog({ actor }: RegisterMemberStatusDialogProps) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [visible, setVisible] = React.useState(false);
    const [status, setStatus] = React.useState<"loading" | "success" | "networkFailure" | "otherFailure">("loading");

    React.useEffect(() => {
        const subscription = actor.subscribe((state) => {
            if (
                state.matches("verifyingNetworkConnection") ||
                state.matches("registeringMember") ||
                state.matches("updatingMemberships")
            ) {
                setVisible(true);
                setStatus("loading");
            } else if (state.matches("success")) {
                setVisible(true);
                setStatus("success");
            } else if (state.matches("networkFailure")) {
                setVisible(true);
                setStatus("networkFailure");
            } else if (state.matches("otherFailure")) {
                setVisible(true);
                setStatus("otherFailure");
            } else {
                setVisible(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [actor]);

    return match(status)
        .with("loading", () => (
            <Dialog visible={visible} icon={<Spinner />} title={t("mtl.registerMember.loading.title")} />
        ))
        .with("success", () => (
            <Dialog
                visible={visible}
                icon="success"
                title={t("mtl.registerMember.success.title")}
                buttons={
                    <Button title={t("mtl.registerMember.success.continue")} onPress={() => navigation.goBack()} />
                }
            />
        ))
        .with("networkFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={t("mtl.registerMember.networkFailure.title")}
                description={t("mtl.registerMember.networkFailure.description")}
                buttons={
                    <Button
                        title={t("mtl.registerMember.networkFailure.close")}
                        onPress={() => actor.send({ type: "RESET" })}
                    />
                }
            />
        ))
        .with("otherFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={t("mtl.registerMember.otherFailure.title")}
                description={t("mtl.registerMember.otherFailure.description")}
                buttons={
                    <Button
                        title={t("mtl.registerMember.otherFailure.close")}
                        onPress={() => actor.send({ type: "RESET" })}
                    />
                }
            />
        ))
        .exhaustive();
}
