import { assign, fromCallback, setup } from "xstate";
import { configuration } from "~/configuration";
import { logger } from "~/logger";
import {
    deletePin,
    deleteRemainingPinAttempts,
    getPin,
    getRemainingPinAttempts,
    setRemainingPinAttempts,
} from "~/utils/secure-storage";

type PinValidatorEvent =
    | { type: "LOADING_SUCCESS"; configuredPin: string; remainingAttempts?: number }
    | { type: "LOADING_FAILURE" }
    | { type: "ENTER_DIGIT"; digit: number }
    | { type: "REMOVE_DIGIT" };

export const pinValidatorMachine = setup({
    types: {
        context: {} as { configuredPin: string; pin: string; remainingAttempts: number },
        events: {} as PinValidatorEvent,
    },
    actions: {
        assignConfiguredPinToContext: assign({
            configuredPin: ({ context, event }) => {
                if (event.type === "LOADING_SUCCESS") {
                    return event.configuredPin;
                }

                return context.configuredPin;
            },
        }),
        assignRemainingAttemptsToContext: assign({
            remainingAttempts: ({ context, event }) => {
                if (event.type === "LOADING_SUCCESS" && event.remainingAttempts) {
                    return event.remainingAttempts;
                }

                return context.remainingAttempts;
            },
        }),
        appendDigitToPin: assign({
            pin: ({ context, event }) => {
                if (event.type === "ENTER_DIGIT") {
                    return context.pin + event.digit;
                }

                return context.pin;
            },
        }),
        removeDigitFromPin: assign({
            pin: ({ context, event }) => {
                if (event.type === "REMOVE_DIGIT") {
                    return context.pin.slice(0, -1);
                }

                return context.pin;
            },
        }),
        clearPin: assign({
            pin: "",
        }),
        decrementRemainingAttempts: assign({
            remainingAttempts: ({ context }) => {
                return context.remainingAttempts - 1;
            },
        }),
        removeConfiguredPinFromStorage: () => {
            deletePin().catch((error) => {
                logger.error("Failed to remove configured pin from storage", error);
            });
        },
        saveRemainingAttemptsToStorage: ({ context }) => {
            setRemainingPinAttempts(context.remainingAttempts).catch((error) => {
                logger.error("Failed to save remaining attempts to storage", error);
            });
        },
        removeRemainingAttemptsFromStorage: () => {
            deleteRemainingPinAttempts().catch((error) => {
                logger.error("Failed to remove remaining attempts from storage", error);
            });
        },
        onSuccess: () => {
            // handled externally
        },
        onFailure: () => {
            // handled externally
        },
    },
    guards: {
        isPinEntered: ({ context, event }) => {
            if (event.type === "ENTER_DIGIT") {
                return context.pin.length + 1 === context.configuredPin.length;
            }
            return context.pin.length === context.configuredPin.length;
        },
        isPinValid: ({ context }) => {
            return context.configuredPin === context.pin;
        },
        isRemainingAttemptsLimitReached: ({ context }) => {
            return context.remainingAttempts - 1 === 0;
        },
    },
    actors: {
        loadConfiguredPinAndRemainingAttempts: fromCallback(
            ({ sendBack }: { sendBack: (event: PinValidatorEvent) => void }) => {
                async function load() {
                    const configuredPin = await getPin();
                    const remainingAttempts = await getRemainingPinAttempts();
                    return { configuredPin, remainingAttempts };
                }
                load()
                    .then(({ configuredPin, remainingAttempts }) => {
                        if (configuredPin) {
                            sendBack({
                                type: "LOADING_SUCCESS",
                                configuredPin,
                                remainingAttempts,
                            });
                        } else {
                            sendBack({ type: "LOADING_FAILURE" });
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to load configured pin and remaining attempts", error);
                        sendBack({ type: "LOADING_FAILURE" });
                    });
            }
        ),
    },
}).createMachine({
    context: { configuredPin: "", pin: "", remainingAttempts: configuration.pin.maxValidationAttemptCount },
    initial: "loading",
    id: "pinValidator",
    states: {
        loading: {
            invoke: {
                src: "loadConfiguredPinAndRemainingAttempts",
            },
            on: {
                LOADING_SUCCESS: {
                    target: "entering",
                    actions: ["assignConfiguredPinToContext", "assignRemainingAttemptsToContext"],
                },
                LOADING_FAILURE: {
                    target: "failure",
                },
            },
        },
        entering: {
            on: {
                ENTER_DIGIT: [
                    {
                        target: "validating",
                        guard: "isPinEntered",
                        actions: "appendDigitToPin",
                    },
                    {
                        actions: "appendDigitToPin",
                    },
                ],
                REMOVE_DIGIT: {
                    actions: "removeDigitFromPin",
                },
            },
        },
        validating: {
            after: {
                "150": [
                    {
                        target: "success",
                        guard: "isPinValid",
                    },
                    {
                        target: "failure",
                        guard: "isRemainingAttemptsLimitReached",
                    },
                    {
                        target: "entering",
                        actions: ["clearPin", "decrementRemainingAttempts", "saveRemainingAttemptsToStorage"],
                    },
                ],
            },
        },
        success: {
            type: "final",
            entry: ["removeRemainingAttemptsFromStorage", "onSuccess"],
        },
        failure: {
            type: "final",
            entry: ["removeConfiguredPinFromStorage", "removeRemainingAttemptsFromStorage", "onFailure"],
        },
    },
});
