import { StopReasonKey } from '@/components/StopTrackingSheet';

type TrackingStopEvent = {
  userId: string | null;
  reason: StopReasonKey;
  note?: string;
  battery?: { level?: number | null; state?: string };
  timestamp: number;
  workStatus?: string;
};

export async function recordTrackingStop(event: TrackingStopEvent) {
  // Reemplaza con tu backend (Firebase/REST/etc.)
  // Ejemplo Firestore:
  // await addDoc(collection(db, 'trackingStops'), event);
  console.log('[tracking:stop]', event);
}