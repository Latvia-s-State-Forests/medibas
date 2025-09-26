import * as React from "react";
import { FormState } from "~/types/form-state";
import { useUserStorage } from "../machines/authentication-machine";

type InitialNavigationState = any;

// Load form state and pending photo uri from storage and use it to restore the navigation state.
// Pending photo uri is checked every 50 ms, but not longer than 300 ms, since we don't have an event to listen to
// when the photo is saved to storage on Android activity restart.
export function useInitialNavigationState() {
    const userStorage = useUserStorage();

    const [initialNavigationState, setInitialNavigationState] = React.useState<
        { status: "loading" } | { status: "loaded"; state: InitialNavigationState }
    >({ status: "loading" });

    React.useEffect(() => {
        const formState = userStorage.getFormState();

        if (!formState) {
            setInitialNavigationState({ status: "loaded", state: undefined });
            return;
        }

        userStorage.deleteFormState();

        let pendingPhotoUri = userStorage.getPendingPhotoUri();

        if (pendingPhotoUri) {
            const state = getInitialNavigationState(formState, pendingPhotoUri);
            setInitialNavigationState({ status: "loaded", state });
            userStorage.deletePendingPhotoUri();
            return;
        }

        const interval = setInterval(() => {
            pendingPhotoUri = userStorage.getPendingPhotoUri();
            if (pendingPhotoUri) {
                clearInterval(interval);
                clearTimeout(timeout);
                const state = getInitialNavigationState(formState, pendingPhotoUri);
                setInitialNavigationState({ status: "loaded", state });
                userStorage.deletePendingPhotoUri();
            }
        }, 50);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            const state = getInitialNavigationState(formState);
            setInitialNavigationState({ status: "loaded", state });
        }, 300);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [userStorage]);

    return initialNavigationState;
}

// Navigation state doesn't need to be complete, since it's automatically patched on react navigation's side
function getInitialNavigationState(formState: FormState, pendingPhotoUri?: string): InitialNavigationState {
    const routes: unknown[] = [{ name: "MapNavigator" }];

    if (formState?.type === "observations") {
        const initialState = formState?.state;
        if (initialState && pendingPhotoUri) {
            initialState.photo = pendingPhotoUri;
        }
        routes.push({ name: "ObservationsScreen", params: { initialState } });
    } else if (formState?.type === "damages") {
        const initialState = formState?.state;
        if (initialState && pendingPhotoUri) {
            initialState.photo = pendingPhotoUri;
        }
        routes.push({ name: "DamagesScreen", params: { initialState } });
    } else if (formState?.type === "limited-prey") {
        const initialState = formState?.state;
        if (initialState && pendingPhotoUri) {
            initialState.photo = pendingPhotoUri;
        }
        routes.push({
            name: "HuntNavigator",
            state: {
                index: 1,
                routes: [
                    { name: "RegisterPreyScreen" },
                    {
                        name: "LimitedPreyScreen",
                        params: { ...formState.params, initialState },
                    },
                ],
            },
        });
    } else if (formState?.type === "unlimited-prey") {
        const initialState = formState?.state;
        if (initialState && pendingPhotoUri) {
            initialState.photo = pendingPhotoUri;
        }
        routes.push({
            name: "HuntNavigator",
            state: {
                index: 1,
                routes: [
                    { name: "RegisterPreyScreen" },
                    {
                        name: "UnlimitedPreyScreen",
                        params: { ...formState.params, initialState },
                    },
                ],
            },
        });
    }

    return {
        routes: [
            {
                name: "TabsNavigator",
                state: {
                    index: routes.length - 1,
                    routes,
                },
            },
        ],
    };
}
