import * as React from "react";
import { useUserStorage } from "~/machines/authentication-machine";
import { useProfile } from "./use-profile";

const SelectedDistrictIdContext = React.createContext<[number | undefined, (districtId: number) => void] | null>(null);

export function SelectedDistrictIdProvider({ children }: { children: React.ReactNode }) {
    const profile = useProfile();
    const userStorage = useUserStorage();

    const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | undefined>(() =>
        userStorage.getSelectedDistrictId()
    );

    // Automatically select first available district if selected district is not available
    React.useEffect(() => {
        const isDistrictSelected = selectedDistrictId !== undefined;
        const isSelectedDistrictAvailable = profile.memberships.some(
            (membership) => membership.huntingDistrictId === selectedDistrictId
        );
        const firstAvailableDistrictId = profile.memberships[0]?.huntingDistrictId;

        if (!isDistrictSelected && firstAvailableDistrictId) {
            setSelectedDistrictId(firstAvailableDistrictId);
            userStorage.setSelectedDistrictId(firstAvailableDistrictId);
        } else if (isDistrictSelected && !isSelectedDistrictAvailable) {
            if (firstAvailableDistrictId) {
                setSelectedDistrictId(firstAvailableDistrictId);
                userStorage.setSelectedDistrictId(firstAvailableDistrictId);
            } else {
                setSelectedDistrictId(undefined);
                userStorage.deleteSelectedDistrictId();
            }
        }
    }, [profile.memberships, selectedDistrictId, userStorage]);

    function updateSelectedDistrictId(districtId: number) {
        setSelectedDistrictId(districtId);
        userStorage.setSelectedDistrictId(districtId);
    }

    return (
        <SelectedDistrictIdContext.Provider value={[selectedDistrictId, updateSelectedDistrictId]}>
            {children}
        </SelectedDistrictIdContext.Provider>
    );
}

export function useSelectedDistrictId() {
    const context = React.useContext(SelectedDistrictIdContext);

    if (context === null) {
        throw new Error("SelectedDistrictIdContext not initialized");
    }

    return context;
}
