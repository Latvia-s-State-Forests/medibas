import { MapHandle } from "~/components/map/map";
import { configuration } from "~/configuration";
import { MapService } from "~/types/map";

export async function initializeMap(
    mapRef: React.RefObject<MapHandle | null>,
    latitude: number,
    longitude: number,
    layers: MapService[],
    activeLayerIds?: string[]
) {
    const { bounds, minZoom, maxZoom } = configuration.map;

    mapRef.current?.sendAction({
        type: "initialize",
        mode: "location",
        layers,
        activeLayerIds: activeLayerIds ?? ["lvm-forest-map"],
        center: [longitude, latitude],
        zoom: 16,
        bounds,
        minZoom,
        maxZoom,
        locationPinEnabled: true,
    });

    mapRef.current?.sendAction({
        type: "setLocation",
        action: "update",
        center: { position: [longitude, latitude] },
        follow: true,
        animated: false,
    });
}
