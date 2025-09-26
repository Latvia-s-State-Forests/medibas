import { useSelector } from "@xstate/react";
import * as React from "react";
import { MapHandle } from "~/components/map/map";
import { usePreviousValue } from "~/hooks/use-previous-value";
import { useShapesContext } from "~/hooks/use-shapes";

export function usePolygonDrawing(mapRef: React.RefObject<MapHandle | null>) {
    const { actor } = useShapesContext();
    const [savedPolygonCoords, setSavedPolygonCoords] = React.useState<number[][]>([]);
    const [savedPolygon, setSavedPolygon] = React.useState<string>("");
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [hasRestored, setHasRestored] = React.useState(false);

    const savedPolygons = useSelector(actor, ({ context }) => context.savedPolygons);
    const visiblePolygons = useSelector(actor, ({ context }) => context.visiblePolygons);
    const previousVisiblePolygons = usePreviousValue(visiblePolygons);

    const onPolygonDrawn = React.useCallback((coordinates: number[][], polygonId: string) => {
        setSavedPolygonCoords(coordinates);
        setSavedPolygon(polygonId);
    }, []);

    const onPolygonModified = React.useCallback((coordinates: number[][], polygonId: string) => {
        setSavedPolygonCoords(coordinates);
        setSavedPolygon(polygonId);
    }, []);

    const startPolygonDraw = React.useCallback(() => {
        setSavedPolygonCoords([]);
        setSavedPolygon("");
        mapRef.current?.sendAction({
            type: "togglePolygonDrawMode",
            active: true,
        });
    }, [mapRef]);

    const deletePolygon = React.useCallback(() => {
        mapRef.current?.sendAction({
            type: "clearCurrentPolygonDrawing",
        });
    }, [mapRef]);

    const displayPolygon = React.useCallback(
        (polygonData: { id: string; coordinates: number[][]; name: string }, shouldZoom: boolean = false) => {
            if (!polygonData || !polygonData.coordinates || polygonData.coordinates.length === 0) {
                return;
            }
            mapRef.current?.sendAction({
                type: "displaySavedPolygon",
                coordinates: polygonData.coordinates,
                polygonId: polygonData.id,
                name: polygonData.name,
                shouldZoom,
            });
        },
        [mapRef]
    );

    const savePolygon = React.useCallback(
        (shapeName: string) => {
            const newPolygon = {
                coordinates: savedPolygonCoords,
                polygonId: savedPolygon,
                name: shapeName,
            };

            actor.send({
                type: "ADD_SAVED_POLYGON",
                polygon: newPolygon,
            });

            const polygonData = {
                id: savedPolygon,
                name: shapeName,
                coordinates: savedPolygonCoords,
            };

            displayPolygon(polygonData, true);

            mapRef.current?.sendAction({
                type: "clearCurrentPolygonDrawing",
            });
            mapRef.current?.sendAction({
                type: "togglePolygonDrawMode",
                active: false,
            });

            setSavedPolygonCoords([]);
            setSavedPolygon("");
        },
        [savedPolygonCoords, savedPolygon, actor, mapRef, displayPolygon]
    );

    const clearPolygonDraw = React.useCallback(
        (lineCoords: number[][], lineId: string) => {
            if (lineCoords.length > 0 && lineId) {
                mapRef.current?.sendAction({
                    type: "clearCurrentLineDrawing",
                });
            }
        },
        [mapRef]
    );

    React.useEffect(() => {
        if (!mapLoaded || !hasRestored) {
            return;
        }

        // Compare visiblePolygons and previousVisiblePolygons to find changes
        const currentPolygonIds = new Set(Object.keys(visiblePolygons));
        const previousPolygonIds = new Set(Object.keys(previousVisiblePolygons));

        // Find added polygons (present in current but not in previous)
        const addedPolygons = Array.from(currentPolygonIds).filter(
            (polygonId) => !previousPolygonIds.has(polygonId) && visiblePolygons[polygonId]
        );

        // Find removed polygons (present in previous but not in current)
        const removedPolygons = Array.from(previousPolygonIds).filter(
            (polygonId) => !currentPolygonIds.has(polygonId) && previousVisiblePolygons[polygonId]
        );

        // Find visibility changes (present in both but visibility changed)
        const visibilityChanges = Array.from(currentPolygonIds).filter(
            (polygonId) =>
                previousPolygonIds.has(polygonId) && visiblePolygons[polygonId] !== previousVisiblePolygons[polygonId]
        );

        // Handle added polygons - display them
        addedPolygons.forEach((polygonId) => {
            const savedPolygon = savedPolygons.find((savedPolygon) => savedPolygon.polygonId === polygonId);
            if (savedPolygon) {
                const polygonData = {
                    id: polygonId,
                    name: savedPolygon.name,
                    coordinates: savedPolygon.coordinates,
                };
                displayPolygon(polygonData, false);
            }
        });

        // Handle removed polygons - hide them
        removedPolygons.forEach((polygonId) => {
            mapRef.current?.sendAction({
                type: "togglePolygon",
                polygonId,
                visible: false,
            });
        });

        // Handle visibility changes
        visibilityChanges.forEach((polygonId) => {
            const isVisible = visiblePolygons[polygonId];

            if (isVisible) {
                // Polygon became visible - display it
                const polygon = savedPolygons.find((p) => p.polygonId === polygonId);
                if (polygon) {
                    const polygonData = {
                        id: polygonId,
                        name: polygon.name,
                        coordinates: polygon.coordinates,
                    };
                    displayPolygon(polygonData, false);
                }
            } else {
                // Polygon became hidden - hide it
                mapRef.current?.sendAction({
                    type: "togglePolygon",
                    polygonId,
                    visible: false,
                });
            }
        });
    }, [visiblePolygons, previousVisiblePolygons, mapRef, mapLoaded, hasRestored, savedPolygons, displayPolygon]);

    // Restore visible polygons when map loads (only once)
    React.useEffect(() => {
        if (!mapLoaded || hasRestored) {
            return;
        }

        // Use setTimeout to ensure map is fully initialized
        const timeoutId = setTimeout(() => {
            savedPolygons.forEach((polygon) => {
                const polygonId = polygon.polygonId;
                if (visiblePolygons[polygonId]) {
                    const polygonData = {
                        id: polygonId,
                        name: polygon.name,
                        coordinates: polygon.coordinates,
                    };
                    displayPolygon(polygonData, false);
                }
            });

            setHasRestored(true);
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [mapLoaded, visiblePolygons, savedPolygons, displayPolygon, hasRestored]);

    // Keep the restoreVisiblePolygons method for layer changes
    const restoreVisiblePolygons = React.useCallback(() => {
        if (!mapLoaded) {
            return;
        }

        savedPolygons.forEach((polygon) => {
            const polygonId = polygon.polygonId;
            if (visiblePolygons[polygonId]) {
                const polygonData = {
                    id: polygonId,
                    name: polygon.name,
                    coordinates: polygon.coordinates,
                };
                displayPolygon(polygonData, false); // Don't zoom for layer restoration
            }
        });
    }, [mapLoaded, savedPolygons, visiblePolygons, displayPolygon]);

    const onMapLoaded = React.useCallback(() => {
        setMapLoaded(true);
    }, []);

    return {
        savedPolygonCoords,
        savedPolygon,
        onPolygonDrawn,
        onPolygonModified,
        startPolygonDraw,
        deletePolygon,
        savePolygon,
        displayPolygon,
        clearPolygonDraw,
        onMapLoaded,
        restoreVisiblePolygons,
    };
}
