/** Verdan green #48845c */
export const VERDAN_RGB: [number, number, number] = [
  72 / 255,
  132 / 255,
  92 / 255,
];

/** Plantation / field sites (GPS markers on the globe). */
export const GLOBE_GROUND_MARKERS = [
  { location: [15.3255, 75.9688] as [number, number], size: 0.055, color: VERDAN_RGB },
  { location: [19.076, 72.8777] as [number, number], size: 0.05, color: VERDAN_RGB },
  { location: [12.9716, 77.5946] as [number, number], size: 0.048, color: VERDAN_RGB },
  { location: [28.6139, 77.209] as [number, number], size: 0.045, color: VERDAN_RGB },
  { location: [22.5726, 88.3639] as [number, number], size: 0.045, color: VERDAN_RGB },
  { location: [23.8103, 90.4125] as [number, number], size: 0.042, color: VERDAN_RGB },
] as const;

/** Satellite anchor positions (from cobe Satellites showcase). */
export const GLOBE_SATELLITE_MARKERS = [
  { id: "sat-1", location: [45.0, -120.0] as [number, number] },
  { id: "sat-2", location: [30.0, 45.0] as [number, number] },
  { id: "sat-3", location: [-15.0, 100.0] as [number, number] },
  { id: "sat-4", location: [60.0, -30.0] as [number, number] },
  { id: "sat-5", location: [-40.0, -60.0] as [number, number] },
  { id: "sat-6", location: [10.0, 150.0] as [number, number] },
  { id: "sat-7", location: [55.0, 80.0] as [number, number] },
  { id: "sat-8", location: [-25.0, 20.0] as [number, number] },
  { id: "sat-9", location: [70.0, 25.0] as [number, number] },
  { id: "sat-10", location: [-5.0, -75.0] as [number, number] },
] as const;

export const GLOBE_SATELLITE_SIZE = 0.022;
