import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BorderlessBadge } from "~/components/borderless-badge";
import { Checkbox } from "~/components/checkbox-button";
import { Header } from "~/components/header";
import { MediumIcon } from "~/components/icon";
import { IconButton } from "~/components/icon-button";
import { ListItem } from "~/components/list/list-item";
import { PressableListItem } from "~/components/list/pressable-list-item";
import { Radio } from "~/components/radio-button";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function PressableListItemExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="List" />
            <ScrollView contentContainerStyle={[{ paddingBottom: insets.bottom + 24 }]}>
                <PressableListItem
                    background="transparent"
                    onPress={ignore}
                    leftContent={<MediumIcon name="houseSlim" />}
                    label="With left and right content"
                    description="Description"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    background="transparent"
                    onPress={ignore}
                    leftContent={<MediumIcon name="houseSlim" />}
                    label="With left content"
                    description="Description"
                />
                <PressableListItem
                    background="transparent"
                    onPress={ignore}
                    label="With right content"
                    description="Description"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    background="transparent"
                    onPress={ignore}
                    label="Label and description only"
                    description="Description"
                />

                <Spacer size={20} />

                <PressableListItem
                    background="white"
                    onPress={ignore}
                    leftContent={<MediumIcon name="houseSlim" />}
                    label="With left and right content"
                    description="Description"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    background="white"
                    onPress={ignore}
                    leftContent={<MediumIcon name="houseSlim" />}
                    label="With left content"
                    description="Description"
                />
                <PressableListItem
                    background="white"
                    onPress={ignore}
                    label="With right content"
                    description="Description"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    background="white"
                    onPress={ignore}
                    label="Label and description only"
                    description="Description"
                />

                <Spacer size={20} />

                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="user" />}
                    label="Lietotāja profils"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="settings" />}
                    label="Iestatījumi"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="info" />}
                    label="Par lietotni"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="info" />}
                    label="Iesniegtie vienumi"
                    rightContent={
                        <>
                            <BorderlessBadge count={1} variant="action-required" />
                            <MediumIcon name="chevronRight" color="gray5" />
                        </>
                    }
                />

                <Spacer size={20} />

                <PressableListItem
                    onPress={ignore}
                    label="Badge"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    onPress={ignore}
                    label="Button"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    onPress={ignore}
                    label="Checkbox Button"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    onPress={ignore}
                    label="Checkbox Button Grid"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />
                <PressableListItem
                    onPress={ignore}
                    label="Checkbox Button List"
                    rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                />

                <Spacer size={20} />

                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="user" />}
                    label="Jānis Bērziņš"
                    description="Kluba vadītājs"
                />
                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="houseSlim" />}
                    label="Pēteris Apse"
                    rightContent={
                        <IconButton style={styles.removePadding} name="trash" color="gray5" onPress={ignore} />
                    }
                />
                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="key" />}
                    label="Inese Liepiņa"
                    rightContent={
                        <IconButton style={styles.removePadding} name="trash" color="gray5" onPress={ignore} />
                    }
                />
                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="huntTarget" />}
                    label="Edgars Kļava"
                    rightContent={
                        <IconButton style={styles.removePadding} name="trash" color="gray5" onPress={ignore} />
                    }
                />

                <Spacer size={20} />

                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="houseSlim" />}
                    label="Atbildīgā persona"
                    rightContent={<Checkbox state="checked" />}
                />
                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="key" />}
                    label="Administrators"
                    rightContent={<Checkbox state="unchecked" />}
                />
                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="flag" />}
                    label="Medību vadītājs"
                    rightContent={<Checkbox state="unchecked" />}
                />
                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="huntTarget" />}
                    label="Mednieks"
                    rightContent={<Checkbox state="checked" />}
                />
                <PressableListItem
                    onPress={ignore}
                    leftContent={<MediumIcon name="user" />}
                    label="Biedrs"
                    rightContent={<Checkbox state="unchecked" />}
                />

                <Spacer size={20} />

                <PressableListItem background="white" onPress={ignore} label="Uzstādīt PIN" />

                <Spacer size={20} />

                <PressableListItem background="white" onPress={ignore} label="Mainīt PIN" />
                <PressableListItem background="white" onPress={ignore} label="Dzēst PIN" />

                <Spacer size={20} />

                <PressableListItem background="white" onPress={ignore} label="Sazinies ar mums" />
                <PressableListItem background="white" onPress={ignore} label="Lietošanas noteikumi" />
                <PressableListItem background="white" onPress={ignore} label="Privātuma politika" />
                <PressableListItem background="white" onPress={ignore} label="Atkļūdošanas informācija" />

                <Spacer size={20} />

                <PressableListItem
                    background="white"
                    onPress={ignore}
                    leftContent={<Radio checked={true} />}
                    label="Akmens cauna"
                />
                <PressableListItem
                    background="white"
                    onPress={ignore}
                    leftContent={<Radio checked={false} />}
                    label="Amerikas ūdele"
                />
                <PressableListItem
                    background="white"
                    onPress={ignore}
                    leftContent={<Radio checked={false} />}
                    label="Āpsis"
                />

                <Spacer size={20} />

                <Text style={styles.text}>Non pressable list items</Text>
                <Spacer size={16} />
                <ListItem
                    hasTopBorder
                    label="Valdis Lapsa AL1111"
                    rightContent={
                        <IconButton style={styles.removePadding} name="trash" color="gray5" onPress={ignore} />
                    }
                />
                <ListItem
                    label="Jānis Bērziņš AL2233"
                    rightContent={
                        <IconButton style={styles.removePadding} name="trash" color="gray5" onPress={ignore} />
                    }
                />
                <ListItem
                    label="Ivars Bulis AL3333"
                    rightContent={
                        <IconButton style={styles.removePadding} name="trash" color="gray5" onPress={ignore} />
                    }
                />

                <Spacer size={20} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    removePadding: {
        paddingRight: 0,
    },
    text: {
        marginLeft: 16,
    },
});
