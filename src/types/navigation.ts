import { NavigatorScreenParams } from "@react-navigation/native";
import { LimitedPreyState, LimitedSpecies, UnlimitedPreyState } from "~/types/hunt";
import { DamageState } from "./damage";
import { DistrictDamage } from "./district-damages";
import { Hunt, Hunter } from "./hunts";
import { Infrastructure } from "./infrastructure";
import { Member } from "./mtl";
import { ObservationsState } from "./observations";
import { Permit } from "./permits";

export type RootNavigatorParams = {
    AboutScreen: undefined;
    AccountDeletionReportScreen: undefined;
    ComponentExamplesNavigator: NavigatorScreenParams<ComponentExamplesNavigatorParams>;
    DistrictDamagesDetailScreen: { detail: DistrictDamage };
    DistrictDamagesListScreen: { districtId: number };
    DistrictInfrastructureChangesListScreen: undefined;
    DistrictInfrastructureDetailScreen: { detail: Infrastructure; title: string };
    DistrictInfrastructureFormScreen: { infrastructureToEdit?: Infrastructure; currentDistrictId: number };
    DistrictInfrastructureListScreen: { districtId: number };
    DrivenHuntDetailScreen: { huntId: number };
    DrivenHuntFormScreen: { huntToEdit?: Hunt; huntToCopy?: Hunt };
    DrivenHuntListScreen: undefined;
    DrivenHuntReducedDetailScreen: { huntId: number };
    EditProfileScreen: undefined;
    HuntActivitiesListScreen: undefined;
    IndividualHuntDetailScreen: { huntId: number };
    IndividualHuntFormScreen: { hunt?: Hunt };
    IndividualHuntListScreen: undefined;
    LicenseDetailScreen: { dependency: string; license: string };
    LicenseListScreen: undefined;
    LimitedPreyScreen: {
        permit: Permit;
        huntingDistrictId: number;
        initialState?: LimitedPreyState;
        activeHuntHunters?: Hunter[];
    };
    LimitedPreySubspeciesScreen: { species: LimitedSpecies; unlimited: boolean; activeHuntHunters?: Hunter[] };
    MapSettingsModal: undefined;
    MemberDeletionModal: {
        member: Member;
        districts: Array<{ id: number; name: string }>;
        preSelectedDistrictId: number;
    };
    MemberManagementScreen: undefined;
    MemberRegistrationScreen: undefined;
    MemberRolesScreen: { member: Member; districtId: number; mode: "view" | "edit" };
    MenuScreen: undefined;
    NewsScreen: undefined;
    ObservationsScreenRoot: { initialState?: ObservationsState; huntEventId: number; huntVmdCode: string };
    PermitDistributionScreen: { permitTypeId: number; contractId: number; title: string };
    PermitsScreen: undefined;
    PhotoExampleScreen: undefined;
    ProfileScreen: { edited?: true };
    QRPreviewModal: { value: string; title: string; description?: string };
    RegisterPreyScreen: { activeHuntHunters?: Hunter[] };
    ReportDetailScreen: { reportId: string };
    ReportListScreen: undefined;
    ReportStatusModal: { reportId: string };
    SettingsScreen: undefined;
    TabsNavigator: NavigatorScreenParams<TabsNavigatorParams>;
    UnlimitedPreyScreen: { speciesId: string; initialState?: UnlimitedPreyState };
};

export type TabsNavigatorParams = {
    DamagesScreen?: { initialState: DamageState };
    HuntScreen: undefined;
    MapScreen: undefined;
    MTLScreen: undefined;
    ObservationsScreen: { initialState?: ObservationsState; huntEventId?: number; huntVmdCode?: string };
};

export type ComponentExamplesNavigatorParams = {
    ActionButtonExampleScreen: undefined;
    BadgeExampleScreen: undefined;
    ButtonExampleScreen: undefined;
    CardButtonExampleScreen: undefined;
    CheckboxButtonExampleScreen: undefined;
    CheckboxButtonGridExampleScreen: undefined;
    CheckboxButtonListExampleScreen: undefined;
    CollapsibleExampleScreen: undefined;
    ComponentExamplesListScreen: undefined;
    CurrentPositionExampleScreen: undefined;
    DateTimeInputExampleScreen: undefined;
    DialogExampleScreen: undefined;
    DynamicPickerExampleScreen: undefined;
    EmptyListMessageExampleScreen: undefined;
    ErrorMessageExampleScreen: undefined;
    FieldLabelExampleScreen: undefined;
    HeaderExampleScreen: undefined;
    HuntingCardExampleScreen: undefined;
    HuntLocationViewerExampleScreen: undefined;
    IconButtonExampleScreen: undefined;
    IconExampleScreen: undefined;
    ImageButtonExampleScreen: undefined;
    IndividualHuntingCardExampleScreen: undefined;
    InjuredAnimalExampleScreen: undefined;
    InputExampleScreen: undefined;
    LogoutButtonExampleScreen: undefined;
    MapPinExampleScreen: undefined;
    MenuListItemExampleScreen: undefined;
    ModalExampleScreen: undefined;
    MultiSelectExampleScreen: undefined;
    NavigationButtonExampleScreen: undefined;
    PositionSelectExampleScreen: undefined;
    PressableListItemExampleScreen: undefined;
    QRCodeContainerExampleScreen: undefined;
    RadioButtonExampleScreen: undefined;
    RadioButtonGridExampleScreen: undefined;
    RadioButtonListExampleScreen: undefined;
    ReadOnlyFieldExampleScreen: undefined;
    RoundIconButtonExampleScreen: undefined;
    ScrollableSelectionFieldsExampleScreen: undefined;
    SegmentedControlExampleScreen: undefined;
    SelectExampleScreen: undefined;
    SpinnerExampleScreen: undefined;
    SquareIconButtonExampleScreen: undefined;
    StepperExampleScreen: undefined;
    SwitchExampleScreen: undefined;
    TabBarExampleScreen: undefined;
    TagExampleScreen: undefined;
    TypeFieldExampleScreen: undefined;
};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ReactNavigation {
        interface RootParamList extends RootNavigatorParams {}
    }
}
