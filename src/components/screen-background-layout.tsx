import * as React from "react";
import { ImageBackground, StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "~/theme";

interface ScreenBackgroundLayoutProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}
export function ScreenBackgroundLayout({ children, style }: ScreenBackgroundLayoutProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../assets/images/background.jpg")}
                resizeMode="cover"
                style={styles.image}
            >
                <View
                    style={[
                        {
                            paddingLeft: insets.left + 16,
                            paddingBottom: insets.bottom + 24,
                            paddingTop: insets.top + 16,
                            paddingRight: insets.right + 16,
                        },
                        style,
                    ]}
                >
                    {children}
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: theme.color.gray8,
    },
    image: {
        flex: 1,
        justifyContent: "center",
    },
});
