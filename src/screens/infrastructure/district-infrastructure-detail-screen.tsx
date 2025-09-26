import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { useConfirmationDialog } from "~/components/confirmation-dialog-provider";
import { Header } from "~/components/header";
import { useCreateInfrastructureChange } from "~/components/infrastructure-provider";
import { NavigationButtonField } from "~/components/navigation-button-field";
import { ReadOnlyField } from "~/components/read-only-field";
import { usePermissions } from "~/hooks/use-permissions";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { formatDateTime } from "~/utils/format-date-time";
import { formatPosition } from "~/utils/format-position";
import { isEditedInfrastructureNewer } from "~/utils/is-edited-infrastructure-newer";
import { InfrastructurePlace } from "./infrastructure-place";

type DistrictInfrastructureDetailScreenProps = NativeStackScreenProps<
    RootNavigatorParams,
    "DistrictInfrastructureDetailScreen"
>;

export function DistrictInfrastructureDetailScreen(props: DistrictInfrastructureDetailScreenProps) {
    const { detail, title } = props.route.params;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const permissions = usePermissions();
    const { confirm } = useConfirmationDialog();
    const hasPermissionToManageInfrastructure = permissions.manageInfrastructure();
    const locationLabel = `${title} ${t("mtl.infrastructure.location")}`;
    const createInfrastructureChange = useCreateInfrastructureChange();

    async function onDeleteButtonPress() {
        const confirmed = await confirm({
            title: t("mtl.infrastructure.delete.confirming", { infrastructureTitle: title }),
            confirmButtonTitle: t("general.delete"),
            confirmButtonVariant: "danger",
            rejectButtonTitle: t("general.cancel"),
        });
        if (confirmed) {
            createInfrastructureChange("delete", detail);
            navigation.goBack();
        }
    }

    return (
        <View style={styles.container}>
            <Header
                title={title}
                showEditButton={hasPermissionToManageInfrastructure}
                onEditButtonPress={() => {
                    navigation.navigate("DistrictInfrastructureFormScreen", {
                        infrastructureToEdit: detail,
                        currentDistrictId: detail.huntingDistrictId,
                    });
                }}
            />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <View style={styles.detailContentContainer}>
                    <InfrastructurePlace latitude={detail.locationY} longitude={detail.locationX} />
                    <NavigationButtonField
                        label={t("mtl.infrastructure.coordinates")}
                        value={formatPosition({
                            latitude: detail.locationY,
                            longitude: detail.locationX,
                        })}
                        latitude={detail.locationY}
                        longitude={detail.locationX}
                        locationLabel={locationLabel}
                    />
                    <ReadOnlyField
                        label={t("mtl.infrastructure.timeAdded")}
                        value={formatDateTime(detail.createdOnDevice)}
                    />
                    {isEditedInfrastructureNewer(detail.createdOnDevice, detail.changedOnDevice) ? (
                        <ReadOnlyField
                            label={t("mtl.infrastructure.timeEdited")}
                            value={formatDateTime(detail.changedOnDevice)}
                        />
                    ) : null}
                    <ReadOnlyField label={t("mtl.infrastructure.type")} value={title} />
                    {detail.notes ? <ReadOnlyField label={t("mtl.infrastructure.notes")} value={detail.notes} /> : null}
                </View>
                {hasPermissionToManageInfrastructure ? (
                    <Button onPress={onDeleteButtonPress} variant="danger" title={t("general.delete")} />
                ) : null}
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
        flexGrow: 1,
        paddingTop: 24,
    },
    detailContentContainer: {
        flex: 1,
        gap: 24,
    },
});
