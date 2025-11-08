export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserLocation {
  id: string;
  name: string;
  coordinates: Coordinates;
  timestamp: Date;
  accuracy?: number;
}

export interface LocationUpdate {
  userId: string;
  coordinates: Coordinates;
  timestamp: Date;
}