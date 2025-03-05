import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { RadioButtonList } from "~/components/radio-button-list";
import { TabBar, TabBarItem } from "~/components/tab-bar";
import { theme } from "~/theme";

export function TabBarExampleScreen() {
    const insets = useSafeAreaInsets();
    const [activeItem, setActiveItem] = React.useState("map");

    const [value, setValue] = React.useState<string>("value2");

    return (
        <View style={styles.container}>
            <Header title="Tab Bar" />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                    },
                ]}
            >
                <RadioButtonList
                    label="Tab Bar"
                    onChange={setValue}
                    value={value}
                    options={[
                        { label: "With three screens", value: "value" },
                        { label: "With four screens", value: "value2" },
                        { label: "With five screens", value: "value3" },
                        { label: "Five screens and Badge symbol count 1", value: "value4" },
                        { label: "Five screens and Badge symbol count 2", value: "value5" },
                        { label: "Five screens and Badge symbol count 3", value: "value6" },
                    ]}
                />
            </ScrollView>
            {value === "value" && (
                <TabBar>
                    <TabBarItem
                        icon="map"
                        label="Karte"
                        active={activeItem === "map"}
                        onPress={() => setActiveItem("map")}
                    />
                    <TabBarItem
                        icon="binoculars"
                        label="Novērojumi"
                        active={activeItem === "binoculars"}
                        onPress={() => {
                            setActiveItem("binoculars");
                        }}
                    />
                    <TabBarItem
                        icon="damage"
                        label="Postījumi"
                        active={activeItem === "damage"}
                        onPress={() => {
                            setActiveItem("damage");
                        }}
                    />
                </TabBar>
            )}
            {value === "value2" && (
                <TabBar>
                    <TabBarItem
                        icon="map"
                        label="Karte"
                        active={activeItem === "map"}
                        onPress={() => setActiveItem("map")}
                    />
                    <TabBarItem
                        icon="binoculars"
                        label="Novērojumi"
                        active={activeItem === "binoculars"}
                        onPress={() => {
                            setActiveItem("binoculars");
                        }}
                    />
                    <TabBarItem
                        icon="damage"
                        label="Postījumi"
                        active={activeItem === "damage"}
                        onPress={() => {
                            setActiveItem("damage");
                        }}
                    />
                    <TabBarItem
                        icon="hunt"
                        label="Medības"
                        active={activeItem === "hunt"}
                        onPress={() => {
                            setActiveItem("hunt");
                        }}
                    />
                </TabBar>
            )}
            {value === "value3" && (
                <TabBar>
                    <TabBarItem
                        icon="map"
                        label="Karte"
                        active={activeItem === "map"}
                        onPress={() => setActiveItem("map")}
                    />
                    <TabBarItem
                        icon="binoculars"
                        label="Novērojumi"
                        active={activeItem === "binoculars"}
                        onPress={() => {
                            setActiveItem("binoculars");
                        }}
                    />
                    <TabBarItem
                        icon="damage"
                        label="Postījumi"
                        active={activeItem === "damage"}
                        onPress={() => {
                            setActiveItem("damage");
                        }}
                    />
                    <TabBarItem
                        icon="hunt"
                        label="Medības"
                        active={activeItem === "hunt"}
                        onPress={() => {
                            setActiveItem("hunt");
                        }}
                    />
                    <TabBarItem
                        icon="mtl"
                        label="MTL"
                        badgeCount={0}
                        active={activeItem === "mtl"}
                        onPress={() => {
                            setActiveItem("mtl");
                        }}
                    />
                </TabBar>
            )}
            {value === "value4" && (
                <TabBar>
                    <TabBarItem
                        icon="map"
                        label="Karte"
                        active={activeItem === "map"}
                        onPress={() => setActiveItem("map")}
                    />
                    <TabBarItem
                        icon="binoculars"
                        label="Novērojumi"
                        active={activeItem === "binoculars"}
                        onPress={() => {
                            setActiveItem("binoculars");
                        }}
                    />
                    <TabBarItem
                        icon="damage"
                        label="Postījumi"
                        active={activeItem === "damage"}
                        onPress={() => {
                            setActiveItem("damage");
                        }}
                    />
                    <TabBarItem
                        icon="hunt"
                        label="Medības"
                        active={activeItem === "hunt"}
                        onPress={() => {
                            setActiveItem("hunt");
                        }}
                    />
                    <TabBarItem
                        icon="mtl"
                        label="MTL"
                        badgeCount={4}
                        active={activeItem === "mtl"}
                        onPress={() => {
                            setActiveItem("mtl");
                        }}
                    />
                </TabBar>
            )}
            {value === "value5" && (
                <TabBar>
                    <TabBarItem
                        icon="map"
                        label="Karte"
                        active={activeItem === "map"}
                        onPress={() => setActiveItem("map")}
                    />
                    <TabBarItem
                        icon="binoculars"
                        label="Novērojumi"
                        active={activeItem === "binoculars"}
                        onPress={() => {
                            setActiveItem("binoculars");
                        }}
                    />
                    <TabBarItem
                        icon="damage"
                        label="Postījumi"
                        active={activeItem === "damage"}
                        onPress={() => {
                            setActiveItem("damage");
                        }}
                    />
                    <TabBarItem
                        icon="hunt"
                        label="Medības"
                        active={activeItem === "hunt"}
                        onPress={() => {
                            setActiveItem("hunt");
                        }}
                    />
                    <TabBarItem
                        icon="mtl"
                        label="MTL"
                        badgeCount={44}
                        active={activeItem === "mtl"}
                        onPress={() => {
                            setActiveItem("mtl");
                        }}
                    />
                </TabBar>
            )}
            {value === "value6" && (
                <TabBar>
                    <TabBarItem
                        icon="map"
                        label="Karte"
                        active={activeItem === "map"}
                        onPress={() => setActiveItem("map")}
                    />
                    <TabBarItem
                        icon="binoculars"
                        label="Novērojumi"
                        active={activeItem === "binoculars"}
                        onPress={() => {
                            setActiveItem("binoculars");
                        }}
                    />
                    <TabBarItem
                        icon="damage"
                        label="Postījumi"
                        active={activeItem === "damage"}
                        onPress={() => {
                            setActiveItem("damage");
                        }}
                    />
                    <TabBarItem
                        icon="hunt"
                        label="Medības"
                        active={activeItem === "hunt"}
                        onPress={() => {
                            setActiveItem("hunt");
                        }}
                    />
                    <TabBarItem
                        icon="mtl"
                        label="MTL"
                        badgeCount={444}
                        active={activeItem === "mtl"}
                        onPress={() => {
                            setActiveItem("mtl");
                        }}
                    />
                </TabBar>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        paddingTop: 24,
    },
});
