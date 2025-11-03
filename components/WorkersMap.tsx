import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const WorkersMap = () => {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    
    useEffect(() => {
        // Placeholder for real-time worker data fetching
        const fetchWorkers = () => {
            // Fetch worker data from API or WebSocket
            // setWorkers(updatedData);
        };
        fetchWorkers();
        const interval = setInterval(fetchWorkers, 5000); // Fetch every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <MapView style={{ flex: 1 }}>
                {workers.map((worker) => (
                    <Marker
                        key={worker.id}
                        coordinate={worker.location}
                        title={worker.name}
                        onPress={() => setSelectedWorker(worker)}
                    />
                ))}
            </MapView>
            {selectedWorker && (
                <View style={{ position: 'absolute', bottom: 0, backgroundColor: 'white', padding: 10 }}>
                    <Text>{`Worker: ${selectedWorker.name}`}</Text>
                    <Text>{`Status: ${selectedWorker.status}`}</Text>
                    <Button title="Close" onPress={() => setSelectedWorker(null)} />
                </View>
            )}
        </View>
    );
};

export default WorkersMap;
