import { assign, setup } from "xstate";
import { UserStorage } from "~/user-storage";

type SavedShapesMachineContext = {
    visibleLines: Record<string, boolean>;
    visiblePolygons: Record<string, boolean>;
    savedLines: Array<{ lineId: string; name: string; coordinates: number[][] }>;
    savedPolygons: Array<{ polygonId: string; name: string; coordinates: number[][] }>;
    userStorage?: UserStorage;
};

type SavedShapesMachineEvent =
    | { type: "LOAD_VISIBILITY" }
    | {
          type: "DISPLAY_SAVED_LINE";
          lineId: string;
          visible: boolean;
          lineData?: { id: string; name: string; coordinates: number[][] };
          isManualToggle?: boolean;
          shouldZoom?: boolean;
      }
    | {
          type: "DISPLAY_SAVED_POLYGON";
          polygonId: string;
          visible: boolean;
          polygonData?: { id: string; name: string; coordinates: number[][] };
          isManualToggle?: boolean;
          shouldZoom?: boolean;
      }
    | { type: "DELETE_SAVED_LINE"; lineId: string }
    | { type: "DELETE_SAVED_POLYGON"; polygonId: string }
    | { type: "ADD_SAVED_LINE"; line: { lineId: string; name: string; coordinates: number[][] } }
    | { type: "ADD_SAVED_POLYGON"; polygon: { polygonId: string; name: string; coordinates: number[][] } };

export const shapesMachine = setup({
    types: {
        context: {} as SavedShapesMachineContext,
        events: {} as SavedShapesMachineEvent,
        input: {} as { userStorage: UserStorage },
    },
    actions: {
        loadAllData: assign(({ context }) => {
            const storedVisibleLines = context.userStorage?.getLinesVisibility() || {};
            const storedVisiblePolygons = context.userStorage?.getPolygonsVisibility() || {};
            const savedLines = context.userStorage?.getSavedLines() || [];
            const savedPolygons = context.userStorage?.getSavedPolygons() || [];

            return {
                ...context,
                visibleLines: storedVisibleLines,
                visiblePolygons: storedVisiblePolygons,
                savedLines: Array.isArray(savedLines) ? savedLines : [],
                savedPolygons: Array.isArray(savedPolygons) ? savedPolygons : [],
            };
        }),
        toggleSavedLine: assign({
            visibleLines: ({ context, event }) => {
                if (event.type !== "DISPLAY_SAVED_LINE") {
                    return context.visibleLines;
                }

                const newVisibleLines = {
                    ...context.visibleLines,
                    [event.lineId]: event.visible,
                };

                context.userStorage?.setLinesVisibility(newVisibleLines);

                return newVisibleLines;
            },
        }),
        deleteSavedLine: assign({
            visibleLines: ({ context, event }) => {
                if (event.type !== "DELETE_SAVED_LINE") {
                    return context.visibleLines;
                }
                const { [event.lineId]: _, ...rest } = context.visibleLines;
                context.userStorage?.setLinesVisibility(rest);
                return rest;
            },
            savedLines: ({ context, event }) => {
                if (event.type !== "DELETE_SAVED_LINE") {
                    return context.savedLines;
                }
                const updatedLines = context.savedLines.filter((line) => line.lineId !== event.lineId);
                context.userStorage?.setSavedLines(updatedLines);
                return updatedLines;
            },
        }),
        toggleSavedPolygon: assign({
            visiblePolygons: ({ context, event }) => {
                if (event.type !== "DISPLAY_SAVED_POLYGON") {
                    return context.visiblePolygons;
                }

                const newVisiblePolygons = {
                    ...context.visiblePolygons,
                    [event.polygonId]: event.visible,
                };

                context.userStorage?.setPolygonsVisibility(newVisiblePolygons);

                return newVisiblePolygons;
            },
        }),
        deleteSavedPolygon: assign({
            visiblePolygons: ({ context, event }) => {
                if (event.type !== "DELETE_SAVED_POLYGON") {
                    return context.visiblePolygons;
                }
                const { [event.polygonId]: _, ...rest } = context.visiblePolygons;
                context.userStorage?.setPolygonsVisibility(rest);
                return rest;
            },
            savedPolygons: ({ context, event }) => {
                if (event.type !== "DELETE_SAVED_POLYGON") {
                    return context.savedPolygons;
                }
                const updatedPolygons = context.savedPolygons.filter(
                    (polygon) => polygon.polygonId !== event.polygonId
                );
                context.userStorage?.setSavedPolygons(updatedPolygons);
                return updatedPolygons;
            },
        }),
        addSavedLine: assign({
            savedLines: ({ context, event }) => {
                if (event.type !== "ADD_SAVED_LINE") {
                    return context.savedLines;
                }
                const updatedLines = [...context.savedLines, event.line];
                context.userStorage?.setSavedLines(updatedLines);
                return updatedLines;
            },
            visibleLines: ({ context, event }) => {
                if (event.type !== "ADD_SAVED_LINE") {
                    return context.visibleLines;
                }
                const newVisibleLines = {
                    ...context.visibleLines,
                    [event.line.lineId]: true,
                };
                context.userStorage?.setLinesVisibility(newVisibleLines);
                return newVisibleLines;
            },
        }),
        addSavedPolygon: assign({
            savedPolygons: ({ context, event }) => {
                if (event.type !== "ADD_SAVED_POLYGON") {
                    return context.savedPolygons;
                }
                const updatedPolygons = [...context.savedPolygons, event.polygon];
                context.userStorage?.setSavedPolygons(updatedPolygons);
                return updatedPolygons;
            },
            visiblePolygons: ({ context, event }) => {
                if (event.type !== "ADD_SAVED_POLYGON") {
                    return context.visiblePolygons;
                }
                const newVisiblePolygons = {
                    ...context.visiblePolygons,
                    [event.polygon.polygonId]: true,
                };
                context.userStorage?.setPolygonsVisibility(newVisiblePolygons);
                return newVisiblePolygons;
            },
        }),
    },
}).createMachine({
    context: ({ input }) => ({
        visibleLines: {},
        visiblePolygons: {},
        savedLines: [],
        savedPolygons: [],
        userStorage: input.userStorage,
    }),
    id: "savedShapesMachine",
    initial: "ready",
    states: {
        ready: {
            entry: "loadAllData",
            on: {
                DISPLAY_SAVED_LINE: {
                    actions: ["toggleSavedLine"],
                },
                DELETE_SAVED_LINE: {
                    actions: ["deleteSavedLine"],
                },
                DISPLAY_SAVED_POLYGON: {
                    actions: ["toggleSavedPolygon"],
                },
                DELETE_SAVED_POLYGON: {
                    actions: ["deleteSavedPolygon"],
                },
                ADD_SAVED_LINE: {
                    actions: ["addSavedLine"],
                },
                ADD_SAVED_POLYGON: {
                    actions: ["addSavedPolygon"],
                },
            },
        },
    },
});
