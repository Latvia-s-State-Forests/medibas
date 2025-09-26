import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useActorRef, useSelector } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActorRefFrom } from "xstate";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { ErrorMessage } from "~/components/error-message";
import { Header } from "~/components/header";
import { MediumIcon } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Spinner } from "~/components/spinner";
import { Text } from "~/components/text";
import { useContracts } from "~/hooks/use-contracts";
import { logger } from "~/logger";
import { theme } from "~/theme";
import { Contract } from "~/types/contracts";
import { RootNavigatorParams } from "~/types/navigation";
import {
    calculateManuallyAssignedCount,
    calculatePermitsLeft,
    calculateUndividedPermits,
    calculateUnpaidPermits,
} from "~/utils/permit-distribution-calculations";
import { permitDistributionMachine } from "~/utils/permit-distribution-machine";
import { PermitCount } from "./permit-count";

export type DistrictPermits = {
    districtId: number;
    districtName: string;
    count: number;
    isManuallyChanged?: boolean;
};

type PermitDistributionScreenProps = NativeStackScreenProps<RootNavigatorParams, "PermitDistributionScreen">;

export function PermitDistributionScreen(props: PermitDistributionScreenProps) {
    const { contractId, permitTypeId, title } = props.route.params;
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const contracts = useContracts();
    const actor = useActorRef(
        permitDistributionMachine.provide({
            actions: {
                close: () => {
                    navigation.goBack();
                },
            },
        }),
        {
            inspect: (inspectEvent) => {
                if (inspectEvent.type === "@xstate.snapshot") {
                    const snapshot = inspectEvent.actorRef?.getSnapshot();
                    if (snapshot?.machine?.id === permitDistributionMachine.id) {
                        logger.log(
                            "🦌 PD " + JSON.stringify(snapshot.value) + " " + JSON.stringify(inspectEvent.event)
                        );
                    }
                }
            },
        }
    );

    const contract = contracts.find((contract) => contract.id === Number(contractId));
    const permit = contract?.permits.find((permit) => permit.permitTypeId === Number(permitTypeId));

    if (!contract || !permit) {
        navigation.goBack();
        return null;
    }

    function onSubmit(permits: DistrictPermits[]) {
        if (!contract?.contractNumber) {
            return;
        }

        actor.send({
            type: "SUBMIT",
            data: {
                contractNumber: contract.contractNumber,
                permits: permits.map((permit) => ({
                    districtId: permit.districtId,
                    permitCount: permit.isManuallyChanged ? permit.count : 0,
                    hasAssignedPermits: permit.isManuallyChanged ?? false,
                })),
                permitTypeId: Number(permitTypeId),
            },
        });
    }

    const totalCount = permit.issued;
    const availableCount = permit.available;
    const usedCount = permit.used;
    const unpaidPermitsCount = calculateUnpaidPermits(totalCount, availableCount, usedCount);

    return (
        <>
            <View style={styles.container}>
                <Header title={title} />
                <KeyboardAwareScrollView
                    bottomOffset={Platform.select({ ios: 24, android: 48 })}
                    contentContainerStyle={[
                        styles.body,
                        {
                            paddingLeft: insets.left + 20,
                            paddingRight: insets.right + 20,
                            paddingBottom: insets.bottom + 24,
                        },
                    ]}
                >
                    <PermitCount title={t("permitDistribution.issuedPermits")} count={totalCount} />
                    <Spacer size={4} />
                    <PermitCount title={t("permitDistribution.unpaidPermits")} count={unpaidPermitsCount} />
                    <Spacer size={4} />
                    <PermitCount title={t("permitDistribution.availablePermits")} count={availableCount} />
                    <Spacer size={4} />
                    <PermitCount title={t("permitDistribution.usedPermits")} count={usedCount} />
                    <PermitDistributionForm districts={contract.districts} permit={permit} onSubmit={onSubmit} />
                </KeyboardAwareScrollView>
            </View>

            <SubmissionStatus actor={actor} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        paddingBottom: 32,
        paddingTop: 19,
    },
});

type PermitDistributionFormProps = {
    districts: Contract["districts"];
    permit: Contract["permits"][0];
    onSubmit: (permits: DistrictPermits[]) => void;
};

function assignPermits(districts: Contract["districts"], permit: Contract["permits"][0]): DistrictPermits[] {
    const districtPermits = [];
    for (const district of districts) {
        const count = permit.assignedPermits.find((assigned) => assigned.districtId === district.districtId)?.unused;
        const districtPermit: DistrictPermits = {
            districtId: district.districtId,
            districtName: district.descriptionLv,
            count: count ?? 0,
            isManuallyChanged: count !== undefined,
        };
        districtPermits.push(districtPermit);
    }
    return districtPermits;
}

function PermitDistributionForm({ districts, permit, onSubmit }: PermitDistributionFormProps) {
    const { t } = useTranslation();
    const refs = React.useRef<TextInput[]>([]);
    const [permits, setPermits] = React.useState<DistrictPermits[]>(() => assignPermits(districts, permit));
    const [initialPermits] = React.useState<DistrictPermits[]>(permits);

    const manuallyAssignedCount = calculateManuallyAssignedCount(permits);

    const undividedCount = calculateUndividedPermits(permit.available, manuallyAssignedCount);

    const isChanged = permits.some(
        (permit, index) =>
            permit.count !== initialPermits[index].count ||
            permit.isManuallyChanged !== initialPermits[index].isManuallyChanged
    );

    const error = calculatePermitsLeft(manuallyAssignedCount, permit.available);

    return (
        <View>
            <Spacer size={4} />
            <PermitCount title={t("permitDistribution.dividedPermits")} count={manuallyAssignedCount} />
            <Spacer size={4} />
            <PermitCount title={t("permitDistribution.undividedPermits")} count={undividedCount} />
            <Spacer size={21} />

            <View style={formStyles.fieldsContainer}>
                {permits.map((permit, index) => {
                    const id = "permit_" + permit.districtId;
                    function onCountChange(value: string) {
                        let newCount = Number(value);
                        if (isNaN(newCount) || !isFinite(newCount) || newCount > 1000000000000) {
                            newCount = 0;
                        }
                        setPermits((permits) =>
                            permits.map((permit, i) => {
                                if (i !== index) {
                                    return permit;
                                }

                                return {
                                    ...permit,
                                    count: newCount,
                                };
                            })
                        );
                    }

                    function onEditingToggle() {
                        let isManuallyChanged = false;
                        setPermits((permits) =>
                            permits.map((permit, i) => {
                                if (i === index) {
                                    isManuallyChanged = !permit.isManuallyChanged;
                                    return {
                                        ...permit,
                                        isManuallyChanged,
                                        count: isManuallyChanged ? 0 : permit.count,
                                    };
                                }
                                return permit;
                            })
                        );
                        if (isManuallyChanged) {
                            setTimeout(() => {
                                refs.current[index]?.focus();
                            }, 50);
                        }
                    }

                    return (
                        <DistributeField
                            key={id}
                            id={id}
                            label={permit.districtName}
                            value={String(permit.count)}
                            undividedCount={String(undividedCount)}
                            isManuallyChanged={permit.isManuallyChanged}
                            onChangeText={onCountChange}
                            toggleEditing={onEditingToggle}
                            ref={(ref) => {
                                if (refs.current && ref) {
                                    refs.current[index] = ref;
                                }
                            }}
                        />
                    );
                })}
            </View>
            <Spacer size={24} />
            {error ? (
                <>
                    <ErrorMessage text={t("permitDistribution.error")} />
                    <Spacer size={24} />
                </>
            ) : null}

            <Button
                title={t("permitDistribution.save")}
                onPress={() => onSubmit(permits)}
                disabled={!isChanged || error}
            />
        </View>
    );
}

const formStyles = StyleSheet.create({
    fieldsContainer: {
        gap: 16,
    },
});

type Ref<T> = React.RefCallback<T> | React.MutableRefObject<T | null> | null;

function mergeRefs<T = unknown>(refs: Array<Ref<T>>): Ref<T> {
    return (value: T) => {
        refs.forEach((ref) => {
            if (typeof ref === "function") {
                ref(value);
            } else if (ref != null) {
                ref.current = value;
            }
        });
    };
}

type DistributeFieldProps = TextInputProps & {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    isManuallyChanged?: boolean;
    undividedCount: string;
    toggleEditing: () => void;
};

const DistributeField = React.forwardRef<TextInput, DistributeFieldProps>(
    (
        {
            label,
            value,
            onChangeText,
            isManuallyChanged,
            undividedCount,
            toggleEditing,
            editable = true,
            keyboardType = "number-pad",
            ...props
        },
        ref
    ) => {
        const disabled = !isManuallyChanged;
        const [isFocused, setIsFocused] = React.useState(false);
        const inputHeight = { lineHeight: Platform.OS === "ios" ? 0 : 24 };
        const inputPadding = { paddingTop: Platform.OS === "ios" ? 3 : 0 };
        const containerBackground = { backgroundColor: disabled ? theme.color.gray2 : theme.color.white };
        const borderColor = { borderColor: isFocused ? theme.color.greenActive : theme.color.gray2 };
        const iconBackground = { backgroundColor: disabled ? theme.color.white : theme.color.gray2 };
        const inputRef = React.useRef<TextInput>(null);
        const mergedRef = mergeRefs([inputRef, ref]);

        function onContainerPress() {
            if (!editable) {
                return;
            }
            inputRef.current?.focus();
        }

        function onFocus() {
            setIsFocused(true);
            if (!value) {
                onChangeText?.("0");
            }
        }

        function onBlur() {
            setIsFocused(false);
        }

        function toggleDisabled() {
            if (!editable) {
                return;
            }
            toggleEditing?.();
        }

        return (
            <Pressable style={[inputStyles.container, borderColor, containerBackground]} onPress={onContainerPress}>
                <View style={inputStyles.leftContent}>
                    <Text numberOfLines={1} size={12} color={"gray8"} weight={"bold"} style={inputStyles.label}>
                        {label}
                    </Text>
                    <TextInput
                        {...props}
                        scrollEnabled={false}
                        ref={mergedRef}
                        value={isManuallyChanged ? value : undividedCount}
                        onChangeText={onChangeText}
                        editable={!disabled}
                        style={[inputStyles.textInput, inputPadding, inputHeight]}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        keyboardType={keyboardType}
                    />
                </View>
                <Pressable onPress={toggleDisabled} style={[inputStyles.icon, iconBackground]}>
                    <MediumIcon name={disabled ? "lock" : "unlock"} />
                </Pressable>
            </Pressable>
        );
    }
);

DistributeField.displayName = "DistributeField";

const inputStyles = StyleSheet.create({
    container: {
        backgroundColor: theme.color.white,
        flexDirection: "row",
        paddingLeft: 16,
        paddingRight: 8,
        paddingVertical: 8,
        borderWidth: 1,
        borderRadius: 8,
        minHeight: 56,
    },
    leftContent: {
        flex: 1,
    },
    label: {
        lineHeight: 15.6,
    },
    textInput: {
        fontSize: 16,
        color: theme.color.gray8,
    },
    icon: {
        padding: 8,
        borderRadius: 6,
    },
});

type SubmissionStatusProps = {
    actor: ActorRefFrom<typeof permitDistributionMachine>;
};

function SubmissionStatus({ actor }: SubmissionStatusProps) {
    const { t } = useTranslation();

    const state = useSelector(actor, (snapshot) => {
        if (snapshot.matches("loading")) {
            return "loading";
        }
        if (snapshot.matches("success")) {
            return "success";
        }
        if (snapshot.matches({ failure: "network" })) {
            return "failure_network";
        }
        if (snapshot.matches("failure")) {
            return "failure_other";
        }
        return "other";
    });

    function onRetry() {
        actor.send({ type: "RETRY" });
    }

    function onCancel() {
        actor.send({ type: "CANCEL" });
    }

    if (state === "loading") {
        return <Dialog visible icon={<Spinner />} title={t("permitDistribution.loading")} />;
    }

    if (state === "success") {
        return <Dialog visible icon="success" title={t("permitDistribution.success")} />;
    }

    if (state === "failure_network") {
        return (
            <Dialog
                visible
                icon="failure"
                title={t("permitDistribution.networkError.title")}
                description={t("permitDistribution.networkError.description")}
                buttons={
                    <>
                        <Button title={t("permitDistribution.retry")} onPress={onRetry} />
                        <Button variant="secondary-outlined" title={t("modal.cancel")} onPress={onCancel} />
                    </>
                }
            />
        );
    }

    if (state === "failure_other") {
        return (
            <Dialog
                visible
                icon="failure"
                title={t("permitDistribution.otherError.title")}
                description={t("permitDistribution.otherError.description")}
                buttons={
                    <>
                        <Button title={t("permitDistribution.retry")} onPress={onRetry} />
                        <Button variant="secondary-outlined" title={t("modal.cancel")} onPress={onCancel} />
                    </>
                }
            />
        );
    }

    return null;
}
