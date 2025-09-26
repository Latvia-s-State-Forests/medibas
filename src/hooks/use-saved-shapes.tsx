import { useSelector } from "@xstate/react";
import * as React from "react";
import { useShapesContext } from "~/hooks/use-shapes";

export type Lines = {
    coordinates: number[][];
    lineId: string;
    name: string;
};

export type Polygon = {
    coordinates: number[][];
    polygonId: string;
    name: string;
};

export function useSavedShapes() {
    const { actor } = useShapesContext();
    const [lineToDelete, setLineToDelete] = React.useState<string | null>(null);
    const [polygonToDelete, setPolygonToDelete] = React.useState<string | null>(null);

    const savedLines = useSelector(actor, ({ context }) => context.savedLines);
    const savedPolygons = useSelector(actor, ({ context }) => context.savedPolygons);
    const visibleLines = useSelector(actor, ({ context }) => context.visibleLines);
    const visiblePolygons = useSelector(actor, ({ context }) => context.visiblePolygons);

    const lines = React.useMemo(() => {
        return savedLines.map((l) => ({
            id: l.lineId,
            name: l.name,
            coordinates: l.coordinates,
        }));
    }, [savedLines]);

    const polygons = React.useMemo(() => {
        return savedPolygons.map((p) => ({
            id: p.polygonId,
            name: p.name,
            coordinates: p.coordinates,
        }));
    }, [savedPolygons]);

    const toggleLineVisibility = React.useCallback(
        (lineId: string) => {
            const newVisibility = !visibleLines[lineId];

            actor.send({
                type: "DISPLAY_SAVED_LINE",
                lineId,
                visible: newVisibility,
                lineData: lines.find((l) => l.id === lineId),
                isManualToggle: true,
            });
        },
        [actor, visibleLines, lines]
    );

    const zoomToShape = React.useCallback(
        (shapeId: string, shapeType: "line" | "polygon") => {
            if (shapeType === "line") {
                const lineData = lines.find((l) => l.id === shapeId);
                if (!lineData || !visibleLines[shapeId]) {
                    return;
                }

                actor.send({
                    type: "DISPLAY_SAVED_LINE",
                    lineId: shapeId,
                    visible: true,
                    lineData,
                    isManualToggle: true,
                    shouldZoom: true,
                });
            } else {
                const polygonData = polygons.find((p) => p.id === shapeId);
                if (!polygonData || !visiblePolygons[shapeId]) {
                    return;
                }

                actor.send({
                    type: "DISPLAY_SAVED_POLYGON",
                    polygonId: shapeId,
                    visible: true,
                    polygonData,
                    isManualToggle: true,
                    shouldZoom: true,
                });
            }
        },
        [actor, lines, polygons, visibleLines, visiblePolygons]
    );

    const togglePolygonVisibility = React.useCallback(
        (polygonId: string) => {
            const newVisibility = !visiblePolygons[polygonId];
            actor.send({
                type: "DISPLAY_SAVED_POLYGON",
                polygonId,
                visible: newVisibility,
                polygonData: polygons.find((p) => p.id === polygonId),
                isManualToggle: true,
            });
        },
        [actor, visiblePolygons, polygons]
    );

    const deleteLine = React.useCallback(
        (lineId: string | null) => {
            if (!lineId) {
                return;
            }

            // Always send removal action to map, regardless of current visibility
            actor.send({
                type: "DISPLAY_SAVED_LINE",
                lineId,
                visible: false,
                lineData: lines.find((l) => l.id === lineId),
            });

            actor.send({ type: "DELETE_SAVED_LINE", lineId });
        },
        [actor, lines]
    );

    const deletePolygon = React.useCallback(
        (polygonId: string | null) => {
            if (!polygonId) {
                return;
            }

            // Always send removal action to map, regardless of current visibility
            actor.send({
                type: "DISPLAY_SAVED_POLYGON",
                polygonId,
                visible: false,
                polygonData: polygons.find((p) => p.id === polygonId),
            });

            actor.send({ type: "DELETE_SAVED_POLYGON", polygonId });
        },
        [actor, polygons]
    );

    return {
        lines,
        polygons,
        visibleLines,
        visiblePolygons,
        lineToDelete,
        polygonToDelete,
        setLineToDelete,
        setPolygonToDelete,
        toggleLineVisibility,
        zoomToShape,
        togglePolygonVisibility,
        deleteLine,
        deletePolygon,
    };
}
