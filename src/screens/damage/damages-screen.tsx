import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { CurrentPosition, CurrentPositionHandle } from "~/components/current-position/current-position";
import { ErrorMessage } from "~/components/error-message";
import { Header } from "~/components/header";
import { Input } from "~/components/input";
import { Photo } from "~/components/photo/photo";
import { ReadOnlyField } from "~/components/read-only-field";
import { useReportsContext } from "~/components/reports-provider";
import { Spacer } from "~/components/spacer";
import { TypeField } from "~/components/type-field";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useUserStorage } from "~/machines/authentication-machine";
import { ForestDamage } from "~/screens/damage/forest-damage";
import { InfrastructureDamage } from "~/screens/damage/infrastructure-damage";
import { LandDamage } from "~/screens/damage/land-damage";
import { getDamageValidationErrors } from "~/screens/damage/validation";
import { theme } from "~/theme";
import { Classifiers, DamageTypeId } from "~/types/classifiers";
import { DamageState, ForestDamageState, InfrastructureDamageState, LandDamageState } from "~/types/damage";
import { TabsNavigatorParams } from "~/types/navigation";
import { PositionResult } from "~/types/position-result";
import { Report } from "~/types/report";
import { getActiveClassifiers } from "~/utils/filter-classifiers";
import { formatLabel } from "~/utils/format-label";
import { formatPosition } from "~/utils/format-position";
import { movePhoto } from "~/utils/photo";
import { getDamageEdits } from "./get-damage-edits";

function getDefaultDamageState(classifiers: Classifiers): DamageState {
    return {
        position: undefined,
        notes: "",
        land: {
            customSpecies: "",
            otherSpecies: "",
            area: "",
            count: configuration.damage.land.count.defaultValue,
        },
        forest: {
            area: "",
            standProtection: configuration.damage.forest.standProtection.defaultValue ?? "",
            damagedTreeSpecies: {},
            damageVolumeType:
                classifiers.damageVolumeTypes.defaultValue ?? configuration.damage.forest.defaultDamageVolumeType,
            responsibleSpecies: undefined,
            otherResponsibleSpecies: "",
            damageTypes: {},
        },
        infrastructure: {
            type: classifiers.infrastructureTypes.defaultValue ?? configuration.damage.infrastructure.defaultType,
            otherType: "",
            responsibleSpecies: configuration.damage.infrastructure.defaultResponsibleSpecies,
            otherResponsibleSpecies: "",
        },
    };
}
type DamagesScreenProps = NativeStackScreenProps<TabsNavigatorParams, "DamagesScreen">;

export function DamagesScreen(props: DamagesScreenProps) {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const damageTypeClassifiers = getActiveClassifiers(classifiers, "damageTypes");
    const [damage, setDamage] = React.useState<DamageState>(
        () => props.route.params?.initialState ?? getDefaultDamageState(classifiers)
    );
    const currentPositionRef = React.useRef<CurrentPositionHandle>(null);
    const navigation = useNavigation();
    const reports = useReportsContext();
    const userStorage = useUserStorage();
    const scrollViewRef = React.useRef<ScrollView>(null);

    React.useEffect(() => {
        if (props.route.params?.initialState) {
            scrollViewRef.current?.scrollToEnd({
                animated: false,
            });
        }
    }, [props.route.params?.initialState]);

    function onCurrentPositionChange(position: PositionResult | undefined) {
        setDamage({ ...damage, position });
    }

    function onNotesChange(notes: string) {
        setDamage((damage) => ({
            ...damage,
            notes,
        }));
    }

    function onTypeChange(type: string) {
        setDamage((damage) => ({
            ...damage,
            type: Number(type),
        }));
    }

    function onForestChange(update: (damage: ForestDamageState) => ForestDamageState) {
        setDamage((damage) => ({
            ...damage,
            forest: update(damage.forest),
        }));
    }

    function onLandChange(update: (landDamage: LandDamageState) => LandDamageState) {
        setDamage((damage) => ({
            ...damage,
            land: update(damage.land),
        }));
    }

    function onInfrastructureChange(update: Partial<InfrastructureDamageState>) {
        setDamage((damage) => ({
            ...damage,
            infrastructure: { ...damage.infrastructure, ...update },
        }));
    }
    function onPhotoChange(value: string | undefined) {
        setDamage((damage) => ({
            ...damage,
            photo: value,
        }));
    }

    function onPhotoSelectOpen() {
        userStorage.setFormState({
            timestamp: Date.now(),
            type: "damages",
            state: damage,
        });
    }

    function onPhotoSelectClose() {
        userStorage.deleteFormState();
    }

    async function onSaveButtonPress() {
        const reportId = randomUUID();

        let photo: string | undefined;
        if (damage.photo) {
            photo = await movePhoto(damage.photo, "report_" + reportId);
        }

        const report: Report = {
            id: reportId,
            createdAt: new Date().toISOString(),
            status: "pending",
            edits: getDamageEdits(damage, classifiers),
            photo,
        };
        reports.send({ type: "ADD", report });
        navigation.navigate("ReportStatusModal", { reportId: report.id });
        setDamage(getDefaultDamageState(classifiers));
        setTimeout(() => currentPositionRef.current?.reset(), 100);
    }

    const validationErrors = getDamageValidationErrors(damage, classifiers);
    const hasValidationErrors = validationErrors.length !== 0;

    return (
        <View style={styles.container}>
            <Header title={t("damage.title")} showBackButton={false} />
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                    },
                ]}
            >
                <View style={styles.currentPositionContainer}>
                    <CurrentPosition
                        ref={currentPositionRef}
                        onChange={onCurrentPositionChange}
                        initialPosition={damage.position}
                    />
                </View>
                <Spacer size={24} />
                <ReadOnlyField
                    label={t("damage.position")}
                    value={damage.position ? formatPosition(damage.position) : " "}
                />
                <Spacer size={24} />
                <Input label={t("damage.notes")} onChangeText={onNotesChange} value={damage.notes} />
                <Spacer size={24} />
                <TypeField
                    label={t("damage.type")}
                    options={damageTypeClassifiers.map((classifier) => ({
                        label: formatLabel(classifier.description),
                        value: String(classifier.id),
                        iconName: configuration.damage.typeIcons[classifier.id as DamageTypeId] ?? "cross",
                    }))}
                    value={damage.type ? String(damage.type) : ""}
                    onChange={onTypeChange}
                />
                {damage.type === DamageTypeId.AgriculturalLand && (
                    <LandDamage damage={damage.land} onChange={onLandChange} />
                )}
                {damage.type === DamageTypeId.Infrastructure && (
                    <InfrastructureDamage damage={damage.infrastructure} onChange={onInfrastructureChange} />
                )}
                {damage.type === DamageTypeId.Forest && (
                    <ForestDamage damage={damage.forest} onChange={onForestChange} />
                )}
                {damage.type && (
                    <>
                        <Spacer size={damage.type === DamageTypeId.Forest ? 12 : 24} />
                        <Photo
                            onChange={onPhotoChange}
                            value={damage.photo}
                            onPhotoSelectOpen={onPhotoSelectOpen}
                            onPhotoSelectClose={onPhotoSelectClose}
                        />
                        {hasValidationErrors ? (
                            <>
                                <Spacer size={24} />
                                <View style={styles.validationErrorMessages}>
                                    {validationErrors.map((error, index) => (
                                        <ErrorMessage text={error} key={`${error}-${index}`} />
                                    ))}
                                </View>
                            </>
                        ) : null}
                        <Spacer size={24} />
                        <Button
                            onPress={onSaveButtonPress}
                            title={t("damage.saveAndSend")}
                            disabled={hasValidationErrors}
                        />
                    </>
                )}
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
        paddingBottom: 24,
    },
    currentPositionContainer: {
        marginHorizontal: -16,
    },
    validationErrorMessages: {
        gap: 19,
    },
});
