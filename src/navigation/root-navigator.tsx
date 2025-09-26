import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { QRPreviewModal } from "~/components/qr-code/qr-preview-modal";
import { usePermissions } from "~/hooks/use-permissions";
import { usePushNotifications } from "~/hooks/use-push-notifications";
import { ComponentExamplesNavigator } from "~/navigation/examples-navigator";
import { TabsNavigator } from "~/navigation/tabs-navigator";
import { AboutScreen } from "~/screens/about-screen";
import { DistrictDamagesDetailScreen } from "~/screens/damage/district-damage/district-damages-detail-screen";
import { DistrictDamagesListScreen } from "~/screens/damage/district-damage/district-damages-list-screen";
import { EditProfileScreen } from "~/screens/edit-profile-screen";
import { DrivenHuntDetailScreen } from "~/screens/hunt/driven-hunt/driven-hunt-detail-screen";
import { DrivenHuntFormScreen } from "~/screens/hunt/driven-hunt/driven-hunt-form-screen";
import { DrivenHuntListScreen } from "~/screens/hunt/driven-hunt/driven-hunt-list-screen";
import { DrivenHuntReducedDetailScreen } from "~/screens/hunt/driven-hunt/driven-hunt-reduced-detail-screen";
import { JoinDrivenHuntUsingLink } from "~/screens/hunt/driven-hunt/join-driven-hunt/join-driven-hunt-using-link";
import { HuntActivitiesListScreen } from "~/screens/hunt/hunt-activities-list-screen";
import { IndividualHuntDetailScreen } from "~/screens/hunt/individual-hunt/individual-hunt-detail-screen";
import { IndividualHuntFormScreen } from "~/screens/hunt/individual-hunt/individual-hunt-form-screen";
import { IndividualHuntListScreen } from "~/screens/hunt/individual-hunt/individual-hunt-list-screen";
import { LimitedPreyScreen } from "~/screens/hunt/limited-prey-screen";
import { LimitedPreySubspeciesScreen } from "~/screens/hunt/limited-prey-subspecies-screen";
import { RegisterPreyScreen } from "~/screens/hunt/register-prey-screen";
import { UnlimitedPreyScreen } from "~/screens/hunt/unlimited-prey-screen";
import { DistrictInfrastructureChangesListScreen } from "~/screens/infrastructure/district-infrastructure-changes-list-screen";
import { DistrictInfrastructureDetailScreen } from "~/screens/infrastructure/district-infrastructure-detail-screen";
import { DistrictInfrastructureFormScreen } from "~/screens/infrastructure/district-infrastructure-form-screen";
import { DistrictInfrastructureListScreen } from "~/screens/infrastructure/district-infrastructure-list-screen";
import { LicenseDetailScreen } from "~/screens/license-detail-screen";
import { LicenseListScreen } from "~/screens/license-list-screen";
import { MapSettingsModal } from "~/screens/map/map-settings-modal";
import { MenuScreen } from "~/screens/menu/menu-screen";
import { MyStatisticsScreen } from "~/screens/menu/my-statistics.screen";
import { MemberDeletionModal } from "~/screens/mtl/member-management/member-deletion-modal";
import { MemberManagementScreen } from "~/screens/mtl/member-management/member-management-screen";
import { MemberRegistrationScreen } from "~/screens/mtl/member-management/member-registration-screen";
import { MemberRolesScreen } from "~/screens/mtl/member-management/member-roles-screen";
import { PermitDistributionScreen } from "~/screens/mtl/permits/permit-distribution-screen";
import { PermitsScreen } from "~/screens/mtl/permits/permits-screen";
import { NewsScreen } from "~/screens/news-screen";
import { ObservationsScreen } from "~/screens/observation/observations-screen";
import { ProfileScreen } from "~/screens/profile-screen";
import { ReportStatusModal } from "~/screens/report-status-modal";
import { ReportDetailScreen } from "~/screens/reports/report-detail-screen";
import { ReportListScreen } from "~/screens/reports/report-list-screen";
import { SettingsScreen } from "~/screens/settings/settings-screen";
import { DrivenHuntListStatisticsScreen } from "~/screens/statistics/driven-hunts/driven-hunt-list-statistics-screen";
import { DrivenHuntStatisticsDetailScreen } from "~/screens/statistics/driven-hunts/driven-hunt-statistics-detail-screen";
import { DrivenHuntStatisticsScreen } from "~/screens/statistics/driven-hunts/driven-hunt-statistics-screen";
import { IndividualHuntListStatisticsScreen } from "~/screens/statistics/individual-hunts/individual-hunt-list-statistics-screen";
import { IndividualHuntStatisticsDetailScreen } from "~/screens/statistics/individual-hunts/individual-hunt-statistics-detail-screen";
import { IndividualHuntStatisticsScreen } from "~/screens/statistics/individual-hunts/individual-hunt-statistics-screen";
import { SpeciesStatisticsDetailScreen } from "~/screens/statistics/species/species-statistics-detail-screen";
import { SpeciesStatisticsListScreen } from "~/screens/statistics/species/species-statistics-list-screen";
import { SpeciesStatisticsScreen } from "~/screens/statistics/species/species-statistics-screen";
import { RootNavigatorParams } from "~/types/navigation";

const RootStack = createNativeStackNavigator<RootNavigatorParams>();

export function RootNavigator() {
    usePushNotifications();
    const permissions = usePermissions();
    return (
        <>
            <JoinDrivenHuntUsingLink />
            <RootStack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
                <RootStack.Screen name="TabsNavigator" component={TabsNavigator} />
                <RootStack.Screen name="AboutScreen" component={AboutScreen} />
                <RootStack.Screen name="LicenseListScreen" component={LicenseListScreen} />
                <RootStack.Screen name="LicenseDetailScreen" component={LicenseDetailScreen} />
                <RootStack.Screen name="ComponentExamplesNavigator" component={ComponentExamplesNavigator} />
                <RootStack.Screen name="MenuScreen" component={MenuScreen} />
                <RootStack.Screen name="MyStatisticsScreen" component={MyStatisticsScreen} />
                <RootStack.Screen name="NewsScreen" component={NewsScreen} />
                <RootStack.Screen name="SettingsScreen" component={SettingsScreen} />
                <RootStack.Screen name="DrivenHuntStatisticsScreen" component={DrivenHuntStatisticsScreen} />
                <RootStack.Screen name="DrivenHuntListStatisticsScreen" component={DrivenHuntListStatisticsScreen} />
                <RootStack.Screen
                    name="DrivenHuntStatisticsDetailScreen"
                    component={DrivenHuntStatisticsDetailScreen}
                />
                <RootStack.Screen name="IndividualHuntStatisticsScreen" component={IndividualHuntStatisticsScreen} />
                <RootStack.Screen
                    name="IndividualHuntStatisticsDetailScreen"
                    component={IndividualHuntStatisticsDetailScreen}
                />
                <RootStack.Screen
                    name="IndividualHuntListStatisticsScreen"
                    component={IndividualHuntListStatisticsScreen}
                />
                <RootStack.Screen name="SpeciesStatisticsDetailScreen" component={SpeciesStatisticsDetailScreen} />
                <RootStack.Screen name="SpeciesStatisticsScreen" component={SpeciesStatisticsScreen} />
                <RootStack.Screen name="SpeciesStatisticsListScreen" component={SpeciesStatisticsListScreen} />
                <RootStack.Screen name="ProfileScreen" component={ProfileScreen} />
                <RootStack.Screen name="EditProfileScreen" component={EditProfileScreen} />
                <RootStack.Screen name="ReportListScreen" component={ReportListScreen} />
                <RootStack.Screen name="ReportDetailScreen" component={ReportDetailScreen} />
                <RootStack.Screen
                    name="ReportStatusModal"
                    component={ReportStatusModal}
                    options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
                />
                <RootStack.Screen
                    name="QRPreviewModal"
                    component={QRPreviewModal}
                    options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
                />
                {permissions.viewMemberManagement ? (
                    <>
                        <RootStack.Screen name="MemberRegistrationScreen" component={MemberRegistrationScreen} />
                        <RootStack.Screen name="MemberRolesScreen" component={MemberRolesScreen} />
                        <RootStack.Screen
                            name="MemberDeletionModal"
                            component={MemberDeletionModal}
                            options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
                        />
                    </>
                ) : null}
                <RootStack.Screen name="ObservationsScreenRoot" component={ObservationsScreen} />
                <RootStack.Screen
                    name="MapSettingsModal"
                    component={MapSettingsModal}
                    options={{ presentation: "modal" }}
                />
                {permissions.viewHunt ? (
                    <>
                        <RootStack.Screen name="RegisterPreyScreen" component={RegisterPreyScreen} />
                        <RootStack.Screen name="UnlimitedPreyScreen" component={UnlimitedPreyScreen} />
                        <RootStack.Screen name="DrivenHuntListScreen" component={DrivenHuntListScreen} />
                        <RootStack.Screen name="DrivenHuntFormScreen" component={DrivenHuntFormScreen} />
                        <RootStack.Screen name="DrivenHuntDetailScreen" component={DrivenHuntDetailScreen} />
                        <RootStack.Screen
                            name="DrivenHuntReducedDetailScreen"
                            component={DrivenHuntReducedDetailScreen}
                        />
                        <RootStack.Screen name="IndividualHuntDetailScreen" component={IndividualHuntDetailScreen} />
                        <RootStack.Screen name="IndividualHuntFormScreen" component={IndividualHuntFormScreen} />
                        <RootStack.Screen name="IndividualHuntListScreen" component={IndividualHuntListScreen} />
                        <RootStack.Screen name="HuntActivitiesListScreen" component={HuntActivitiesListScreen} />

                        {permissions.createDistrictHuntReports ? (
                            <>
                                <RootStack.Screen
                                    name="LimitedPreySubspeciesScreen"
                                    component={LimitedPreySubspeciesScreen}
                                />
                                <RootStack.Screen name="LimitedPreyScreen" component={LimitedPreyScreen} />
                            </>
                        ) : null}
                    </>
                ) : null}
                {permissions.viewMtl ? (
                    <>
                        <RootStack.Screen name="PermitsScreen" component={PermitsScreen} />
                        <RootStack.Screen name="PermitDistributionScreen" component={PermitDistributionScreen} />
                        <RootStack.Screen
                            name="DistrictInfrastructureChangesListScreen"
                            component={DistrictInfrastructureChangesListScreen}
                        />
                        <RootStack.Screen
                            name="DistrictInfrastructureDetailScreen"
                            component={DistrictInfrastructureDetailScreen}
                        />
                        <RootStack.Screen
                            name="DistrictInfrastructureFormScreen"
                            component={DistrictInfrastructureFormScreen}
                        />
                        <RootStack.Screen
                            name="DistrictInfrastructureListScreen"
                            component={DistrictInfrastructureListScreen}
                        />
                        {permissions.viewDistrictDamages ? (
                            <>
                                <RootStack.Screen
                                    name="DistrictDamagesListScreen"
                                    component={DistrictDamagesListScreen}
                                />
                                <RootStack.Screen
                                    name="DistrictDamagesDetailScreen"
                                    component={DistrictDamagesDetailScreen}
                                />
                            </>
                        ) : null}
                        {permissions.viewMemberManagement ? (
                            <RootStack.Screen name="MemberManagementScreen" component={MemberManagementScreen} />
                        ) : null}
                    </>
                ) : null}
            </RootStack.Navigator>
        </>
    );
}
