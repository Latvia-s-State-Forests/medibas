import { useActor } from "@xstate/react";
import { Asset } from "expo-asset";
import { readAsStringAsync } from "expo-file-system";
import { assign, createMachine, interpret } from "xstate";
import { logger } from "~/logger";

type MapSource = {
    html: string;
};

export function useMapSource(): MapSource | undefined {
    const [state] = useActor(mapService);
    return state.context.source;
}

const mapSourceMachine = createMachine(
    {
        id: "mapSource",
        schema: {
            context: {} as {
                source: MapSource | undefined;
            },
            events: {} as { type: "LOAD_SUCCESS"; source: MapSource } | { type: "LOAD_FAILURE" },
        },
        context: {
            source: undefined,
        },
        initial: "loading",
        states: {
            loading: {
                invoke: { src: "load" },
                on: {
                    LOAD_SUCCESS: { target: "loaded", actions: ["setSource"] },
                    LOAD_FAILURE: { target: "failed" },
                },
            },
            loaded: {
                type: "final",
            },
            failed: {
                type: "final",
            },
        },
        preserveActionOrder: true,
        predictableActionArguments: true,
    },
    {
        actions: {
            setSource: assign({
                source: (context, event) => {
                    if (event.type !== "LOAD_SUCCESS") {
                        return context.source;
                    }

                    return event.source;
                },
            }),
        },
        services: {
            load: () => async (send) => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const assets = await Asset.loadAsync(require("./index.html"));
                    if (!assets?.[0]?.localUri) {
                        logger.error("Failed to load map source, no localUri", assets);
                        send({ type: "LOAD_FAILURE" });
                        return;
                    }

                    const html = await readAsStringAsync(assets[0].localUri);
                    send({ type: "LOAD_SUCCESS", source: { html } });
                } catch (error) {
                    logger.error("Failed to load map source, unexpected error", error);
                    send({ type: "LOAD_FAILURE" });
                }
            },
        },
    }
);

const mapService = interpret(mapSourceMachine).start();
