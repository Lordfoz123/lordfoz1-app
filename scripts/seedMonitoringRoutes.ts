import { db } from '@/services/firebase';
import { MonitoringPoint, Route } from '@/types/route.types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// Puntos de monitoreo de ejemplo
const MONITORING_POINTS_DATA: Omit<MonitoringPoint, 'id'>[] = [
  // AIRE
  {
    name: 'Estación CA-01',
    address: 'Av. Arequipa 1234, Miraflores, Lima',
    location: { latitude: -12.1191, longitude: -77.0349 },
    matrix: 'air',
    status: 'pending',
    sequence: 1,
    monitoringData: {
      parameters: ['PM2.5', 'PM10', 'CO2', 'SO2'],
      equipment: 'Analizador de partículas AP-100',
      observations: 'Zona de alta densidad vehicular',
    },
  },
  {
    name: 'Estación CA-02',
    address: 'Jr. Lampa 850, Cercado de Lima',
    location: { latitude: -12.0464, longitude: -77.0428 },
    matrix: 'air',
    status: 'pending',
    sequence: 2,
    monitoringData: {
      parameters: ['NO2', 'O3', 'CO', 'VOCs'],
      equipment: 'Analizador de gases AG-200',
      observations: 'Centro histórico, tráfico moderado',
    },
  },
  {
    name: 'Estación CA-03',
    address: 'Av. La Marina 2000, San Miguel, Lima',
    location: { latitude: -12.0776, longitude: -77.0870 },
    matrix: 'air',
    status: 'pending',
    sequence: 3,
    monitoringData: {
      parameters: ['PM2.5', 'PM10', 'CO2'],
      equipment: 'Analizador portátil AP-50',
      observations: 'Zona industrial cercana',
    },
  },

  // AGUA
  {
    name: 'Punto MA-01',
    address: 'Río Rímac - Puente Santa Rosa, Cercado de Lima',
    location: { latitude: -12.0546, longitude: -77.0230 },
    matrix: 'water',
    status: 'pending',
    sequence: 4,
    monitoringData: {
      parameters: ['pH', 'Turbidez', 'DBO', 'Coliformes'],
      equipment: 'Multiparámetro HI-9829',
      sampleId: 'MA-01-20251022',
      observations: 'Aguas arriba de descarga industrial',
    },
  },
  {
    name: 'Punto MA-02',
    address: 'Playa La Herradura, Chorrillos, Lima',
    location: { latitude: -12.1642, longitude: -77.0114 },
    matrix: 'water',
    status: 'pending',
    sequence: 5,
    monitoringData: {
      parameters: ['pH', 'DQO', 'Metales pesados', 'Aceites y grasas'],
      equipment: 'Multiparámetro HI-9829',
      sampleId: 'MA-02-20251022',
      observations: 'Monitoreo de agua de mar',
    },
  },

  // SUELO
  {
    name: 'Punto MS-01',
    address: 'Parque Reducto N°2, Miraflores, Lima',
    location: { latitude: -12.1208, longitude: -77.0278 },
    matrix: 'soil',
    status: 'pending',
    sequence: 6,
    monitoringData: {
      parameters: ['pH', 'Materia orgánica', 'Metales pesados'],
      equipment: 'Kit de muestreo de suelos',
      sampleId: 'MS-01-20251022',
      observations: 'Área verde urbana',
    },
  },
  {
    name: 'Punto MS-02',
    address: 'Zona industrial Callao, Av. Argentina km 8',
    location: { latitude: -12.0219, longitude: -77.1147 },
    matrix: 'soil',
    status: 'pending',
    sequence: 7,
    monitoringData: {
      parameters: ['Hidrocarburos', 'Metales pesados', 'pH'],
      equipment: 'Kit de muestreo de suelos',
      sampleId: 'MS-02-20251022',
      observations: 'Suelo industrial, posible contaminación',
    },
  },

  // SALUD OCUPACIONAL
  {
    name: 'Oficinas SO-01',
    address: 'Torre Central, Av. Javier Prado 5500, La Molina',
    location: { latitude: -12.0833, longitude: -76.9667 },
    matrix: 'occupational-health',
    status: 'pending',
    sequence: 8,
    monitoringData: {
      parameters: ['Ruido', 'Iluminación', 'Temperatura', 'Ventilación'],
      equipment: 'Sonómetro + Luxómetro + Termómetro',
      observations: 'Evaluación ergonómica de oficinas',
    },
  },
  {
    name: 'Planta SO-02',
    address: 'Planta Industrial Villa El Salvador, Lima',
    location: { latitude: -12.2042, longitude: -76.9369 },
    matrix: 'occupational-health',
    status: 'pending',
    sequence: 9,
    monitoringData: {
      parameters: ['Ruido', 'EPPs', 'Ergonomía', 'Ventilación'],
      equipment: 'Sonómetro + Check list EPPs',
      observations: 'Zona de producción, alto nivel de ruido',
    },
  },
];

const generateMonitoringRoutes = (userId: string): Omit<Route, 'id'>[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [
    {
      name: 'Monitoreo Integral Zona Norte',
      description: 'Ruta completa con todas las matrices en zona norte de Lima',
      status: 'pending',
      priority: 'high',
      monitoringPoints: [
        { ...MONITORING_POINTS_DATA[0], id: '1', sequence: 1 },
        { ...MONITORING_POINTS_DATA[1], id: '2', sequence: 2 },
        { ...MONITORING_POINTS_DATA[3], id: '3', sequence: 3 },
        { ...MONITORING_POINTS_DATA[7], id: '4', sequence: 4 },
      ],
      totalPoints: 4,
      completedPoints: 0,
      matrixStats: {
        air: 2,
        water: 1,
        soil: 0,
        'occupational-health': 1,
      },
      assignedTo: userId,
      createdBy: userId,
      totalDistance: 15.2,
      estimatedTime: 180,
      createdAt: today,
      updatedAt: today,
      scheduledDate: today,
    },
    {
      name: 'Calidad de Aire - Lima Centro',
      description: 'Monitoreo de calidad de aire en puntos estratégicos del centro',
      status: 'in-progress',
      priority: 'high',
      monitoringPoints: [
        { ...MONITORING_POINTS_DATA[0], id: '5', sequence: 1, status: 'completed', completedAt: new Date() },
        { ...MONITORING_POINTS_DATA[1], id: '6', sequence: 2, status: 'pending' },
        { ...MONITORING_POINTS_DATA[2], id: '7', sequence: 3, status: 'pending' },
      ],
      totalPoints: 3,
      completedPoints: 1,
      matrixStats: {
        air: 3,
        water: 0,
        soil: 0,
        'occupational-health': 0,
      },
      assignedTo: userId,
      createdBy: userId,
      totalDistance: 8.5,
      estimatedTime: 120,
      createdAt: today,
      updatedAt: today,
      scheduledDate: today,
    },
    {
      name: 'Calidad de Agua - Costa Verde',
      description: 'Monitoreo de calidad de agua en puntos costeros y fluviales',
      status: 'pending',
      priority: 'medium',
      monitoringPoints: [
        { ...MONITORING_POINTS_DATA[3], id: '8', sequence: 1 },
        { ...MONITORING_POINTS_DATA[4], id: '9', sequence: 2 },
      ],
      totalPoints: 2,
      completedPoints: 0,
      matrixStats: {
        air: 0,
        water: 2,
        soil: 0,
        'occupational-health': 0,
      },
      assignedTo: userId,
      createdBy: userId,
      totalDistance: 12.3,
      estimatedTime: 90,
      createdAt: today,
      updatedAt: today,
      scheduledDate: tomorrow,
    },
    {
      name: 'Suelos - Zona Industrial Callao',
      description: 'Muestreo de suelos en áreas industriales',
      status: 'pending',
      priority: 'medium',
      monitoringPoints: [
        { ...MONITORING_POINTS_DATA[5], id: '10', sequence: 1 },
        { ...MONITORING_POINTS_DATA[6], id: '11', sequence: 2 },
      ],
      totalPoints: 2,
      completedPoints: 0,
      matrixStats: {
        air: 0,
        water: 0,
        soil: 2,
        'occupational-health': 0,
      },
      assignedTo: userId,
      createdBy: userId,
      totalDistance: 6.8,
      estimatedTime: 75,
      createdAt: today,
      updatedAt: today,
      scheduledDate: tomorrow,
    },
    {
      name: 'Salud Ocupacional - Evaluación Empresarial',
      description: 'Evaluación de condiciones laborales en oficinas y plantas',
      status: 'pending',
      priority: 'low',
      monitoringPoints: [
        { ...MONITORING_POINTS_DATA[7], id: '12', sequence: 1 },
        { ...MONITORING_POINTS_DATA[8], id: '13', sequence: 2 },
      ],
      totalPoints: 2,
      completedPoints: 0,
      matrixStats: {
        air: 0,
        water: 0,
        soil: 0,
        'occupational-health': 2,
      },
      assignedTo: userId,
      createdBy: userId,
      totalDistance: 18.5,
      estimatedTime: 150,
      createdAt: today,
      updatedAt: today,
      scheduledDate: tomorrow,
    },
  ];
};

export const seedMonitoringRoutes = async (userId: string): Promise<boolean> => {
  try {
    console.log('🌱 Iniciando seed de rutas de monitoreo...');

    const routes = generateMonitoringRoutes(userId);
    const routesCollection = collection(db, 'routes');

    for (const route of routes) {
      const docRef = await addDoc(routesCollection, {
        ...route,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Ruta creada: ${route.name} (${docRef.id})`);
    }

    console.log(`✅ Seed completado: ${routes.length} rutas creadas`);
    return true;
  } catch (error) {
    console.error('❌ Error en seed:', error);
    return false;
  }
};