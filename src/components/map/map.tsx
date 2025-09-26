import * as React from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { SelectedFeature, WebMapAction, WebMapEvent } from "~/types/hunt-map";
import { useMapSource } from "./use-map-source";

export type MapHandle = {
    sendAction: (action: WebMapAction) => void;
};

type MapProps = {
    onLoad: () => void;
    onLoadEnd?: () => void;
    onMapDragged?: () => void;
    onViewPositionChanged?: (center: GeoJSON.Position, zoom: number | undefined) => void;
    onFeaturesSelected?: (features: SelectedFeature[]) => void;
    onLineDrawn?: (coordinates: GeoJSON.Position[], lineId: string) => void;
    onPolygonDrawn?: (coordinates: GeoJSON.Position[], polygonId: string) => void;
    onLineModified?: (coordinates: GeoJSON.Position[], lineId: string) => void;
    onPolygonModified?: (coordinates: GeoJSON.Position[], polygonId: string) => void;
    onMultiplePoints?: (containsMultiplePoints: boolean) => void;
    onFirstPoint?: (hasFirstPoint: boolean) => void;
    onDrawingCleared?: () => void;
};

export const Map = React.forwardRef<MapHandle, MapProps>(
    (
        {
            onLoad,
            onLoadEnd,
            onMapDragged,
            onViewPositionChanged,
            onFeaturesSelected,
            onLineDrawn,
            onPolygonDrawn,
            onLineModified,
            onPolygonModified,
            onMultiplePoints,
            onFirstPoint,
            onDrawingCleared,
        },

        ref
    ) => {
        const webViewRef = React.useRef<WebView>(null);
        const source = useMapSource();

        React.useImperativeHandle(ref, () => {
            return {
                sendAction: (action: WebMapAction) => webViewRef.current?.postMessage(JSON.stringify(action)),
            };
        });

        function onMessage(event: WebViewMessageEvent) {
            console.log("onMessage", event.nativeEvent.data);
            const message = JSON.parse(event.nativeEvent.data) as WebMapEvent;

            if (message.type === "LINE_DRAWN") {
                onLineDrawn && onLineDrawn(message.coordinates, message.lineId);
            }

            if (message.type === "POLYGON_DRAWN") {
                onPolygonDrawn && onPolygonDrawn(message.coordinates, message.polygonId);
            }

            if (message.type === "POLYGON_MODIFIED") {
                onPolygonModified && onPolygonModified(message.coordinates, message.polygonId);
            }

            if (message.type === "LINE_MODIFIED") {
                onLineModified && onLineModified(message.coordinates, message.lineId);
            }

            if (message.type === "DRAWINGS_CLEARED") {
                onDrawingCleared && onDrawingCleared();
            }

            if (message.type === "MAP_DRAGGED" && onMapDragged) {
                onMapDragged();
            }
            if (message.type === "VIEW_POSITION_CHANGED") {
                onViewPositionChanged && onViewPositionChanged(message.center, message.zoom);
            }
            if (message.type === "FEATURE_SELECTED") {
                onFeaturesSelected && onFeaturesSelected(message.selected);
            }
            if (message.type === "DRAWING_HAS_MULTIPLE_POINTS") {
                onMultiplePoints && onMultiplePoints(true);
            }
            if (message.type === "DRAWING_HAS_FIRST_POINT") {
                onFirstPoint && onFirstPoint(true);
            }
        }

        if (!source) {
            return null;
        }

        return (
            <WebView
                nestedScrollEnabled={true}
                ref={webViewRef}
                originWhitelist={["*"]}
                domStorageEnabled
                allowUniversalAccessFromFileURLs
                allowFileAccessFromFileURLs
                allowFileAccess
                mixedContentMode="always"
                source={source}
                onLoad={onLoad}
                onLoadEnd={onLoadEnd}
                onMessage={onMessage}
            />
        );
    }
);

Map.displayName = "Map";
