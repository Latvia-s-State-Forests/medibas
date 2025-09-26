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
          center: GeoJSON.Position;
          zoom: number;
          bounds: number[][];
          minZoom: number;
          maxZoom: number;
          pinVisible?: boolean;
          alternativePin?: boolean;
          features?: Array<"select">;
      }
    | {
          type: "setPosition";
          center: GeoJSON.Position;
          zoom?: number;
          animated?: boolean;
      }
    | {
          type: "toggleLayer";
          activeLayers: string[];
      }
    | {
          type: "toggleLineDrawMode";
          active: boolean;
      }
    | {
          type: "togglePolygonDrawMode";
          active: boolean;
      }
    | {
          type: "clearDrawings";
      }
    | {
          type: "clearCurrentLineDrawing";
      }
    | {
          type: "clearCurrentPolygonDrawing";
      }
    | {
          type: "displaySavedLine";
          coordinates: number[][];
          lineId: string;
          name: string;
          shouldZoom: boolean;
      }
    | {
          type: "displaySavedPolygon";
          coordinates: number[][];
          polygonId: string;
          name: string;
          shouldZoom: boolean;
      }
    | {
          type: "finishCurrentDrawing";
      }
    | {
          type: "toggleLine";
          lineId: string;
          visible: boolean;
      }
    | {
          type: "togglePolygon";
          polygonId: string;
          visible: boolean;
      }
    | {
          type: "setLocation";
          action: "disable";
      }
    | {
          type: "setLocation";
          action: "update";
          center: { position: GeoJSON.Position; accuracy?: number };
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
          activeDistrictIds: number[] | undefined;
      }
    | {
          type: "deselectFeatures";
      }
    | {
          type: "selectIndividualFeature";
          feature: Feature & {
              featureType:
                  | "damages"
                  | "observations"
                  | "district-damages"
                  | "district-hunted-others"
                  | "district-hunted-red-deer"
                  | "district-hunted-moose"
                  | "district-hunted-roe-deer"
                  | "district-hunted-boar"
                  | "district-infrastructures"
                  | "district-hunted-others-unlimited";
          };
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
          center: GeoJSON.Position;
          zoom: number | undefined;
      }
    | {
          type: "FEATURE_SELECTED";
          selected: SelectedFeature[];
      }
    | {
          type: "LINE_DRAWN";
          coordinates: GeoJSON.Position[];
          lineId: string;
      }
    | {
          type: "LINE_MODIFIED";
          coordinates: GeoJSON.Position[];
          lineId: string;
      }
    | {
          type: "LINE_UPDATED";
          coordinates: GeoJSON.Position[];
          lineId: string;
      }
    | { type: "POLYGON_MODIFIED"; coordinates: GeoJSON.Position[]; polygonId: string }
    | {
          type: "DRAWINGS_CLEARED";
      }
    | {
          type: "POLYGON_DRAWN";
          coordinates: GeoJSON.Position[];
          polygonId: string;
      }
    | {
          type: "DRAWING_HAS_MULTIPLE_POINTS";
      }
    | {
          type: "DRAWING_HAS_FIRST_POINT";
      };
