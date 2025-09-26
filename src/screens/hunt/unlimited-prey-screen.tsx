import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Crypto from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { CheckboxButton } from "~/components/checkbox-button";
import { CurrentPosition, CurrentPositionHandle } from "~/components/current-position/current-position";
import { ErrorMessage } from "~/components/error-message";
import { Header } from "~/components/header";
import { Input } from "~/components/input";
import { Photo } from "~/components/photo/photo";
import { ReadOnlyField } from "~/components/read-only-field";
import { useReportsContext } from "~/components/reports-provider";
import { Select } from "~/components/select";
import { Spacer } from "~/components/spacer";
import { Stepper } from "~/components/stepper";
import { configuration } from "~/configuration";
import { useSpeciesContext } from "~/hooks/use-species";
import { useUserStorage } from "~/machines/authentication-machine";
import { getUnlimitedPreyValidationErrors } from "~/screens/hunt/validation";
import { theme } from "~/theme";
import { UnlimitedPreyState } from "~/types/hunt";
import { RootNavigatorParams } from "~/types/navigation";
import { PositionResult } from "~/types/position-result";
import { Report } from "~/types/report";
import { formatLabel } from "~/utils/format-label";
import { formatPosition } from "~/utils/format-position";
import { movePhoto } from "~/utils/photo";
import { getUnlimitedPreyEdits } from "./get-unlimited-prey-edits";

type UnlimitedPreyScreenProps = NativeStackScreenProps<RootNavigatorParams, "UnlimitedPreyScreen">;

export function UnlimitedPreyScreen({ navigation, route }: UnlimitedPreyScreenProps) {
    const { t } = useTranslation();
    const reports = useReportsContext();
    const userStorage = useUserStorage();
    const scrollViewRef = React.useRef<React.ComponentRef<typeof KeyboardAwareScrollView>>(null);

    const [unlimitedPrey, setUnlimitedPrey] = React.useState<UnlimitedPreyState>(() => {
        if (route.params.initialState) {
            return route.params.initialState;
        }

        return {
            position: undefined,
            species: route.params.speciesId,
            subspecies: "",
            count: configuration.hunt.count.defaultValue,
            notes: "",
            observedSignsOfDisease: false,
            reportGuid: Crypto.randomUUID(),
        };
    });

    React.useEffect(() => {
        if (route.params?.initialState) {
            scrollViewRef.current?.scrollToEnd({
                animated: false,
            });
        }
    }, [route.params?.initialState]);

    const speciesContext = useSpeciesContext();

    const speciesClassifier = speciesContext.unlimitedSpecies.find(
        (species) => String(species.id) === unlimitedPrey.species
    );

    const currentPositionRef = React.useRef<CurrentPositionHandle>(null);

    function onCurrentPositionChange(position: PositionResult | undefined) {
        setUnlimitedPrey((prev) => ({ ...prev, position }));
    }

    function onSpeciesChange(species: string) {
        setUnlimitedPrey((unlimitedPrey) => ({ ...unlimitedPrey, subspecies: species }));
    }

    function onCountChange(count: number) {
        setUnlimitedPrey((unlimitedPrey) => ({ ...unlimitedPrey, count }));
    }

    function onNotesChange(notes: string) {
        setUnlimitedPrey((unlimitedPrey) => ({ ...unlimitedPrey, notes }));
    }

    function onPhotoChange(value: string | undefined) {
        setUnlimitedPrey((unlimitedPrey) => ({
            ...unlimitedPrey,
            photo: value,
        }));
    }

    function onPhotoSelectOpen() {
        userStorage.setFormState({
            timestamp: Date.now(),
            type: "unlimited-prey",
            state: unlimitedPrey,
            params: route.params,
        });
    }

    function onPhotoSelectClose() {
        userStorage.deleteFormState();
    }

    function onObservedSignsOfDiseaseChangeToggle() {
        setUnlimitedPrey((unlimitedPrey) => ({
            ...unlimitedPrey,
            observedSignsOfDisease: !unlimitedPrey.observedSignsOfDisease,
        }));
    }

    async function onSaveButtonPress() {
        const reportId = Crypto.randomUUID();

        let photo: string | undefined;
        if (unlimitedPrey.photo) {
            photo = await movePhoto(unlimitedPrey.photo, "report_" + reportId);
        }

        const report: Report = {
            id: reportId,
            createdAt: new Date().toISOString(),
            status: "pending",
            edits: getUnlimitedPreyEdits(unlimitedPrey),
            photo,
        };
        reports.send({ type: "ADD", report });
        navigation.popToTop();
        navigation.navigate("ReportStatusModal", { reportId: report.id });
    }

    const insets = useSafeAreaInsets();
    const validationErrors = getUnlimitedPreyValidationErrors(unlimitedPrey, speciesClassifier);
    const hasValidationErrors = validationErrors.length !== 0;
    const toggleCheckbox = unlimitedPrey.observedSignsOfDisease ? "checked" : "unchecked";

    return (
        <View style={styles.container}>
            <Header title={formatLabel(speciesClassifier?.description)} />
            <KeyboardAwareScrollView
                bottomOffset={Platform.select({ ios: 24, android: 48 })}
                ref={scrollViewRef}
                contentContainerStyle={{
                    paddingLeft: insets.left + 16,
                    paddingRight: insets.right + 16,
                    paddingBottom: insets.bottom + 24,
                }}
            >
                <View style={styles.currentPositionContainer}>
                    <CurrentPosition
                        ref={currentPositionRef}
                        onChange={onCurrentPositionChange}
                        initialPosition={unlimitedPrey.position}
                    />
                </View>
                <Spacer size={24} />
                <ReadOnlyField
                    label={t("damage.position")}
                    value={unlimitedPrey.position ? formatPosition(unlimitedPrey.position) : ""}
                />
                {speciesClassifier?.subspecies && (
                    <>
                        <Spacer size={24} />
                        <Select
                            label={t("hunt.species")}
                            options={speciesClassifier.subspecies.map((subspecies) => ({
                                label: subspecies.label,
                                value: subspecies.value,
                            }))}
                            value={unlimitedPrey.subspecies}
                            onChange={onSpeciesChange}
                        />
                    </>
                )}

                <Spacer size={24} />
                <Stepper
                    label={t("hunt.count")}
                    value={unlimitedPrey.count}
                    onChange={onCountChange}
                    minValue={configuration.hunt.count.min}
                    maxValue={configuration.hunt.count.max}
                />
                <Spacer size={24} />
                <Input label={t("hunt.notes")} value={unlimitedPrey.notes} onChangeText={onNotesChange} />
                <Spacer size={24} />
                <Photo
                    onChange={onPhotoChange}
                    value={unlimitedPrey.photo}
                    mode="camera"
                    onPhotoSelectOpen={onPhotoSelectOpen}
                    onPhotoSelectClose={onPhotoSelectClose}
                />
                <Spacer size={12} />
                <CheckboxButton
                    state={toggleCheckbox}
                    label={t("hunt.observedSignsOfDisease")}
                    onPress={onObservedSignsOfDiseaseChangeToggle}
                />
                {hasValidationErrors ? (
                    <>
                        <Spacer size={12} />
                        <View style={styles.validationErrorMessages}>
                            {validationErrors.map((error, index) => (
                                <ErrorMessage text={error} key={`${error}-${index}`} />
                            ))}
                        </View>
                    </>
                ) : null}
                <Spacer size={hasValidationErrors ? 24 : 12} />
                <Button onPress={onSaveButtonPress} title={t("hunt.submit")} disabled={hasValidationErrors} />
            </KeyboardAwareScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    currentPositionContainer: {
        marginHorizontal: -16,
    },
    validationErrorMessages: {
        gap: 19,
    },
});
