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
};

export const Map = React.forwardRef<MapHandle, MapProps>(
    ({ onLoad, onLoadEnd, onMapDragged, onViewPositionChanged, onFeaturesSelected }, ref) => {
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

            if (message.type === "MAP_DRAGGED" && onMapDragged) {
                onMapDragged();
            }
            if (message.type === "VIEW_POSITION_CHANGED") {
                onViewPositionChanged && onViewPositionChanged(message.center, message.zoom);
            }
            if (message.type === "FEATURE_SELECTED") {
                onFeaturesSelected && onFeaturesSelected(message.selected);
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
