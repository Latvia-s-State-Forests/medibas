import "intl-pluralrules";
import NetInfo from "@react-native-community/netinfo";
import { registerRootComponent } from "expo";
import { SafeAreaProvider } from "react-native-safe-area-context";
import App from "~/app";
import { InitialUrlProvider } from "~/components/initial-url-provider";
import { QueryProvider } from "~/components/query-provider";
import { configuration } from "~/configuration";

NetInfo.configure({
    reachabilityUrl: configuration.reachability.url,
    reachabilityMethod: configuration.reachability.method,
    reachabilityRequestTimeout: configuration.reachability.timeout,
    reachabilityTest: (response) => {
        return Promise.resolve(response.status === configuration.reachability.expectedStatus);
    },
});

function AppComponent() {
    return (
        <QueryProvider>
            <SafeAreaProvider>
                <InitialUrlProvider>
                    <App />
                </InitialUrlProvider>
            </SafeAreaProvider>
        </QueryProvider>
    );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(AppComponent);
