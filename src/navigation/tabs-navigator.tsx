import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { usePendingHuntActivitiesCount } from "~/components/hunt-activities-provider";
import { TabBar, TabBarItem } from "~/components/tab-bar";
import { useInjuredAnimalPermits } from "~/hooks/use-injured-animal-permits";
import { usePermissions } from "~/hooks/use-permissions";
import { DamagesScreen } from "~/screens/damage/damages-screen";
import { HuntScreen } from "~/screens/hunt/hunt-screen";
import { MapScreen } from "~/screens/map/map-screen";
import { MTLScreen } from "~/screens/mtl/mtl-screen";
import { ObservationsScreen } from "~/screens/observation/observations-screen";
import { TabsNavigatorParams } from "~/types/navigation";

const Tabs = createBottomTabNavigator<TabsNavigatorParams>();

export function TabsNavigator() {
    const { t } = useTranslation();
    const permissions = usePermissions();
    const injuredAnimalPermits = useInjuredAnimalPermits();
    const injuredAnimalsCount = injuredAnimalPermits.length;
    const pendingHuntActivitiesCount = usePendingHuntActivitiesCount();
    const badgeCount = injuredAnimalsCount + pendingHuntActivitiesCount;

    return (
        <Tabs.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="MapScreen"
            backBehavior="initialRoute"
            tabBar={({ state, navigation }) => {
                const { index } = state;
                const { navigate } = navigation;

                return (
                    <TabBar>
                        <TabBarItem
                            label={t("tabs.map")}
                            active={index === 0}
                            icon="map"
                            onPress={() => {
                                navigate("MapScreen");
                            }}
                        />
                        <TabBarItem
                            label={t("tabs.observations")}
                            active={index === 1}
                            icon="binoculars"
                            onPress={() => {
                                navigate("ObservationsScreen");
                            }}
                        />
                        <TabBarItem
                            label={t("tabs.damage")}
                            active={index === 2}
                            icon="damage"
                            onPress={() => {
                                navigate("DamagesScreen");
                            }}
                        />
                        {permissions.viewHunt ? (
                            <TabBarItem
                                label={t("tabs.hunt")}
                                active={index === 3}
                                icon="hunt"
                                onPress={() => {
                                    navigate("HuntScreen");
                                }}
                                badgeCount={index === 3 ? undefined : badgeCount}
                            />
                        ) : null}
                        {permissions.viewMtl ? (
                            <TabBarItem
                                label={t("tabs.mtl")}
                                active={index === 4}
                                icon="mtl"
                                onPress={() => {
                                    navigate("MTLScreen");
                                }}
                            />
                        ) : null}
                    </TabBar>
                );
            }}
        >
            <Tabs.Screen name="MapScreen" component={MapScreen} />
            <Tabs.Screen name="ObservationsScreen" component={ObservationsScreen} />
            <Tabs.Screen name="DamagesScreen" component={DamagesScreen} />
            {permissions.viewHunt ? <Tabs.Screen name="HuntScreen" component={HuntScreen} /> : null}
            {permissions.viewMtl ? <Tabs.Screen name="MTLScreen" component={MTLScreen} /> : null}
        </Tabs.Navigator>
    );
}
