import { MapHandle } from "~/components/map/map";
import { configuration } from "~/configuration";

export async function initializeMap(mapRef: React.RefObject<MapHandle>, latitude: number, longitude: number) {
    const { bounds, minZoom, maxZoom, services } = configuration.map;

    const layers = services.filter((service) => service.id === "lvm-forest-map");

    mapRef.current?.sendAction({
        type: "initialize",
        mode: "location",
        layers,
        activeLayerIds: ["lvm-forest-map"],
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
