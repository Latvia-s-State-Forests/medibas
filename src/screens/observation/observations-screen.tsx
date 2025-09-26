import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
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
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useUserStorage } from "~/machines/authentication-machine";
import { Animals } from "~/screens/observation/animals";
import { getDefaultAnimalsItemState } from "~/screens/observation/animals-item";
import { Dead } from "~/screens/observation/dead-animals";
import { ObservationsSpecies } from "~/screens/observation/observations-species";
import { ObservationsType } from "~/screens/observation/observations-type";
import { SignsOfPresence } from "~/screens/observation/signs-of-presence";
import { getObservationsValidationErrors } from "~/screens/observation/validation";
import { theme } from "~/theme";
import { Classifiers, ObservationTypeId, SpeciesId } from "~/types/classifiers";
import { RootNavigatorParams, TabsNavigatorParams } from "~/types/navigation";
import { AnimalsState, DeadAnimalsState, ObservationsState, SignsOfPresenceState } from "~/types/observations";
import { PositionResult } from "~/types/position-result";
import { Report } from "~/types/report";
import { formatPosition } from "~/utils/format-position";
import { movePhoto } from "~/utils/photo";
import { getObservationEdits } from "./get-observation-edits";

export function getDefaultObservationsState(
    classifiers: Classifiers,
    huntEventId: number | undefined
): ObservationsState {
    return {
        position: undefined,
        notes: "",
        huntEventId,
        huntEventArea: undefined,
        animals: [getDefaultAnimalsItemState(classifiers)],
        signsOfPresence: {
            observedSigns: {},
            observedSignsNotes: "",
            count: configuration.observations.signsOfPresence.count.defaultValue,
        },
        deadAnimals: {
            gender: classifiers.genders.defaultValue ?? configuration.observations.deadAnimals.defaultGender,
            deathType: classifiers.deathTypes.defaultValue ?? configuration.observations.deadAnimals.defaultDeathType,
            age: classifiers.ages.defaultValue ?? configuration.observations.deadAnimals.defaultAge,
            count: configuration.observations.deadAnimals.count.defaultValue ?? 1,
            observedSignsOfDisease: false,
            signsOfDisease: {},
            notesOnDiseases: "",
        },
    };
}

type ObservationsScreenRootProps = NativeStackScreenProps<RootNavigatorParams, "ObservationsScreenRoot">;
type ObservationsScreenTabProps = NativeStackScreenProps<TabsNavigatorParams, "ObservationsScreen">;

type ObservationsScreenProps = ObservationsScreenRootProps | ObservationsScreenTabProps;

export function ObservationsScreen({ route }: ObservationsScreenProps) {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const userStorage = useUserStorage();
    const scrollViewRef = React.useRef<React.ComponentRef<typeof KeyboardAwareScrollView>>(null);
    const currentPositionRef = React.useRef<CurrentPositionHandle>(null);
    const [observations, setObservations] = React.useState<ObservationsState>(
        () => route.params?.initialState ?? getDefaultObservationsState(classifiers, route.params?.huntEventId)
    );
    const navigation = useNavigation();
    const reports = useReportsContext();

    React.useEffect(() => {
        if (route.params?.initialState) {
            scrollViewRef.current?.scrollToEnd({
                animated: false,
            });
        }
    }, [route.params?.initialState]);

    function onCurrentPositionChange(position: PositionResult | undefined) {
        setObservations({ ...observations, position });
    }

    function onNotesChange(notes: string) {
        setObservations((observations) => ({
            ...observations,
            notes,
        }));
    }

    function onMastAreaChange(value: string) {
        const cleanValue = value.replace(/\D/g, "");
        const huntEventArea = cleanValue ? parseInt(cleanValue) : undefined;
        setObservations((observations) => ({ ...observations, huntEventArea }));
    }

    function onTypeChange(type: number) {
        setObservations((observations) => ({
            ...observations,
            type,
        }));
    }

    function onSpeciesChange(species: number) {
        setObservations((observations) => ({
            ...observations,
            species,
        }));
    }

    function onOtherMammalsChange(otherMammals: number) {
        setObservations((observations) => ({
            ...observations,
            otherMammals,
        }));
    }

    function onBirdsChange(birds: number) {
        setObservations((observations) => ({
            ...observations,
            birds,
        }));
    }

    function onAnimalsChange(update: (animals: AnimalsState) => AnimalsState) {
        setObservations((observations) => ({
            ...observations,
            animals: update(observations.animals),
        }));
    }

    function onSignsOfPresenceChange(update: (signsOfPresence: SignsOfPresenceState) => SignsOfPresenceState) {
        setObservations((observations) => ({
            ...observations,
            signsOfPresence: update(observations.signsOfPresence),
        }));
    }

    function onDeadAnimalsChange(update: (deadAnimals: DeadAnimalsState) => DeadAnimalsState) {
        setObservations((observations) => ({
            ...observations,
            deadAnimals: update(observations.deadAnimals),
        }));
    }

    function onPhotoChange(value: string | undefined) {
        setObservations((observations) => ({
            ...observations,
            photo: value,
        }));
    }

    function onPhotoSelectOpen() {
        userStorage.setFormState({
            timestamp: Date.now(),
            type: "observations",
            state: observations,
        });
    }

    function onPhotoSelectClose() {
        userStorage.deleteFormState();
    }

    async function onSaveButtonPress() {
        const reportId = randomUUID();

        let photo: string | undefined;
        if (observations.photo) {
            photo = await movePhoto(observations.photo, "report_" + reportId);
        }

        const report: Report = {
            id: reportId,
            createdAt: new Date().toISOString(),
            status: "pending",
            edits: getObservationEdits(observations),
            photo,
        };
        reports.send({ type: "ADD", report });
        navigation.navigate("ReportStatusModal", { reportId: report.id });
        setObservations(getDefaultObservationsState(classifiers, route.params?.huntEventId));
        setTimeout(() => currentPositionRef.current?.reset(), 100);
    }

    const validationErrors = getObservationsValidationErrors(observations);
    const hasValidationErrors = validationErrors.length !== 0;

    const isTypeAndSpeciesSelected =
        observations.type &&
        observations.species &&
        ((observations.species === SpeciesId.OtherMammals && observations.otherMammals) ||
            (observations.species === SpeciesId.Birds && observations.birds) ||
            (observations.species !== SpeciesId.OtherMammals && observations.species !== SpeciesId.Birds));

    return (
        <View style={styles.container}>
            <Header
                showBackButton={observations.huntEventId ? true : false}
                title={
                    observations.huntEventId
                        ? t("observations.huntObservations") + " - " + route.params?.huntVmdCode
                        : t("observations.title")
                }
            />
            <KeyboardAwareScrollView
                bottomOffset={Platform.select({ ios: 24, android: 48 })}
                ref={scrollViewRef}
                contentContainerStyle={[
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                    },
                    observations.huntEventId
                        ? {
                              paddingBottom: insets.bottom + 24,
                          }
                        : styles.body,
                ]}
            >
                <View style={styles.currentPositionContainer}>
                    <CurrentPosition
                        ref={currentPositionRef}
                        onChange={onCurrentPositionChange}
                        initialPosition={observations.position}
                    />
                </View>
                <Spacer size={24} />
                <ReadOnlyField
                    label={t("damage.position")}
                    value={observations.position ? formatPosition(observations.position) : " "}
                />
                <Spacer size={24} />
                <Input label={t("observations.notes")} value={observations.notes} onChangeText={onNotesChange} />
                {observations.huntEventId ? (
                    <>
                        <Spacer size={16} />
                        <Input
                            keyboardType="numeric"
                            label={t("hunt.drivenHunt.mastArea")}
                            value={observations.huntEventArea?.toString() ?? ""}
                            onChangeText={onMastAreaChange}
                            maxLength={String(configuration.observations.mastArea.max).length}
                        />
                    </>
                ) : null}
                <Spacer size={24} />
                <ObservationsType
                    type={observations.type}
                    onChange={onTypeChange}
                    animalsObservationsItemCount={observations.animals.length}
                />

                {observations.type && (
                    <ObservationsSpecies
                        species={observations.species}
                        onSpeciesChange={onSpeciesChange}
                        otherMammals={observations.otherMammals}
                        onOtherMammalsChange={onOtherMammalsChange}
                        birds={observations.birds}
                        onBirdsChange={onBirdsChange}
                    />
                )}

                {isTypeAndSpeciesSelected && (
                    <>
                        {observations.type === ObservationTypeId.DirectlyObservedAnimals && (
                            <Animals
                                scrollViewRef={scrollViewRef}
                                animals={observations.animals}
                                onChange={onAnimalsChange}
                            />
                        )}

                        {observations.type === ObservationTypeId.SignsOfPresence && (
                            <SignsOfPresence
                                signsOfPresence={observations.signsOfPresence}
                                onChange={onSignsOfPresenceChange}
                            />
                        )}

                        {observations.type === ObservationTypeId.Dead && (
                            <Dead deadAnimals={observations.deadAnimals} onChange={onDeadAnimalsChange} />
                        )}

                        <>
                            <Photo
                                onChange={onPhotoChange}
                                value={observations.photo}
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
                                title={t("observations.saveAndSend")}
                                disabled={hasValidationErrors}
                            />
                        </>
                    </>
                )}
            </KeyboardAwareScrollView>
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
