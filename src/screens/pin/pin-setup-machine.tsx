import { assign, setup } from "xstate";
import { configuration } from "~/configuration";
import { logger } from "~/logger";
import { setPin } from "~/utils/secure-storage";

type PinSetupEvent = { type: "ENTER_DIGIT"; digit: number } | { type: "REMOVE_DIGIT" };

export const pinSetupMachine = setup({
    types: {
        context: {} as { length: number; pin: string; pinConfirmation: string },
        events: {} as PinSetupEvent,
    },
    guards: {
        isPinCompleted: ({ context, event }) => {
            if (event.type !== "ENTER_DIGIT") {
                return false;
            }
            return context.pin.length + 1 === context.length;
        },
        isPinMatch: ({ context }) => {
            return context.pin === context.pinConfirmation;
        },
        isPinConfirmationCompleted: ({ context, event }) => {
            if (event.type !== "ENTER_DIGIT") {
                return false;
            }
            return context.pinConfirmation.length + 1 === context.length;
        },
    },
    actions: {
        appendDigitToPin: assign({
            pin: ({ context, event }) => (event.type === "ENTER_DIGIT" ? context.pin + event.digit : context.pin),
        }),
        removeDigitFromPin: assign({
            pin: ({ context }) => context.pin.slice(0, -1),
        }),
        appendDigitToPinConfirmation: assign({
            pinConfirmation: ({ context, event }) =>
                event.type === "ENTER_DIGIT" ? context.pinConfirmation + event.digit : context.pinConfirmation,
        }),
        removeDigitFromPinConfirmation: assign({
            pinConfirmation: ({ context }) => context.pinConfirmation.slice(0, -1),
        }),
        savePinToStorage: ({ context }) => {
            setPin(context.pin).catch((error) => {
                logger.error("Failed to save pin to storage", error);
            });
        },
    },
}).createMachine({
    id: "pinSetup",
    initial: "entering",
    context: {
        length: configuration.pin.pinLength,
        pin: "",
        pinConfirmation: "",
    },
    states: {
        entering: {
            initial: "active",
            states: {
                active: {
                    on: {
                        ENTER_DIGIT: [
                            {
                                target: "waitingForLastDigitToAppear",
                                guard: "isPinCompleted",
                                actions: ["appendDigitToPin"],
                            },
                            { actions: ["appendDigitToPin"] },
                        ],
                        REMOVE_DIGIT: {
                            actions: ["removeDigitFromPin"],
                        },
                    },
                },
                waitingForLastDigitToAppear: {
                    after: {
                        150: "#pinSetup.confirming",
                    },
                },
            },
        },
        confirming: {
            initial: "active",
            states: {
                active: {
                    on: {
                        ENTER_DIGIT: [
                            {
                                target: "comparing",
                                guard: "isPinConfirmationCompleted",
                                actions: ["appendDigitToPinConfirmation"],
                            },
                            { actions: ["appendDigitToPinConfirmation"] },
                        ],
                        REMOVE_DIGIT: {
                            actions: ["removeDigitFromPinConfirmation"],
                        },
                    },
                },
                comparing: {
                    after: {
                        150: [
                            {
                                target: "#pinSetup.success",
                                guard: "isPinMatch",
                            },
                            {
                                target: "#pinSetup.failure",
                            },
                        ],
                    },
                },
            },
        },
        success: {
            type: "final",
            entry: ["savePinToStorage"],
        },
        failure: { type: "final" },
    },
});
