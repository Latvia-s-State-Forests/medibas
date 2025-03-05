import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActionButtonExampleScreen } from "~/components/action-button.example";
import { BadgeExampleScreen } from "~/components/badge.example";
import { ButtonExampleScreen } from "~/components/button.example";
import { CardButtonExampleScreen } from "~/components/card-button.example";
import { CheckboxButtonGridExampleScreen } from "~/components/checkbox-button-grid.example";
import { CheckboxButtonListExampleScreen } from "~/components/checkbox-button-list.example";
import { CheckboxButtonExampleScreen } from "~/components/checkbox-button.example";
import { CollapsibleExampleScreen } from "~/components/collapsible/collapsible.example";
import { CurrentPositionExampleScreen } from "~/components/current-position/current-position.example";
import { DateTimeInputExampleScreen } from "~/components/date-time-input.example";
import { DialogExampleScreen } from "~/components/dialog.example";
import { DynamicPickerExampleScreen } from "~/components/dynamic-picker.example";
import { EmptyListMessageExampleScreen } from "~/components/empty-list-message.example";
import { ErrorMessageExampleScreen } from "~/components/error-message.example";
import { FieldLabelExampleScreen } from "~/components/field-label.example";
import { HeaderExampleScreen } from "~/components/header.example";
import { HuntingCardExampleScreen } from "~/components/hunting-card.example";
import { IconButtonExampleScreen } from "~/components/icon-button.example";
import { IconExampleScreen } from "~/components/icon.example";
import { ImageButtonExampleScreen } from "~/components/image-button.example";
import { IndividualHuntingCardExampleScreen } from "~/components/individual-hunting-card.example";
import { InputExampleScreen } from "~/components/input.example";
import { PressableListItemExampleScreen } from "~/components/list/pressable-list-item.example";
import { LogoutButtonExampleScreen } from "~/components/logout-button.example";
import { MapPinExampleScreen } from "~/components/map-pin.example";
import { ModalExampleScreen } from "~/components/modal/modal.example";
import { MultiSelectExampleScreen } from "~/components/multi-select.example";
import { NavigationButtonExampleScreen } from "~/components/navigation-button.example";
import { PositionSelectExampleScreen } from "~/components/position-select.example";
import { QRContainerExampleScreen } from "~/components/qr-code/qr-container.example";
import { RadioButtonGridExampleScreen } from "~/components/radio-button-grid.example";
import { RadioButtonListExampleScreen } from "~/components/radio-button-list.example";
import { RadioButtonExampleScreen } from "~/components/radio-button.example";
import { ReadOnlyFieldExampleScreen } from "~/components/read-only-field.example";
import { RoundIconButtonExampleScreen } from "~/components/round-icon-button.example";
import { SegmentedControlExampleScreen } from "~/components/segmented-control.example";
import { SelectExampleScreen } from "~/components/select.example";
import { SpeciesFieldExampleScreen } from "~/components/species-field.example";
import { SpinnerExampleScreen } from "~/components/spinner.example";
import { SquareIconButtonExampleScreen } from "~/components/square-icon-button.example";
import { StepperExampleScreen } from "~/components/stepper.example";
import { SwitchExampleScreen } from "~/components/switch.example";
import { TabBarExampleScreen } from "~/components/tab-bar.example";
import { TagExampleScreen } from "~/components/tag.example";
import { TypeFieldExampleScreen } from "~/components/type-field.example";
import { ComponentExamplesListScreen } from "~/screens/component-examples-list-screen";
import { DrivenHuntMeetingPlaceExampleScreen } from "~/screens/hunt/driven-hunt/driven-hunt-meeting-place.example";
import { MenuListItemExampleScreen } from "~/screens/menu/menu-list-item.example";
import { ComponentExamplesNavigatorParams } from "~/types/navigation";

const ExamplesStack = createNativeStackNavigator<ComponentExamplesNavigatorParams>();

export function ComponentExamplesNavigator() {
    return (
        <ExamplesStack.Navigator
            initialRouteName="ComponentExamplesListScreen"
            screenOptions={{ headerShown: false, animation: "slide_from_right" }}
        >
            <ExamplesStack.Screen name="ActionButtonExampleScreen" component={ActionButtonExampleScreen} />
            <ExamplesStack.Screen name="BadgeExampleScreen" component={BadgeExampleScreen} />
            <ExamplesStack.Screen name="ButtonExampleScreen" component={ButtonExampleScreen} />
            <ExamplesStack.Screen name="CardButtonExampleScreen" component={CardButtonExampleScreen} />
            <ExamplesStack.Screen name="CheckboxButtonExampleScreen" component={CheckboxButtonExampleScreen} />
            <ExamplesStack.Screen name="CheckboxButtonGridExampleScreen" component={CheckboxButtonGridExampleScreen} />
            <ExamplesStack.Screen name="CheckboxButtonListExampleScreen" component={CheckboxButtonListExampleScreen} />
            <ExamplesStack.Screen name="CollapsibleExampleScreen" component={CollapsibleExampleScreen} />
            <ExamplesStack.Screen name="ComponentExamplesListScreen" component={ComponentExamplesListScreen} />
            <ExamplesStack.Screen name="CurrentPositionExampleScreen" component={CurrentPositionExampleScreen} />
            <ExamplesStack.Screen name="DateTimeInputExampleScreen" component={DateTimeInputExampleScreen} />
            <ExamplesStack.Screen name="DialogExampleScreen" component={DialogExampleScreen} />
            <ExamplesStack.Screen
                name="DrivenHuntMeetingPlaceExampleScreen"
                component={DrivenHuntMeetingPlaceExampleScreen}
            />
            <ExamplesStack.Screen name="DynamicPickerExampleScreen" component={DynamicPickerExampleScreen} />
            <ExamplesStack.Screen name="EmptyListMessageExampleScreen" component={EmptyListMessageExampleScreen} />
            <ExamplesStack.Screen name="ErrorMessageExampleScreen" component={ErrorMessageExampleScreen} />
            <ExamplesStack.Screen name="FieldLabelExampleScreen" component={FieldLabelExampleScreen} />
            <ExamplesStack.Screen name="HeaderExampleScreen" component={HeaderExampleScreen} />
            <ExamplesStack.Screen name="HuntingCardExampleScreen" component={HuntingCardExampleScreen} />
            <ExamplesStack.Screen
                name="IndividualHuntingCardExampleScreen"
                component={IndividualHuntingCardExampleScreen}
            />
            <ExamplesStack.Screen name="IconButtonExampleScreen" component={IconButtonExampleScreen} />
            <ExamplesStack.Screen name="IconExampleScreen" component={IconExampleScreen} />
            <ExamplesStack.Screen name="ImageButtonExampleScreen" component={ImageButtonExampleScreen} />
            <ExamplesStack.Screen name="InputExampleScreen" component={InputExampleScreen} />
            <ExamplesStack.Screen name="PositionSelectExampleScreen" component={PositionSelectExampleScreen} />
            <ExamplesStack.Screen name="PressableListItemExampleScreen" component={PressableListItemExampleScreen} />
            <ExamplesStack.Screen name="LogoutButtonExampleScreen" component={LogoutButtonExampleScreen} />
            <ExamplesStack.Screen name="MapPinExampleScreen" component={MapPinExampleScreen} />
            <ExamplesStack.Screen name="MenuListItemExampleScreen" component={MenuListItemExampleScreen} />
            <ExamplesStack.Screen name="ModalExampleScreen" component={ModalExampleScreen} />
            <ExamplesStack.Screen name="MultiSelectExampleScreen" component={MultiSelectExampleScreen} />
            <ExamplesStack.Screen name="NavigationButtonExampleScreen" component={NavigationButtonExampleScreen} />
            <ExamplesStack.Screen name="QRCodeContainerExampleScreen" component={QRContainerExampleScreen} />
            <ExamplesStack.Screen name="RadioButtonExampleScreen" component={RadioButtonExampleScreen} />
            <ExamplesStack.Screen name="RadioButtonGridExampleScreen" component={RadioButtonGridExampleScreen} />
            <ExamplesStack.Screen name="RadioButtonListExampleScreen" component={RadioButtonListExampleScreen} />
            <ExamplesStack.Screen name="ReadOnlyFieldExampleScreen" component={ReadOnlyFieldExampleScreen} />
            <ExamplesStack.Screen name="RoundIconButtonExampleScreen" component={RoundIconButtonExampleScreen} />
            <ExamplesStack.Screen name="SegmentedControlExampleScreen" component={SegmentedControlExampleScreen} />
            <ExamplesStack.Screen name="SelectExampleScreen" component={SelectExampleScreen} />
            <ExamplesStack.Screen name="SpeciesFieldExampleScreen" component={SpeciesFieldExampleScreen} />
            <ExamplesStack.Screen name="SpinnerExampleScreen" component={SpinnerExampleScreen} />
            <ExamplesStack.Screen name="SquareIconButtonExampleScreen" component={SquareIconButtonExampleScreen} />
            <ExamplesStack.Screen name="StepperExampleScreen" component={StepperExampleScreen} />
            <ExamplesStack.Screen name="SwitchExampleScreen" component={SwitchExampleScreen} />
            <ExamplesStack.Screen name="TabBarExampleScreen" component={TabBarExampleScreen} />
            <ExamplesStack.Screen name="TagExampleScreen" component={TagExampleScreen} />
            <ExamplesStack.Screen name="TypeFieldExampleScreen" component={TypeFieldExampleScreen} />
        </ExamplesStack.Navigator>
    );
}
