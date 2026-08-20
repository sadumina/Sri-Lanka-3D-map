"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Aperture,
  CloudRain,
  Droplets,
  Home,
  Layers,
  MapPinned,
  Mountain,
  Pause,
  Play,
  Radar,
  SunMoon,
  Waves,
  X,
} from "lucide-react";
import { districtLabels, floodHazards, landslideHazards, riverPaths } from "../lib/hazardData";
import type { HazardCollection, HazardProperties, RiskLevel } from "../lib/hazardTypes";
import { districtRisk } from "../lib/decisionSupportData";

type CesiumModule = typeof import("cesium");
type Viewer = import("cesium").Viewer;
type CustomDataSource = import("cesium").CustomDataSource;
type TerrainProvider = import("cesium").TerrainProvider;
type Cesium3DTileset = import("cesium").Cesium3DTileset;

type LayerState = {
  flood: boolean;
  landslide: boolean;
  google3d: boolean;
  terrain: boolean;
  labels: boolean;
  pulses: boolean;
  rivers: boolean;
};

const riskWeight: Record<RiskLevel, number> = {
  low: 0.7,
  medium: 0.95,
  high: 1.2,
  extreme: 1.45,
};

const riskColors: Record<RiskLevel, string> = {
  low: "#3df0a1",
  medium: "#ffe45c",
  high: "#ff8a3d",
  extreme: "#ff2f68",
};

const hazardAccent = {
  flood: "#19c8ff",
  landslide: "#ff7247",
};

const sriLankaBounds = {
  west: 79.45,
  south: 5.75,
  east: 82.15,
  north: 9.95,
};

const sriLankaOutline = [
  [79.72, 9.78],
  [80.03, 9.68],
  [80.28, 9.42],
  [80.52, 9.08],
  [80.74, 8.7],
  [81.05, 8.54],
  [81.34, 8.32],
  [81.58, 7.92],
  [81.86, 7.42],
  [81.82, 6.96],
  [81.62, 6.48],
  [81.28, 6.08],
  [80.88, 5.98],
  [80.48, 5.92],
  [80.02, 6.02],
  [79.78, 6.24],
  [79.68, 6.66],
  [79.72, 7.08],
  [79.82, 7.56],
  [79.76, 8.02],
  [79.82, 8.58],
  [79.72, 9.12],
  [79.72, 9.78],
];

const tourStops = [
  {
    title: "Sri Lanka National View",
    subtitle: "Locked showcase view focused only on Sri Lanka.",
    destination: { lon: 80.72, lat: 7.45, height: 520000 },
    orientation: { heading: 0, pitch: -70, roll: 0 },
  },
  {
    title: "Nuwara Eliya Highlands",
    subtitle: "Landslide-prone DS divisions: Kothmale, Ambagamuwa, and Walapane.",
    destination: { lon: 80.68, lat: 6.97, height: 145000 },
    orientation: { heading: 22, pitch: -52, roll: 0 },
  },
  {
    title: "Kelani River Corridor",
    subtitle: "Flood exposure from Colombo through Gampaha to the Kegalle foothills.",
    destination: { lon: 80.08, lat: 6.94, height: 175000 },
    orientation: { heading: 18, pitch: -48, roll: 0 },
  },
  {
    title: "Kalu River Corridor",
    subtitle: "Flood exposure from Kalutara upstream to Ratnapura, Sri Lanka's classic flood city.",
    destination: { lon: 80.2, lat: 6.63, height: 180000 },
    orientation: { heading: 335, pitch: -51, roll: 0 },
  },
];

function createBoundarySource(Cesium: CesiumModule) {
  const source = new Cesium.CustomDataSource("Sri Lanka Boundary");
  const positions = sriLankaOutline.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat, 2600));

  source.entities.add({
    name: "Sri Lanka Area of Interest",
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(positions),
      height: 80,
      material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString("#021019").withAlpha(0.14)),
      outline: false,
    },
    polyline: {
      positions,
      width: 4,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.22,
        taperPower: 0.7,
        color: Cesium.Color.fromCssColorString("#bff8ff"),
      }),
      clampToGround: false,
    },
  });

  source.entities.add({
    position: Cesium.Cartesian3.fromDegrees(80.73, 7.75, 420000),
    label: {
      text: "SRI LANKA",
      font: "900 32px Inter, sans-serif",
      fillColor: Cesium.Color.WHITE.withAlpha(0.96),
      outlineColor: Cesium.Color.BLACK.withAlpha(0.72),
      outlineWidth: 5,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });

  return source;
}

function createRiverSource(Cesium: CesiumModule) {
  const source = new Cesium.CustomDataSource("Rivers");

  riverPaths.forEach(({ name, positions }) => {
    const points = positions.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat, 900));
    const [midLon, midLat] = positions[Math.floor(positions.length / 2)];

    source.entities.add({
      name: `${name} River`,
      polyline: {
        positions: points,
        width: 5,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.28,
          taperPower: 0.55,
          color: Cesium.Color.fromCssColorString(hazardAccent.flood),
        }),
        clampToGround: false,
      },
    });

    source.entities.add({
      position: Cesium.Cartesian3.fromDegrees(midLon, midLat, 1200),
      label: {
        text: `${name} River`,
        font: "700 13px Inter, sans-serif",
        fillColor: Cesium.Color.fromCssColorString("#bff1ff"),
        outlineColor: Cesium.Color.BLACK.withAlpha(0.85),
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -14),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
  });

  return source;
}

function applyHazardStyle(Cesium: CesiumModule, source: CustomDataSource) {
  source.entities.values.forEach((entity) => {
    const properties = entity.properties?.getValue(Cesium.JulianDate.now()) as HazardProperties | undefined;
    if (!entity.polygon || !properties) return;

    const color = Cesium.Color.fromCssColorString(riskColors[properties.riskLevel]);
    entity.polygon.material = new Cesium.ColorMaterialProperty(
      color.withAlpha(properties.hazardType === "flood" ? 0.34 : 0.42),
    );
    entity.polygon.outline = new Cesium.ConstantProperty(true);
    entity.polygon.outlineColor = new Cesium.ConstantProperty(color.withAlpha(0.95));
    entity.polygon.height = new Cesium.ConstantProperty(1800);
    entity.polygon.extrudedHeight = new Cesium.ConstantProperty(properties.hazardType === "flood" ? 120 : 620);
  });
}

function polygonCenter(feature: HazardCollection["features"][number]) {
  const ring = feature.geometry.coordinates[0];
  const total = ring.reduce(
    (current, coordinate) => ({
      lon: current.lon + coordinate[0],
      lat: current.lat + coordinate[1],
    }),
    { lon: 0, lat: 0 },
  );
  return {
    lon: total.lon / ring.length,
    lat: total.lat / ring.length,
  };
}

function createPulseSource(Cesium: CesiumModule) {
  const source = new Cesium.CustomDataSource("Animated Risk Signals");
  const features = [...floodHazards.features, ...landslideHazards.features];
  const now = Date.now();

  features.forEach((feature, index) => {
    const properties = feature.properties;
    const center = polygonCenter(feature);
    const color = Cesium.Color.fromCssColorString(hazardAccent[properties.hazardType]);
    const size = 5500 * riskWeight[properties.riskLevel];
    const phase = index * 0.34;

    const pulseAlpha = new Cesium.CallbackProperty(() => {
      const t = (Date.now() - now) / 1000 + phase;
      return color.withAlpha(0.14 + Math.sin(t * 2.3) * 0.08);
    }, false);

    const pulseMajorAxis = new Cesium.CallbackProperty(() => {
      const t = (Date.now() - now) / 1000 + phase;
      return size * (1.05 + Math.sin(t * 2.3) * 0.18);
    }, false);

    source.entities.add({
      position: Cesium.Cartesian3.fromDegrees(center.lon, center.lat, 1800),
      ellipse: {
        semiMajorAxis: pulseMajorAxis,
        semiMinorAxis: size * 0.78,
        height: 1800,
        material: new Cesium.ColorMaterialProperty(pulseAlpha),
        outline: false,
      },
      point: {
        pixelSize: properties.riskLevel === "extreme" ? 13 : 10,
        color,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.9),
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label:
        properties.riskLevel === "extreme"
          ? {
              text: `${properties.locality ?? properties.district} ${properties.hazardType}`,
              font: "800 13px Inter, sans-serif",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK.withAlpha(0.9),
              outlineWidth: 4,
              pixelOffset: new Cesium.Cartesian2(0, -30),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
          : undefined,
      description: `${properties.locality ?? properties.district}: ${properties.riskLevel} ${
        properties.hazardType
      } risk, ${Math.round(properties.confidence * 100)}% confidence`,
    });
  });

  return source;
}

async function loadHazardSource(
  Cesium: CesiumModule,
  collection: HazardCollection,
  name: string,
): Promise<CustomDataSource> {
  const source = await Cesium.GeoJsonDataSource.load(collection, {
    clampToGround: true,
    strokeWidth: 3,
  });
  source.name = name;
  applyHazardStyle(Cesium, source);
  return source;
}

export default function SriLankaHazardMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const cesiumRef = useRef<CesiumModule | null>(null);
  const sourcesRef = useRef<{
    flood?: CustomDataSource;
    landslide?: CustomDataSource;
    labels?: CustomDataSource;
    pulses?: CustomDataSource;
    boundary?: CustomDataSource;
    rivers?: CustomDataSource;
  }>({});
  const terrainProviderRef = useRef<TerrainProvider | null>(null);
  const googleTilesetRef = useRef<Cesium3DTileset | null>(null);
  const tourTimerRef = useRef<number | null>(null);
  const google3dKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_3D_API_KEY;
  const [layers, setLayers] = useState<LayerState>({
    flood: true,
    landslide: true,
    google3d: true,
    terrain: true,
    labels: true,
    pulses: true,
    rivers: true,
  });
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [tourIndex, setTourIndex] = useState(0);
  const [tourActive, setTourActive] = useState(false);
  const [status, setStatus] = useState("Loading terrain");
  const [selected, setSelected] = useState<HazardProperties | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
    return () => {
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const metrics = useMemo(
    () => ({
      floodZones: floodHazards.features.length,
      landslideZones: landslideHazards.features.length,
      maxConfidence: Math.max(
        ...floodHazards.features.map((item) => item.properties.confidence),
        ...landslideHazards.features.map((item) => item.properties.confidence),
      ),
    }),
    [],
  );

  const flyToStop = useCallback((index: number, duration = 4.5) => {
    const Cesium = cesiumRef.current;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer) return;

    const stop = tourStops[index];
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        stop.destination.lon,
        stop.destination.lat,
        stop.destination.height,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(stop.orientation.heading),
        pitch: Cesium.Math.toRadians(stop.orientation.pitch),
        roll: Cesium.Math.toRadians(stop.orientation.roll),
      },
      duration,
    });
    setTourIndex(index);
  }, []);

  const enforceSriLankaView: () => void = useCallback(() => {
    const Cesium = cesiumRef.current;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer) return;

    const cameraPosition = viewer.camera.positionCartographic;
    const lon = Cesium.Math.toDegrees(cameraPosition.longitude);
    const lat = Cesium.Math.toDegrees(cameraPosition.latitude);
    const outside =
      lon < sriLankaBounds.west ||
      lon > sriLankaBounds.east ||
      lat < sriLankaBounds.south ||
      lat > sriLankaBounds.north ||
      cameraPosition.height > 980000;

    if (outside) {
      flyToStop(0, 1.2);
    }
  }, [flyToStop]);

  useEffect(() => {
    let destroyed = false;

    async function initialize() {
      if (!containerRef.current || viewerRef.current) return;

      const Cesium = await import("cesium");
      if (destroyed) return;

      cesiumRef.current = Cesium;
      const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      if (token) {
        Cesium.Ion.defaultAccessToken = token;
      }
      if (google3dKey) {
        Cesium.GoogleMaps.defaultApiKey = google3dKey;
      }

      const viewer = new Cesium.Viewer(containerRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        selectionIndicator: true,
        timeline: false,
      });

      viewerRef.current = viewer;
      viewer.scene.highDynamicRange = true;
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#02070b");
      viewer.scene.postProcessStages.fxaa.enabled = true;
      const bloom = viewer.scene.postProcessStages.bloom;
      bloom.enabled = true;
      bloom.uniforms.glowOnly = false;
      bloom.uniforms.contrast = 132;
      bloom.uniforms.brightness = -0.2;
      bloom.uniforms.delta = 1.25;
      bloom.uniforms.sigma = 2.8;
      bloom.uniforms.stepSize = 4.5;
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#071016");
      viewer.scene.globe.showGroundAtmosphere = true;
      viewer.scene.fog.enabled = true;
      viewer.scene.fog.density = 0.00022;
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
      }
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 25000;
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 980000;

      if (google3dKey) {
        try {
          Cesium.RequestScheduler.requestsByServer["tile.googleapis.com:443"] = 18;
          const tileset = await Cesium.createGooglePhotorealistic3DTileset(
            {
              key: google3dKey,
              onlyUsingWithGoogleGeocoder: true,
            },
            {
              showCreditsOnScreen: true,
              maximumScreenSpaceError: 8,
              dynamicScreenSpaceError: true,
              dynamicScreenSpaceErrorDensity: 0.002,
              dynamicScreenSpaceErrorFactor: 24,
              skipLevelOfDetail: true,
            },
          );
          viewer.scene.primitives.add(tileset);
          googleTilesetRef.current = tileset;
          viewer.scene.globe.show = false;
          setStatus("Google Photorealistic 3D active");
        } catch {
          viewer.scene.globe.show = true;
          setStatus("Google 3D unavailable; using Cesium fallback");
        }
      }

      try {
        if (token && !google3dKey) {
          terrainProviderRef.current = await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
            requestVertexNormals: true,
            requestWaterMask: true,
          });
          viewer.terrainProvider = terrainProviderRef.current;
        }
      } catch {
        setStatus("Token missing or terrain unavailable");
      }

      const [flood, landslide] = await Promise.all([
        loadHazardSource(Cesium, floodHazards, "Demo Flood Risk"),
        loadHazardSource(Cesium, landslideHazards, "Demo Landslide Risk"),
      ]);
      viewer.dataSources.add(flood);
      viewer.dataSources.add(landslide);
      sourcesRef.current.flood = flood;
      sourcesRef.current.landslide = landslide;

      const boundary = createBoundarySource(Cesium);
      viewer.dataSources.add(boundary);
      sourcesRef.current.boundary = boundary;

      const rivers = createRiverSource(Cesium);
      viewer.dataSources.add(rivers);
      sourcesRef.current.rivers = rivers;

      const pulses = createPulseSource(Cesium);
      viewer.dataSources.add(pulses);
      sourcesRef.current.pulses = pulses;

      const labels = new Cesium.CustomDataSource("District Labels");
      districtLabels.forEach((label) => {
        labels.entities.add({
          position: Cesium.Cartesian3.fromDegrees(label.lon, label.lat, 8500),
          label: {
            text: label.name,
            font: "700 15px Inter, sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
            outlineWidth: 3,
            pixelOffset: new Cesium.Cartesian2(0, -22),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          point: {
            pixelSize: 9,
            color: Cesium.Color.fromCssColorString("#37e8ff"),
            outlineColor: Cesium.Color.WHITE.withAlpha(0.85),
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          description: label.note,
        });
      });
      viewer.dataSources.add(labels);
      sourcesRef.current.labels = labels;

      viewer.selectedEntityChanged.addEventListener((entity) => {
        const properties = entity?.properties?.getValue(Cesium.JulianDate.now()) as
          | HazardProperties
          | undefined;
        setSelected(properties ?? null);
      });

      flyToStop(0, 2.6);
      viewer.camera.changed.addEventListener(enforceSriLankaView);
      if (!google3dKey) {
        setStatus(token ? "Cesium ion terrain active" : "Demo mode: add Cesium ion token for terrain");
      }
    }

    initialize();

    return () => {
      destroyed = true;
      if (tourTimerRef.current) {
        window.clearInterval(tourTimerRef.current);
      }
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.camera.changed.removeEventListener(enforceSriLankaView);
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
    };
  }, [flyToStop]);

  useEffect(() => {
    if (sourcesRef.current.flood) sourcesRef.current.flood.show = layers.flood;
    if (sourcesRef.current.landslide) sourcesRef.current.landslide.show = layers.landslide;
    if (sourcesRef.current.labels) sourcesRef.current.labels.show = layers.labels;
    if (sourcesRef.current.pulses) sourcesRef.current.pulses.show = layers.pulses;
    if (sourcesRef.current.rivers) sourcesRef.current.rivers.show = layers.rivers;
    if (googleTilesetRef.current) googleTilesetRef.current.show = layers.google3d;

    const Cesium = cesiumRef.current;
    const viewer = viewerRef.current;
    if (viewer && googleTilesetRef.current) {
      viewer.scene.globe.show = !layers.google3d;
    }
    if (Cesium && viewer && !googleTilesetRef.current && !layers.terrain) {
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    } else if (!googleTilesetRef.current && viewer && terrainProviderRef.current) {
      viewer.terrainProvider = terrainProviderRef.current;
    }
  }, [layers]);

  useEffect(() => {
    if (!tourActive) {
      if (tourTimerRef.current) {
        window.clearInterval(tourTimerRef.current);
        tourTimerRef.current = null;
      }
      return;
    }

    flyToStop(tourIndex, 3.5);
    tourTimerRef.current = window.setInterval(() => {
      setTourIndex((current) => {
        const next = (current + 1) % tourStops.length;
        flyToStop(next, 4.5);
        return next;
      });
    }, 6200);

    return () => {
      if (tourTimerRef.current) {
        window.clearInterval(tourTimerRef.current);
        tourTimerRef.current = null;
      }
    };
  }, [flyToStop, tourActive, tourIndex]);

  const toggleLayer = (key: keyof LayerState) => {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  };

  const Controls = (
    <>
      <div className="panel-section">
        <div className="panel-header">
          <p className="panel-title">Layers</p>
          <Layers size={18} aria-hidden />
        </div>
        <div className="control-stack">
          {[
            ["flood", "Flood Risk", "Kelani & Kalu river corridor zones", Waves],
            ["landslide", "Landslide Risk", "Nuwara Eliya DS-division slope risk", Mountain],
            ["rivers", "Rivers", "Kelani & Kalu river paths", Droplets],
            ["pulses", "Risk Signals", "Animated cinematic hotspot beacons", Radar],
            ["labels", "District Labels", "Presentation callout markers", Activity],
            ["google3d", "3D Detail", "Photorealistic detail when API access is available", Aperture],
          ].map(([key, label, hint, Icon]) => (
            <div className="control-row" key={key as string}>
              <div className="control-label">
                <strong>
                  {typeof Icon !== "string" ? <Icon size={15} aria-hidden /> : null} {label as string}
                </strong>
                <span>{hint as string}</span>
              </div>
              <button
                className={`toggle ${layers[key as keyof LayerState] ? "is-on" : ""}`}
                onClick={() => toggleLayer(key as keyof LayerState)}
                aria-label={`Toggle ${label}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-header">
          <p className="panel-title">Risk Legend</p>
          <CloudRain size={18} aria-hidden />
        </div>
        <div className="legend">
          {(Object.entries(riskColors) as Array<[RiskLevel, string]>).map(([risk, color]) => (
            <div className="legend-item" key={risk}>
              <span>{risk.toUpperCase()}</span>
              <span className="swatch" style={{ color, background: color }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <main className={`map-shell ${theme}`}>
      <div ref={containerRef} className="cesium-host" />
      <section className="hud" aria-label="Sri Lanka 3D hazard controls">
        <aside className="panel">
          <div className="brand-row">
            <div>
              <p className="eyebrow">Sri Lanka Only</p>
              <h1>Flood & Landslide Prediction Map</h1>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/" className="icon-button" aria-label="Back to home" title="Back to home">
                <Home size={20} />
              </Link>
              <button
                className="icon-button"
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                aria-label="Switch theme"
                title="Switch theme"
              >
                <SunMoon size={20} />
              </button>
            </div>
          </div>
          <p className="panel-copy">
            A focused case-study showcase: landslide risk mapped only across Nuwara Eliya&apos;s
            highest-risk DS divisions (Kothmale, Ambagamuwa, Walapane), and flood risk mapped along
            the Kelani and Kalu river corridors.
          </p>

          <div className="metric-grid">
            <div className="metric">
              <div className="metric-row">
                <Waves size={15} aria-hidden /> Flood zones
              </div>
              <strong>{metrics.floodZones}</strong>
            </div>
            <div className="metric">
              <div className="metric-row">
                <Mountain size={15} aria-hidden /> Landslides
              </div>
              <strong>{metrics.landslideZones}</strong>
            </div>
            <div className="metric">
              <div className="metric-row">
                <Activity size={15} aria-hidden /> Confidence
              </div>
              <strong>{Math.round(metrics.maxConfidence * 100)}%</strong>
            </div>
            <div className="metric">
              <div className="metric-row">
                <MapPinned size={15} aria-hidden /> Focus
              </div>
              <strong>Highlands + 2 Rivers</strong>
            </div>
          </div>

          <div className="showcase-strip">
            <div>
              <Aperture size={16} aria-hidden />
              Nuwara Eliya · Kelani · Kalu
            </div>
            <strong>3D showcase</strong>
          </div>

          {Controls}

          <div className="panel-section">
            <button className="tour-button" onClick={() => setTourActive((current) => !current)}>
              {tourActive ? <Pause size={18} /> : <Play size={18} />}
              {tourActive ? "Pause tour" : "Start presentation tour"}
            </button>
            <div className="tour-row">
              <span>{tourStops[tourIndex].title}</span>
              <span className="progress" style={{ "--progress": `${((tourIndex + 1) / tourStops.length) * 100}%` } as React.CSSProperties}>
                <span />
              </span>
            </div>
            <p className="panel-copy">{tourStops[tourIndex].subtitle}</p>
          </div>

          <div className="notice">
            <AlertTriangle size={17} aria-hidden />
            Demo data only. Visual quality is presentation-ready, not operational guidance.
          </div>
        </aside>

        <div className="chip-row">
          <div className="chip">
            <MapPinned size={16} aria-hidden /> Sri Lanka
          </div>
          <div className="chip">
            <Activity size={16} aria-hidden /> {status}
          </div>
        </div>
      </section>

      <section className="mobile-dock" aria-label="Mobile hazard controls">
        <div className="brand-row">
          <div>
            <p className="eyebrow">Sri Lanka Only</p>
            <h1>Hazard Prediction</h1>
          </div>
          <button className="icon-button" onClick={() => setTourActive((current) => !current)} aria-label="Toggle tour">
            {tourActive ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <div className="metric-row">
              <Waves size={14} aria-hidden /> Flood
            </div>
            <strong>{metrics.floodZones}</strong>
          </div>
          <div className="metric">
            <div className="metric-row">
              <Mountain size={14} aria-hidden /> Landslide
            </div>
            <strong>{metrics.landslideZones}</strong>
          </div>
          <div className="metric">
            <div className="metric-row">
              <Activity size={14} aria-hidden /> Confidence
            </div>
            <strong>{Math.round(metrics.maxConfidence * 100)}%</strong>
          </div>
        </div>
        {Controls}
      </section>

      {selected ? (
        <aside className={`detail-panel risk-${selected.riskLevel}`} aria-label="Hazard zone detail">
          <button className="detail-panel-close" onClick={() => setSelected(null)} aria-label="Close detail panel">
            <X size={16} />
          </button>
          <p className="eyebrow">
            {selected.hazardType === "flood" ? "Flood zone" : "Landslide zone"} · {selected.district} District
          </p>
          <h2>{selected.locality ?? selected.district}</h2>
          <div className="detail-panel-row">
            <span>Risk level</span>
            <strong className={`risk-pill risk-${selected.riskLevel}`}>{selected.riskLevel.toUpperCase()}</strong>
          </div>
          <div className="detail-panel-row">
            <span>Model confidence</span>
            <strong>{Math.round(selected.confidence * 100)}%</strong>
          </div>
          <div className="detail-panel-action">
            <p className="detail-panel-action-label">Recommended action</p>
            <p>
              {districtRisk.find((entry) => entry.district === selected.district)?.recommendedAction ??
                "Monitor conditions; no active alert."}
            </p>
          </div>
          <Link href="/dashboard" className="detail-panel-link">
            Open full decision support view
          </Link>
        </aside>
      ) : null}
    </main>
  );
}
