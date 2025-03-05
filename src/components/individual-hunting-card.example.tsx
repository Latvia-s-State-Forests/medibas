import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import { IndividualHuntingCard } from "./individual-hunting-card";

export function IndividualHuntingCardExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        //do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Hunting Card" />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                        paddingRight: insets.right + 16,
                    },
                ]}
            >
                <Text>Hunting Cards with status</Text>
                <Spacer size={8} />
                <IndividualHuntingCard
                    date="16.11.2022."
                    hunterName="Jānis Bērziņš"
                    status="active"
                    title="MK_002, Aizputed iecirknis"
                    description="Active card"
                    onPress={ignore}
                />
                <Spacer size={8} />
                <IndividualHuntingCard
                    date="16.11.2022."
                    hunterName="Jānis Bērziņš"
                    status="pause"
                    title="MK_002, Aizputed iecirknis"
                    description="Paused card"
                    onPress={ignore}
                />
                <Spacer size={8} />
                <IndividualHuntingCard
                    date="16.11.2022."
                    hunterName="Jānis Bērziņš"
                    status="declined"
                    title="MK_002, Aizputed iecirknis"
                    description="Declined card"
                    onPress={ignore}
                />
                <Spacer size={8} />
                <IndividualHuntingCard
                    date="16.11.2022."
                    hunterName="Jānis Bērziņš"
                    status="seen"
                    title="MK_002, Aizputed iecirknis"
                    description="Seen card"
                    onPress={ignore}
                />
                <Spacer size={8} />
                <IndividualHuntingCard
                    date="16.11.2022."
                    hunterName="Jānis Bērziņš"
                    status="waiting-for-approval-or-deny"
                    title="MK_002, Aizputed iecirknis"
                    description="Waiting for approval or deny card"
                    onPress={ignore}
                />
                <Spacer size={16} />
                <Text>Hunting Cards without status</Text>
                <Spacer size={8} />
                <IndividualHuntingCard
                    date="16.11.2022."
                    hunterName="Jānis Bērziņš"
                    title="MK_002, Aizputed iecirknis"
                    description="Hunting Cards without status"
                    onPress={ignore}
                />
                <Spacer size={16} />
                <Text>Hunting Cards without status and description</Text>
                <Spacer size={8} />
                <IndividualHuntingCard
                    date="16.11.2022."
                    hunterName="Jānis Bērziņš"
                    title="MK_002, Aizputed iecirknis"
                    onPress={ignore}
                />
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
        paddingTop: 24,
    },
});
