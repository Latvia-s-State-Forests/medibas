import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { ErrorMessage } from "~/components/error-message";
import { FieldLabel } from "~/components/field-label";
import { Header } from "~/components/header";
import { useCreateInfrastructureChange } from "~/components/infrastructure-provider";
import { Input } from "~/components/input";
import { PositionSelect } from "~/components/map/position-select";
import { ReadOnlyField } from "~/components/read-only-field";
import { ScrollableSelectionFields } from "~/components/scrollable-selection-fields";
import { Select } from "~/components/select";
import { Spacer } from "~/components/spacer";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { getAppLanguage } from "~/i18n";
import { theme } from "~/theme";
import { HuntingInfrastructureTypeId } from "~/types/classifiers";
import { Infrastructure } from "~/types/infrastructure";
import { RootNavigatorParams } from "~/types/navigation";
import { formatLabel } from "~/utils/format-label";
import { formatPosition } from "~/utils/format-position";
import { getSubmitInfrastructureValidationErrors } from "./validation";

type DistrictInfrastructureFormScreenProps = NativeStackScreenProps<
    RootNavigatorParams,
    "DistrictInfrastructureFormScreen"
>;

export function DistrictInfrastructureFormScreen({ route, navigation }: DistrictInfrastructureFormScreenProps) {
    const { infrastructureToEdit, currentDistrictId } = route.params ?? {};
    const { t } = useTranslation();
    const profile = useProfile();
    const classifiers = useClassifiers();
    const insets = useSafeAreaInsets();
    const createInfrastructureChange = useCreateInfrastructureChange();

    const huntingInfrastructure = classifiers.huntingInfrastructureTypes.options.sort((a, b) => {
        const aOrder = a.listOrder ?? Infinity;
        const bOrder = b.listOrder ?? Infinity;
        return aOrder - bOrder;
    });

    const alreadySelectedPosition =
        infrastructureToEdit &&
        infrastructureToEdit.locationX !== undefined &&
        infrastructureToEdit.locationY !== undefined &&
        ([infrastructureToEdit.locationX, infrastructureToEdit.locationY] as GeoJSON.Position);

    const [selectedPosition, setSelectedPosition] = React.useState(alreadySelectedPosition || [0, 0]);

    function onSelectPosition(position: GeoJSON.Position) {
        setSelectedPosition(position);
    }

    const alreadySelectedType = infrastructureToEdit ? infrastructureToEdit.typeId : "";

    const [infrastructureType, setInfrastructureType] = React.useState(String(alreadySelectedType));

    const districts = React.useMemo(() => {
        return profile.memberships
            .filter((membership) => membership.isAdministrator || membership.isTrustee)
            .map((membership) => ({
                value: membership.huntingDistrict.id,
                label: membership.huntingDistrict.descriptionLv,
            }));
    }, [profile.memberships]);

    const [district, setDistrict] = React.useState<number>(currentDistrictId);

    function onDistrictChange(value: number) {
        setDistrict(value);
    }

    const [notes, setNotes] = React.useState<string>(infrastructureToEdit?.notes ?? "");

    function onSubmit() {
        const currentDate = new Date().toISOString();
        const typeId = Number(infrastructureType);
        const infrastructure: Infrastructure = {
            id: infrastructureToEdit ? infrastructureToEdit.id : -1,
            guid: infrastructureToEdit ? infrastructureToEdit.guid : randomUUID(),
            huntingDistrictId: district,
            locationX: selectedPosition[0],
            locationY: selectedPosition[1],
            typeId,
            notes,
            changedOnDevice: currentDate,
            createdOnDevice: infrastructureToEdit ? infrastructureToEdit.createdOnDevice : currentDate,
        };
        const change = createInfrastructureChange(infrastructureToEdit ? "update" : "create", infrastructure);
        if (infrastructureToEdit) {
            navigation.goBack();
        }
        const language = getAppLanguage();
        const title =
            classifiers.huntingInfrastructureTypes.options.find(({ id }) => id === typeId)?.description[language] ?? "";
        navigation.replace("DistrictInfrastructureDetailScreen", { detail: change.infrastructure, title });
    }

    const validationErrors = getSubmitInfrastructureValidationErrors(
        { x: selectedPosition[0], y: selectedPosition[1] },
        Number(infrastructureType),
        district
    );

    const hasValidationErrors = validationErrors.length !== 0;

    return (
        <View style={styles.container}>
            <Header title={infrastructureToEdit ? t("mtl.infrastructure.edit") : t("mtl.infrastructure.add")} />
            <KeyboardAwareScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
                bottomOffset={Platform.select({ ios: 24, android: 48 })}
            >
                <View style={styles.formContentContainer}>
                    <FieldLabel label={t("mtl.infrastructure.location")} />
                    <Spacer size={16} />
                    <View style={styles.map}>
                        <PositionSelect
                            positionType="infrastructure"
                            onMark={onSelectPosition}
                            position={selectedPosition}
                            activeDistrictIds={[district]}
                        />
                    </View>
                    {selectedPosition[0] !== 0 || selectedPosition[1] !== 0 ? (
                        <>
                            <Spacer size={16} />
                            <ReadOnlyField
                                label={t("mtl.infrastructure.coordinates")}
                                value={formatPosition({
                                    latitude: selectedPosition[1],
                                    longitude: selectedPosition[0],
                                })}
                            />
                        </>
                    ) : null}
                    <Spacer size={16} />
                    <ScrollableSelectionFields
                        label={t("mtl.infrastructure.type")}
                        options={huntingInfrastructure.map((classifier) => ({
                            label: formatLabel(classifier.description),
                            value: String(classifier.id),
                            iconName:
                                configuration.huntingInfrastructure.typeIcons[
                                    classifier.id as HuntingInfrastructureTypeId
                                ] ?? "cross",
                        }))}
                        value={infrastructureType}
                        onChange={setInfrastructureType}
                    />
                    <Spacer size={8} />
                    <Select
                        options={districts}
                        label={t("mtl.infrastructure.district")}
                        onChange={onDistrictChange}
                        value={district}
                    />
                    <Spacer size={16} />
                    <Input label={t("mtl.infrastructure.notes")} value={notes} onChangeText={setNotes} />
                    <Spacer size={16} />
                </View>
                {hasValidationErrors ? (
                    <>
                        <View style={styles.validationErrorMessages}>
                            {validationErrors.map((error, index) => (
                                <ErrorMessage text={error} key={`${error}-${index}`} />
                            ))}
                        </View>
                        <Spacer size={24} />
                    </>
                ) : null}
                <Button disabled={hasValidationErrors} onPress={onSubmit} title={t("general.saveAndSend")} />
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
        flexGrow: 1,
        paddingTop: 24,
    },
    formContentContainer: {
        flex: 1,
    },
    map: {
        backgroundColor: theme.color.gray3,
        borderRadius: 8,
        overflow: "hidden",
    },
    validationErrorMessages: {
        gap: 19,
    },
});
