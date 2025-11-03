// worker.types.ts

type Worker = {
    id: number;
    name: string;
    status: WorkerStatus;
    location: WorkerLocation;
};


type WorkerLocation = {
    latitude: number;
    longitude: number;
    address: string;
};


type WorkerStatus = 'active' | 'inactive' | 'on_leave';


type WorkerLocationUpdate = {
    workerId: number;
    newLocation: WorkerLocation;
};


type WorkerFilter = {
    status?: WorkerStatus;
    location?: WorkerLocation;
};