export type SeverityLevel = 'low' | 'medium' | 'high';
export type LanePosition = 'left' | 'center' | 'right';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Pothole {
  id: string;
  location: GeoLocation;
  severity: SeverityLevel;
  lanePosition: LanePosition;
  description: string;
  reportedAt: string;
  reportedBy: string;
  resolved: boolean;
}

export interface PotholeAlert {
  pothole: Pothole;
  distance: number;
  timestamp: string;
}
