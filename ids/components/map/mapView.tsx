"use client";

import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/theme-provider";

import { LoadAircraft } from "./loadAircraft";
import {RoutePlanner} from "@/components/map/routePlotter";
import type {Feature} from "geojson";


export function MapView() {
    const { theme } = useTheme();
    const initialized = useRef(false);
    const mapRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);

    const [mapReady, setMapReady] = useState(false);
    //const [showTraffic, setShowTraffic] = useState(true);
    //const [showSectors, setShowSectors] = useState(true);
    //const [showTracons, setShowTracons] = useState(true);

    const artccLayerRef = useRef<L.LayerGroup | null>(null);
    //const traconLayerRef = useRef<L.LayerGroup | null>(null);

    //const [radius, setRadius] = useState<number>(400);
    //const [pendingRadius, setPendingRadius] = useState<number>(radius);
    //const [filterGround, setFilterGround] = useState(true);

   // const [open, setOpen] = useState(false);

    //function onConfirm() {
    //    setRadius(pendingRadius);
    //    setOpen(false);
    //}

    //function onDisregard() {
    //    setPendingRadius(radius);
    //    setOpen(false);
    //}

    const normalize = (id: string | undefined) => (id ?? "").replace(/^K/, "").trim().toUpperCase();

    const loadSectors = async (L: typeof import("leaflet"), map: L.Map) => {
        if (!map) return;

        try {
            const [artccGeo, controllerData] = await Promise.all([
                fetch("/boundaries.geojson").then(res => res.json()), // ARTCCs
                //fetch("/tracon.geojson").then(res => res.json()),    // TRACONs
                fetch("/api/ids/controllers").then(res => res.json()),
            ]);

            const activeArtccs = new Set(controllerData.enroute.map((ctrl: any) => normalize(ctrl.artccId)));

            console.log(activeArtccs);

            // --- ARTCC Layers ---
            const artccFeatures = artccGeo.features;

            const artccActive = artccFeatures.filter((f: Feature) =>
                activeArtccs.has(normalize(f.properties?.id))
            );

            const artccInactive = artccFeatures.filter((f: Feature) =>
                !activeArtccs.has(normalize(f.properties?.id))
            );

            const inactiveArtccLayer = L.geoJSON(artccInactive, {
                pane: "artccPane",
                style: { color: "#808080", weight: 1, fillOpacity: 0.1 },
            });
            const activeArtccLayer = L.geoJSON(artccActive, {
                pane: "artccPane",
                style: { color: "#00cc44", weight: 1, fillOpacity: 0.2 },
            });
            const newArtccLayer = L.layerGroup([inactiveArtccLayer, activeArtccLayer]);


            // Remove old layers if present
            if (artccLayerRef.current) map.removeLayer(artccLayerRef.current);

            artccLayerRef.current = newArtccLayer;

            newArtccLayer.addTo(map);

        } catch (error) {
            console.error("Error loading sectors:", error);
        }
    };

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        const mapContainer = document.getElementById("map");
        if (!mapContainer) return; // DOM not ready

        if (mapRef.current) return;

        let intervalId: number;

        import("leaflet").then((LModule) => {
            const L = LModule;

            const map = L.map(mapContainer).setView([41.5346, -80.6708], 6);
            mapRef.current = map;

            map.createPane("artccPane").style.zIndex = "400";
            map.createPane("aircraftPane").style.zIndex = "650";
            map.createPane("routePane").style.zIndex = "1000";
            map.getPane("tooltipPane")!.style.zIndex = "2000";

            const tileLayer = L.tileLayer(getTileUrl(theme), {
                attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: "abcd",
                maxZoom: 19,
            });
            tileLayer.addTo(map);
            tileLayerRef.current = tileLayer;

            loadSectors(L, map);
            setMapReady(true);

            intervalId = window.setInterval(() => loadSectors(L, map), 60 * 1000); // <-- window.setInterval
        });

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);


    useEffect(() => {
        if (tileLayerRef.current) tileLayerRef.current.setUrl(getTileUrl(theme));
    }, [theme]);


    return (
        <div className="relative z-0">


            <div id="map" className="h-[700px] w-full rounded-lg" />

            {mapReady && mapRef.current && (
                <>
                    <LoadAircraft map={mapRef.current} />
                    <div className="mt-6">
                        <RoutePlanner map={mapRef.current} />
                    </div>
                </>
            )}
        </div>
    );
}

function getTileUrl(theme: string | undefined) {
    return theme === "light"
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
}
