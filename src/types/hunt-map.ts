import { Position } from "geojson";
import { District } from "./districts";
import { Feature } from "./features";
import { MapService, MapServiceCustomWithFeatures } from "./map";

export type SelectedFeature = { id: string | number; layer: string };

export type WebMapAction =
    | {
          type: "initialize";
          mode: "user" | "marker" | "location";
          locationPinEnabled?: boolean;
          layers: MapService[];
          activeLayerIds: string[];
          activeDistrict?: number;
          center: Position;
          zoom: number;
          bounds: number[][];
          minZoom: number;
          maxZoom: number;
          pinVisible?: boolean;
          alternativePin?: boolean;
          mapMarker?: boolean;
          features?: Array<"select">;
      }
    | {
          type: "setPosition";
          center: Position;
          zoom?: number;
          animated?: boolean;
      }
    | {
          type: "toggleLayer";
          activeLayers: string[];
      }
    | {
          type: "setLocation";
          action: "disable";
      }
    | {
          type: "setLocation";
          action: "update";
          center: { position: Position; accuracy?: number };
          follow: boolean;
          animated: boolean;
      }
    | {
          type: "setFeatures";
          features: MapServiceCustomWithFeatures[];
      }
    | {
          type: "setDistricts";
          districts: District[];
          activeDistrictId: number | undefined;
      }
    | {
          type: "deselectFeatures";
      }
    | {
          type: "getMarkerPosition";
      }
    | {
          type: "selectIndividualFeature";
          feature: Feature & { featureType: "damages" | "observations" | "district-damages" };
      }
    | {
          type: "showFeatures";
      }
    | {
          type: "setHeading";
          heading: number;
      };

export type WebMapEvent =
    | {
          type: "MAP_DRAGGED";
      }
    | {
          type: "VIEW_POSITION_CHANGED";
          center: Position;
          zoom: number | undefined;
      }
    | {
          type: "FEATURE_SELECTED";
          selected: SelectedFeature[];
      }
    | {
          type: "MARKER_POSITION";
          position: Position;
      };
