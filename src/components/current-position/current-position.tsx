import { useMachine } from "@xstate/react";
import * as Linking from "expo-linking";
import * as React from "react";
import { CurrentPositionError } from "~/components/current-position/current-position-error";
import { CurrentPositionIdle } from "~/components/current-position/current-position-idle";
import { CurrentPositionLoading } from "~/components/current-position/current-position-loading";
import { currentPositionMachine } from "~/components/current-position/current-position-machine";
import { CurrentPositionPermissionsError } from "~/components/current-position/current-position-permissions-error";
import { useConfig } from "~/hooks/use-config";
import { PositionResult } from "~/types/position-result";

export type CurrentPositionHandle = {
    reset: () => void;
};

type CurrentPositionProps = {
    initialPosition?: PositionResult;
    onChange: (position: PositionResult | undefined) => void;
};

export const CurrentPosition = React.forwardRef<CurrentPositionHandle, CurrentPositionProps>(
    ({ initialPosition, onChange }, ref) => {
        const config = useConfig();
        const [state, send] = useMachine(() => currentPositionMachine, {
            context: {
                position: initialPosition,
                config,
            },
            actions: {
                notifyPosition: (context) => onChange(context.position),
            },
        });

        React.useImperativeHandle(ref, () => ({
            reset: () => send("RESET"),
        }));

        function openAppSettings() {
            Linking.openSettings();
        }

        function onRetry() {
            send("RESET");
        }

        if (state.matches({ failure: "permissions" })) {
            return <CurrentPositionPermissionsError onOpenSettings={openAppSettings} onRetry={onRetry} />;
        }

        if (state.matches({ failure: "other" })) {
            return <CurrentPositionError onRetry={onRetry} type="other" />;
        }

        if (state.matches({ failure: "accuracy" })) {
            return <CurrentPositionError onRetry={onRetry} type="accuracy" />;
        }

        if (state.matches("success") && state.context.position) {
            return <CurrentPositionIdle position={state.context.position} onRetry={onRetry} />;
        }

        return <CurrentPositionLoading />;
    }
);
