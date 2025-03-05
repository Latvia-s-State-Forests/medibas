import * as React from "react";
import { Platform, StatusBar } from "react-native";

export function useConfigureStatusBar() {
    // Use layout effect as 'translucent' affects the layout
    React.useLayoutEffect(() => {
        StatusBar.setBarStyle("light-content");

        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("transparent");
            StatusBar.setTranslucent(true);
        }
    }, []);
}

export function useDarkStatusBar() {
    React.useEffect(() => {
        StatusBar.setBarStyle("dark-content", true);

        return () => {
            StatusBar.setBarStyle("light-content", true);
        };
    }, []);
}
