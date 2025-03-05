import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { CheckboxButton } from "~/components/checkbox-button";
import { CurrentPosition, CurrentPositionHandle } from "~/components/current-position/current-position";
import { DynamicPicker } from "~/components/dynamic-picker";
import { ErrorMessage } from "~/components/error-message";
import { Header } from "~/components/header";
import { Input } from "~/components/input";
import { Photo } from "~/components/photo/photo";
import { ReadOnlyField } from "~/components/read-only-field";
import { useReportsContext } from "~/components/reports-provider";
import { Select } from "~/components/select";
import { Spacer } from "~/components/spacer";
import { Switch } from "~/components/switch";
import { WarningMessage } from "~/components/warning-message";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useDistricts, useInfectedDistricts } from "~/hooks/use-districts";
import { useMemberships } from "~/hooks/use-memberships";
import { usePermissions } from "~/hooks/use-permissions";
import { useProfile } from "~/hooks/use-profile";
import { useUserStorage } from "~/machines/authentication-machine";
import { getLimitedPreyValidationErrors, getLimitedPreyValidationWarnings } from "~/screens/hunt/validation";
import { theme } from "~/theme";
import { Classifiers, HuntedTypeId } from "~/types/classifiers";
import { LimitedPreyState } from "~/types/hunt";
import { RootNavigatorParams } from "~/types/navigation";
import { Permit } from "~/types/permits";
import { PositionResult } from "~/types/position-result";
import { Report } from "~/types/report";
import { isOptionActive } from "~/utils/filter-classifiers";
import { formatLabel } from "~/utils/format-label";
import { formatPosition } from "~/utils/format-position";
import { isPositionInDistrict } from "~/utils/is-position-in-district";
import { movePhoto } from "~/utils/photo";
import { formatMemberLabel } from "../mtl/member-management/format-member-label";
import { getLimitedPreyEdits } from "./get-limited-prey-edits";
import { getLimitedPreyOptions } from "./get-limited-prey-options";

function getDefaultLimitedPreyState(
    permit: Permit,
    classifiers: Classifiers,
    huntingDistrictId: number
): LimitedPreyState {
    const permitAllowances = classifiers.permitAllowances.options.filter(
        (option) => isOptionActive(option) && option.permitTypeId === permit.permitTypeId && option.isValidForKilled
    );
    const defaultPermitAllowance =
        permitAllowances.find((option) => option.id === permit.permitAllowanceId) ??
        permitAllowances.find((option) => option.isDefault);

    if (!defaultPermitAllowance) {
        throw new Error(`Default permit allowance not found for permit ${permit.id}`);
    }
    const permitType = classifiers.permitTypes.options.find((option) => option.id === permit.permitTypeId);

    return {
        speciesId: permitType?.speciesId ?? 0,
        type: String(HuntedTypeId.Hunted),
        gender: String(defaultPermitAllowance.genderId),
        age: String(defaultPermitAllowance.ageId),
        notes: "",
        permitId: permit.id,
        observedSignsOfDisease: false,
        reportId: permit.reportId,
        reportGuid: permit.reportGuid ? permit.reportGuid : randomUUID(),
        huntingDistrictId,
        hunterCardNumber: "",
        isHunterForeigner: false,
        foreignerPermitNumber: "",
    };
}

type LimitedPreyFormProps = NativeStackScreenProps<RootNavigatorParams, "LimitedPreyScreen">;

export function LimitedPreyScreen({ navigation, route }: LimitedPreyFormProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const profile = useProfile();
    const memberships = useMemberships();
    const reports = useReportsContext();
    const permissions = usePermissions();
    const userStorage = useUserStorage();
    const infectedDistricts = useInfectedDistricts();
    const scrollViewRef = React.useRef<ScrollView>(null);
    const districts = useDistricts();

    const { permit, huntingDistrictId, activeHuntHunters } = route.params;

    const selectedDistrictName = profile.memberships.find(
        (membership) => membership.huntingDistrict.id === huntingDistrictId
    )?.huntingDistrict.descriptionLv;
    const inAfricanSwineFeverZone =
        permit.permitTypeId === 10 ? infectedDistricts.some((district) => district.id === huntingDistrictId) : false;

    const [limitedPrey, setLimitedPrey] = React.useState<LimitedPreyState>(
        () => route.params.initialState ?? getDefaultLimitedPreyState(permit, classifiers, huntingDistrictId)
    );

    React.useEffect(() => {
        if (route.params?.initialState) {
            scrollViewRef.current?.scrollToEnd({
                animated: false,
            });
        }
    }, [route.params?.initialState]);

    function onTypeChange(type: string) {
        setLimitedPrey((limitedPrey) => {
            const { typeId, genderId, ageId } = getLimitedPreyOptions(
                permit,
                classifiers,
                type,
                limitedPrey.gender,
                limitedPrey.age
            );
            const newValue: LimitedPreyState = {
                ...limitedPrey,
                type: String(typeId),
                gender: String(genderId),
                age: String(ageId),
            };
            return newValue;
        });
    }

    function onGenderChange(gender: string) {
        setLimitedPrey((limitedPrey) => {
            const { typeId, genderId, ageId } = getLimitedPreyOptions(
                permit,
                classifiers,
                limitedPrey.type,
                gender,
                limitedPrey.age
            );
            const newValue: LimitedPreyState = {
                ...limitedPrey,
                type: String(typeId),
                gender: String(genderId),
                age: String(ageId),
            };
            return newValue;
        });
    }

    function onCurrentPositionChange(position: PositionResult | undefined) {
        setLimitedPrey((limitedPrey) => ({ ...limitedPrey, position }));
    }

    function onAgeChange(age: string) {
        setLimitedPrey((limitedPrey) => ({ ...limitedPrey, age }));
    }

    function onNotesChange(notes: string) {
        setLimitedPrey((limitedPrey) => ({ ...limitedPrey, notes }));
    }

    function onPhotoChange(value: string | undefined) {
        setLimitedPrey((limitedPrey) => ({ ...limitedPrey, photo: value }));
    }

    function onPhotoSelectOpen() {
        userStorage.setFormState({
            timestamp: Date.now(),
            type: "limited-prey",
            state: limitedPrey,
            params: route.params,
        });
    }

    function onPhotoSelectClose() {
        userStorage.deleteFormState();
    }

    function onObservedSignsOfDiseaseToggle() {
        setLimitedPrey((limitedPrey) => ({
            ...limitedPrey,
            observedSignsOfDisease: !limitedPrey.observedSignsOfDisease,
        }));
    }

    function onHunterCardNumberChange(hunterCardNumber: string) {
        setLimitedPrey((limitedPrey) => ({ ...limitedPrey, hunterCardNumber }));
    }

    function onIsHunterForeignerToggle() {
        setLimitedPrey((limitedPrey) => {
            if (limitedPrey.isHunterForeigner) {
                return { ...limitedPrey, isHunterForeigner: false };
            }
            return { ...limitedPrey, isHunterForeigner: true, hunterCardNumber: "" };
        });
    }

    function onForeignerPermitNumberChange(foreignerPermitNumber: string) {
        setLimitedPrey((limitedPrey) => ({ ...limitedPrey, foreignerPermitNumber }));
    }

    const { types, genders, ages } = getLimitedPreyOptions(
        permit,
        classifiers,
        limitedPrey.type,
        limitedPrey.gender,
        limitedPrey.age
    );

    const typeOptions = types.map((type) => ({
        value: String(type.id),
        label: formatLabel(type.description),
    }));
    const genderOptions = genders.map((gender) => ({
        value: String(gender.id),
        label: formatLabel(gender.description),
    }));
    const ageOptions = ages.map((age) => ({
        value: String(age.id),
        label: formatLabel(age.description),
    }));

    const insets = useSafeAreaInsets();
    const currentPositionRef = React.useRef<CurrentPositionHandle>(null);
    const toggleCheckbox = limitedPrey.observedSignsOfDisease ? "checked" : "unchecked";

    async function onSaveButtonPress() {
        const reportId = randomUUID();

        let photo: string | undefined;
        if (limitedPrey.photo) {
            photo = await movePhoto(limitedPrey.photo, "report_" + reportId);
        }

        const report: Report = {
            id: reportId,
            createdAt: new Date().toISOString(),
            status: "pending",
            edits: getLimitedPreyEdits(limitedPrey),
            photo,
        };
        if (inAfricanSwineFeverZone) {
            report.inAfricanSwineFeverZone = true;
        }
        reports.send({ type: "ADD", report });
        navigation.popToTop();
        navigation.navigate("ReportStatusModal", { reportId: report.id });
    }

    const validationErrors = getLimitedPreyValidationErrors(limitedPrey);
    const hasValidationErrors = validationErrors.length !== 0;
    const permitType = classifiers.permitTypes.options.find((option) => option.id === permit.permitTypeId);

    const outOfDistrictWarning = useMemo(
        () =>
            limitedPrey.position
                ? !isPositionInDistrict(limitedPrey.position, limitedPrey.huntingDistrictId, districts)
                : false,
        [limitedPrey.position, limitedPrey.huntingDistrictId, districts]
    );

    const validationWarnings = getLimitedPreyValidationWarnings(
        inAfricanSwineFeverZone,
        outOfDistrictWarning,
        limitedPrey,
        permitType?.id,
        permit
    );
    const hasValidationWarnings = validationWarnings.length !== 0;
    const hunterOptions = activeHuntHunters
        ? activeHuntHunters.map((hunter) => {
              const [firstName, lastName] = hunter.fullName.split(" ");
              return {
                  value: hunter.huntersCardNumber ?? "",
                  label: formatMemberLabel(hunter.huntersCardNumber, firstName, lastName),
              };
          })
        : memberships
              .find((membership) => membership.id === huntingDistrictId)
              ?.members.filter((member) => member.cardNumber !== profile.validHuntersCardNumber)
              .map((member) => {
                  const label = formatMemberLabel(member.cardNumber, member.firstName, member.lastName);
                  return {
                      value: member.cardNumber ?? "",
                      label,
                  };
              }) ?? [];

    return (
        <View style={styles.container}>
            <Header title={formatLabel(permitType?.description)} />
            <ScrollView
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
                        initialPosition={limitedPrey.position}
                    />
                </View>
                <Spacer size={24} />
                <ReadOnlyField
                    label={t("damage.position")}
                    value={limitedPrey.position ? formatPosition(limitedPrey.position) : ""}
                />
                <Spacer size={24} />
                <ReadOnlyField label={t("mtl.district")} value={selectedDistrictName ?? ""} />

                <Spacer size={24} />
                <ReadOnlyField label={t("hunt.huntingLicenseNumber")} value={profile.validHuntersCardNumber ?? ""} />

                {permissions.createDistrictHuntReportsForOtherHunter ? (
                    <>
                        <Spacer size={limitedPrey.isHunterForeigner ? 12 : 0} />
                        {!limitedPrey.isHunterForeigner ? (
                            <>
                                <Spacer size={24} />
                                <Select
                                    clearable
                                    label={t("hunt.changeHunterCardNumber")}
                                    value={limitedPrey.hunterCardNumber}
                                    onChange={onHunterCardNumberChange}
                                    options={hunterOptions}
                                />
                                <Spacer size={12} />
                            </>
                        ) : null}
                        <Switch
                            label={t("hunt.hunterForeigner")}
                            checked={limitedPrey.isHunterForeigner}
                            onPress={onIsHunterForeignerToggle}
                        />
                        <Spacer size={12} />
                        {limitedPrey.isHunterForeigner && (
                            <>
                                <Input
                                    label={t("hunt.enterHunterCardNumber")}
                                    value={limitedPrey.foreignerPermitNumber}
                                    onChangeText={onForeignerPermitNumberChange}
                                />
                                <Spacer size={24} />
                            </>
                        )}
                    </>
                ) : (
                    <Spacer size={24} />
                )}
                <DynamicPicker
                    label={t("hunt.type")}
                    options={typeOptions}
                    value={limitedPrey.type}
                    onChange={onTypeChange}
                />
                <Spacer size={24} />
                {limitedPrey.type && (
                    <DynamicPicker
                        label={t("hunt.gender")}
                        options={genderOptions}
                        value={limitedPrey.gender}
                        onChange={onGenderChange}
                    />
                )}
                <Spacer size={24} />
                {limitedPrey.gender && (
                    <DynamicPicker
                        label={t("hunt.age")}
                        options={ageOptions}
                        onChange={onAgeChange}
                        value={limitedPrey.age}
                    />
                )}
                <Spacer size={24} />
                <Input label={t("hunt.notes")} value={limitedPrey.notes} onChangeText={onNotesChange} />
                <Spacer size={24} />
                <Photo
                    onChange={onPhotoChange}
                    value={limitedPrey.photo}
                    mode="camera"
                    onPhotoSelectOpen={onPhotoSelectOpen}
                    onPhotoSelectClose={onPhotoSelectClose}
                />
                <Spacer size={12} />
                <CheckboxButton
                    state={toggleCheckbox}
                    label={t("hunt.observedSignsOfDisease")}
                    onPress={onObservedSignsOfDiseaseToggle}
                />

                {hasValidationWarnings ? (
                    <>
                        <Spacer size={12} />
                        <View style={styles.validationMessages}>
                            {validationWarnings.map((warning, index) => (
                                <WarningMessage text={warning} key={`${warning}-${index}`} />
                            ))}
                        </View>
                    </>
                ) : null}

                {hasValidationErrors ? (
                    <>
                        <Spacer size={hasValidationWarnings ? 19 : 12} />
                        <View style={styles.validationMessages}>
                            {validationErrors.map((error, index) => (
                                <ErrorMessage text={error} key={`${error}-${index}`} />
                            ))}
                        </View>
                    </>
                ) : null}
                <Spacer size={inAfricanSwineFeverZone || outOfDistrictWarning || hasValidationErrors ? 24 : 12} />
                <Button onPress={onSaveButtonPress} disabled={hasValidationErrors} title={t("hunt.submit")} />
            </ScrollView>
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
    validationMessages: {
        gap: 19,
    },
});
