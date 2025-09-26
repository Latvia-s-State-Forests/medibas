import { useSelector } from "@xstate/react";
import { Asset } from "expo-asset";
import { readAsStringAsync } from "expo-file-system";
import { assign, createActor, fromCallback, setup } from "xstate";
import { logger } from "~/logger";

type MapSource = {
    html: string;
};

export function useMapSource(): MapSource | undefined {
    return useSelector(mapService, (state) => state.context.source);
}

type MapSourceEvent = { type: "LOAD_SUCCESS"; source: MapSource } | { type: "LOAD_FAILURE" };

const mapSourceMachine = setup({
    types: {
        context: {} as {
            source: MapSource | undefined;
        },
        events: {} as MapSourceEvent,
    },
    actions: {
        setSource: assign({
            source: ({ context, event }) => {
                if (event.type !== "LOAD_SUCCESS") {
                    return context.source;
                }
                return event.source;
            },
        }),
    },
    actors: {
        load: fromCallback(({ sendBack }: { sendBack: (event: MapSourceEvent) => void }) => {
            Asset.loadAsync(require("./index.html"))
                .then((assets) => {
                    const localUri = assets?.[0]?.localUri;
                    if (!localUri) {
                        throw new Error("Missing localUri");
                    }
                    return readAsStringAsync(localUri);
                })
                .then((html) => {
                    sendBack({ type: "LOAD_SUCCESS", source: { html } });
                })
                .catch((error) => {
                    logger.error("Failed to load map source", error);
                    sendBack({ type: "LOAD_FAILURE" });
                });
        }),
    },
}).createMachine({
    id: "mapSource",
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
});

const mapService = createActor(mapSourceMachine).start();
