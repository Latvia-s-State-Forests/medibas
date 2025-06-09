import { NavigatorScreenParams, useNavigation } from "@react-navigation/native";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { MediumIcon } from "~/components/icon";
import { PressableListItem } from "~/components/list/pressable-list-item";
import { theme } from "~/theme";
import { ComponentExamplesNavigatorParams } from "~/types/navigation";

const componentExamples: Array<{ label: string; params: NavigatorScreenParams<ComponentExamplesNavigatorParams> }> = [
    { label: "Action Button", params: { screen: "ActionButtonExampleScreen" } },
    { label: "Badge", params: { screen: "BadgeExampleScreen" } },
    { label: "Button", params: { screen: "ButtonExampleScreen" } },
    { label: "Card Button", params: { screen: "CardButtonExampleScreen" } },
    { label: "Checkbox Button Grid", params: { screen: "CheckboxButtonGridExampleScreen" } },
    { label: "Checkbox Button List", params: { screen: "CheckboxButtonListExampleScreen" } },
    { label: "Checkbox Button", params: { screen: "CheckboxButtonExampleScreen" } },
    { label: "Collapsible", params: { screen: "CollapsibleExampleScreen" } },
    { label: "Current Position", params: { screen: "CurrentPositionExampleScreen" } },
    { label: "Date Time Input", params: { screen: "DateTimeInputExampleScreen" } },
    { label: "Dialog", params: { screen: "DialogExampleScreen" } },
    { label: "Dynamic Picker", params: { screen: "DynamicPickerExampleScreen" } },
    { label: "Empty List Message", params: { screen: "EmptyListMessageExampleScreen" } },
    { label: "Error Message", params: { screen: "ErrorMessageExampleScreen" } },
    { label: "Field Label", params: { screen: "FieldLabelExampleScreen" } },
    { label: "Header", params: { screen: "HeaderExampleScreen" } },
    { label: "Hunting Card", params: { screen: "HuntingCardExampleScreen" } },
    { label: "Hunt Location Viewer", params: { screen: "HuntLocationViewerExampleScreen" } },
    { label: "Individual Hunting Card", params: { screen: "IndividualHuntingCardExampleScreen" } },
    { label: "Icon Button", params: { screen: "IconButtonExampleScreen" } },
    { label: "Icon", params: { screen: "IconExampleScreen" } },
    { label: "Image Button", params: { screen: "ImageButtonExampleScreen" } },
    { label: "Input", params: { screen: "InputExampleScreen" } },
    { label: "List", params: { screen: "PressableListItemExampleScreen" } },
    { label: "Logout Button", params: { screen: "LogoutButtonExampleScreen" } },
    { label: "Map Pin", params: { screen: "MapPinExampleScreen" } },
    { label: "Menu list item", params: { screen: "MenuListItemExampleScreen" } },
    { label: "Modal", params: { screen: "ModalExampleScreen" } },
    { label: "Multi Select", params: { screen: "MultiSelectExampleScreen" } },
    { label: "Navigation Button", params: { screen: "NavigationButtonExampleScreen" } },
    { label: "QR code Container", params: { screen: "QRCodeContainerExampleScreen" } },
    { label: "Position Select", params: { screen: "PositionSelectExampleScreen" } },
    { label: "Radio Button Grid", params: { screen: "RadioButtonGridExampleScreen" } },
    { label: "Radio Button List", params: { screen: "RadioButtonListExampleScreen" } },
    { label: "Radio Button", params: { screen: "RadioButtonExampleScreen" } },
    { label: "Read Only Field", params: { screen: "ReadOnlyFieldExampleScreen" } },
    { label: "Round Icon Button", params: { screen: "RoundIconButtonExampleScreen" } },
    { label: "Scrollable Selection Fields", params: { screen: "ScrollableSelectionFieldsExampleScreen" } },
    { label: "Segmented Control", params: { screen: "SegmentedControlExampleScreen" } },
    { label: "Select", params: { screen: "SelectExampleScreen" } },
    { label: "Spinner", params: { screen: "SpinnerExampleScreen" } },
    { label: "Square Icon Button", params: { screen: "SquareIconButtonExampleScreen" } },
    { label: "Stepper", params: { screen: "StepperExampleScreen" } },
    { label: "Switch", params: { screen: "SwitchExampleScreen" } },
    { label: "Tab Bar", params: { screen: "TabBarExampleScreen" } },
    { label: "Tag", params: { screen: "TagExampleScreen" } },
    { label: "Type Field", params: { screen: "TypeFieldExampleScreen" } },
];

export function ComponentExamplesListScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Header title="Component showcase" />
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
                {componentExamples.map(({ label, params }) => (
                    <PressableListItem
                        key={label}
                        label={label}
                        rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                        onPress={() => {
                            navigation.navigate("ComponentExamplesNavigator", params);
                        }}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
});
