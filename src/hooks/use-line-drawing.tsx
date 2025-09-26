import { useSelector } from "@xstate/react";
import * as React from "react";
import { MapHandle } from "~/components/map/map";
import { usePreviousValue } from "~/hooks/use-previous-value";
import { useShapesContext } from "~/hooks/use-shapes";

export function useLineDrawing(mapRef: React.RefObject<MapHandle | null>) {
    const { actor } = useShapesContext();
    const [savedLineCoords, setSavedLineCoords] = React.useState<number[][]>([]);
    const [savedLine, setSavedLine] = React.useState<string>("");
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [hasRestored, setHasRestored] = React.useState(false);

    const savedLines = useSelector(actor, ({ context }) => context.savedLines);
    const visibleLines = useSelector(actor, ({ context }) => context.visibleLines);
    const previousVisibleLines = usePreviousValue(visibleLines);

    const onLineDrawn = React.useCallback((coordinates: number[][], lineId: string) => {
        setSavedLineCoords(coordinates);
        setSavedLine(lineId);
    }, []);

    const onLineModified = React.useCallback((coordinates: number[][], lineId: string) => {
        setSavedLineCoords(coordinates);
        setSavedLine(lineId);
    }, []);

    const startLineDraw = React.useCallback(() => {
        setSavedLineCoords([]);
        setSavedLine("");
        mapRef.current?.sendAction({
            type: "toggleLineDrawMode",
            active: true,
        });
    }, [mapRef]);

    const deleteLine = React.useCallback(() => {
        mapRef.current?.sendAction({
            type: "clearCurrentLineDrawing",
        });
    }, [mapRef]);

    const displayLine = React.useCallback(
        (lineData: { id: string; coordinates: number[][]; name: string }, shouldZoom: boolean = false) => {
            if (!lineData || !lineData.coordinates || lineData.coordinates.length === 0) {
                return;
            }
            mapRef.current?.sendAction({
                type: "displaySavedLine",
                coordinates: lineData.coordinates,
                lineId: lineData.id,
                name: lineData.name,
                shouldZoom,
            });
        },
        [mapRef]
    );

    const saveLine = React.useCallback(
        (shapeName: string) => {
            const newLine = {
                coordinates: savedLineCoords,
                lineId: savedLine,
                name: shapeName,
            };

            // Add line to state machine (this will also save to storage and set visibility)
            actor.send({
                type: "ADD_SAVED_LINE",
                line: newLine,
            });

            // Display the newly saved line with zoom
            const lineData = {
                id: savedLine,
                name: shapeName,
                coordinates: savedLineCoords,
            };
            displayLine(lineData, true);

            mapRef.current?.sendAction({
                type: "clearCurrentLineDrawing",
            });
            mapRef.current?.sendAction({
                type: "toggleLineDrawMode",
                active: false,
            });

            setSavedLineCoords([]);
            setSavedLine("");
        },
        [savedLineCoords, savedLine, mapRef, actor, displayLine]
    );

    const clearLineDraw = React.useCallback(
        (polygonCoords: number[][], polygonId: string) => {
            // If a polygon was being drawn, clear it
            if (polygonCoords.length > 0 && polygonId) {
                mapRef.current?.sendAction({
                    type: "clearCurrentPolygonDrawing",
                });
            }
        },
        [mapRef]
    );

    React.useEffect(() => {
        if (!mapLoaded || !hasRestored) {
            return;
        }

        // Compare visibleLines and previousVisibleLines to find changes
        const currentLineIds = new Set(Object.keys(visibleLines));
        const previousLineIds = new Set(Object.keys(previousVisibleLines));

        // Find added lines (present in current but not in previous)
        const addedLines = Array.from(currentLineIds).filter(
            (lineId) => !previousLineIds.has(lineId) && visibleLines[lineId]
        );

        // Find removed lines (present in previous but not in current)
        const removedLines = Array.from(previousLineIds).filter(
            (lineId) => !currentLineIds.has(lineId) && previousVisibleLines[lineId]
        );

        // Find visibility changes (present in both but visibility changed)
        const visibilityChanges = Array.from(currentLineIds).filter(
            (lineId) => previousLineIds.has(lineId) && visibleLines[lineId] !== previousVisibleLines[lineId]
        );

        // Handle added lines - display them
        addedLines.forEach((lineId) => {
            const line = savedLines.find((l) => l.lineId === lineId);
            if (line) {
                const lineData = {
                    id: lineId,
                    name: line.name,
                    coordinates: line.coordinates,
                };
                displayLine(lineData, false);
            }
        });

        // Handle removed lines - hide them
        removedLines.forEach((lineId) => {
            mapRef.current?.sendAction({
                type: "toggleLine",
                lineId,
                visible: false,
            });
        });

        // Handle visibility changes
        visibilityChanges.forEach((lineId) => {
            const isVisible = visibleLines[lineId];

            if (isVisible) {
                // Line became visible - display it
                const savedLine = savedLines.find((savedLine) => savedLine.lineId === lineId);
                if (savedLine) {
                    const lineData = {
                        id: lineId,
                        name: savedLine.name,
                        coordinates: savedLine.coordinates,
                    };
                    displayLine(lineData, false);
                }
            } else {
                // Line became hidden - hide it
                mapRef.current?.sendAction({
                    type: "toggleLine",
                    lineId,
                    visible: false,
                });
            }
        });
    }, [visibleLines, previousVisibleLines, mapRef, mapLoaded, hasRestored, savedLines, displayLine]);

    // Restore visible lines when map loads (only once)
    React.useEffect(() => {
        if (!mapLoaded || hasRestored) {
            return;
        }

        // Use setTimeout to ensure map is fully initialized
        const timeoutId = setTimeout(() => {
            savedLines.forEach((line) => {
                const lineId = line.lineId;
                if (visibleLines[lineId]) {
                    const lineData = {
                        id: lineId,
                        name: line.name,
                        coordinates: line.coordinates,
                    };
                    displayLine(lineData, false);
                }
            });

            setHasRestored(true);
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [mapLoaded, savedLines, visibleLines, displayLine, hasRestored]);

    // Keep the restoreVisibleLines method for layer changes
    const restoreVisibleLines = React.useCallback(() => {
        if (!mapLoaded) {
            return;
        }

        savedLines.forEach((line) => {
            const lineId = line.lineId;
            if (visibleLines[lineId]) {
                const lineData = {
                    id: lineId,
                    name: line.name,
                    coordinates: line.coordinates,
                };
                displayLine(lineData, false); // Don't zoom for layer restoration
            }
        });
    }, [mapLoaded, savedLines, visibleLines, displayLine]);

    const onMapLoaded = React.useCallback(() => {
        setMapLoaded(true);
    }, []);

    return {
        savedLineCoords,
        savedLine,
        onLineDrawn,
        onLineModified,
        startLineDraw,
        deleteLine,
        saveLine,
        displayLine,
        clearLineDraw,
        onMapLoaded,
        restoreVisibleLines,
    };
}
