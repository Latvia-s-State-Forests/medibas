import { Position } from "geojson";
import { Feature } from "./features";

export enum MapPane {
    Basemap = "basemapPane",
    Layer = "layerPane",
}

export type MapPosition = {
    center: Position;
    zoom: number;
};

interface MapServiceBase {
    id: string;
    title?: string;
    thumbnail: string;
    minZoom?: number;
    maxZoom?: number;
}

export interface MapServiceWmsTiled extends MapServiceBase {
    type: "WmsTiled";
    url: string;
    layers: string[];
    time?: string;
    imageFormat?: string;
    transparent?: boolean;
    maxNativeZoom?: number;
}

export interface MapServiceAgsTiled extends MapServiceBase {
    type: "AgsTiled";
    url: string;
    maxNativeZoom?: number;
}

export interface MapServiceAgsDynamic extends MapServiceBase {
    type: "AgsDynamic";
    url: string;
}

export interface MapServiceWmtsTiled extends MapServiceBase {
    type: "Wmts";
    url: string;
    layer: string;
    imageFormat?: string;
    matrixSet: string;
    style?: string;
}

export interface MapServiceCustom extends MapServiceBase {
    type: "Custom";
    id:
        | "observations"
        | "damages"
        | "district-damages"
        | "districts"
        | "district-hunted-others"
        | "district-infrastructures"
        | "district-hunted-red-deer"
        | "district-hunted-moose"
        | "district-hunted-roe-deer"
        | "district-hunted-boar";
}

export interface MapServiceCustomWithFeatures extends MapServiceCustom {
    features: Feature[];
}

export type MapService =
    | MapServiceWmsTiled
    | MapServiceAgsTiled
    | MapServiceAgsDynamic
    | MapServiceWmtsTiled
    | MapServiceCustom;

/**
 * These types are used for the map layer selection
 */

interface MapServiceGroupBase {
    id: string;
    title: string;
    services: string[];
    isBasemapServiceGroup?: boolean;
}

export interface MapServiceGroupSingle extends MapServiceGroupBase {
    /**
     * One service at a time can be checked, but cannot be unchecked
     */
    selectionMode: "single";
    defaultService: string;
}

export interface MapServiceGroupSingleCheckable extends MapServiceGroupBase {
    /**
     * One service at a time can be checked, can be unchecked
     */
    selectionMode: "single-checkable";
    defaultService?: string;
}

export interface MapServiceGroupMultiple extends MapServiceGroupBase {
    /**
     * One or more services can be checked at the same time, can be unchecked
     */
    selectionMode: "multiple";
    defaultServices?: string[];
}

export type MapServiceGroup = MapServiceGroupSingle | MapServiceGroupSingleCheckable | MapServiceGroupMultiple;
