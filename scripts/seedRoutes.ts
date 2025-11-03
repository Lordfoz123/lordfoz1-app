import RouteService from '../services/RouteService';
import { CreateRouteInput } from '../types/route.types';

export async function seedRoutes(userId: string) {
  console.log('🌱 Sembrando rutas de prueba...');

  const routes: CreateRouteInput[] = [
    {
      name: 'Ruta Centro - Miraflores',
      description: 'Entregas en zona céntrica',
      assignedTo: userId,
      priority: 'high',
      points: [
        {
          address: 'Av. Larco 1301, Miraflores',
          latitude: -12.1217,
          longitude: -77.0295,
          order: 0,
          contactName: 'Juan Pérez',
          contactPhone: '+51 987 654 321',
        },
        {
          address: 'Av. Pardo 610, Miraflores',
          latitude: -12.1197,
          longitude: -77.0318,
          order: 1,
          contactName: 'María García',
          contactPhone: '+51 987 654 322',
        },
        {
          address: 'Av. Benavides 1555, Miraflores',
          latitude: -12.1180,
          longitude: -77.0345,
          order: 2,
          contactName: 'Carlos López',
          contactPhone: '+51 987 654 323',
        },
      ],
    },
    {
      name: 'Ruta San Isidro',
      description: 'Zona empresarial',
      assignedTo: userId,
      priority: 'medium',
      points: [
        {
          address: 'Av. Javier Prado Este 492, San Isidro',
          latitude: -12.0931,
          longitude: -77.0324,
          order: 0,
          contactName: 'Ana Martínez',
          contactPhone: '+51 987 654 324',
        },
        {
          address: 'Av. República de Panamá 3591, San Isidro',
          latitude: -12.1028,
          longitude: -77.0335,
          order: 1,
          contactName: 'Luis Rodríguez',
          contactPhone: '+51 987 654 325',
        },
      ],
    },
    {
      name: 'Ruta Surco',
      description: 'Entregas residenciales',
      assignedTo: userId,
      priority: 'low',
      points: [
        {
          address: 'Av. Primavera 1050, Surco',
          latitude: -12.1397,
          longitude: -76.9942,
          order: 0,
        },
        {
          address: 'Av. El Polo 670, Surco',
          latitude: -12.1345,
          longitude: -76.9921,
          order: 1,
        },
        {
          address: 'Av. Caminos del Inca 257, Surco',
          latitude: -12.1425,
          longitude: -76.9975,
          order: 2,
        },
        {
          address: 'Av. La Encalada 1420, Surco',
          latitude: -12.1502,
          longitude: -76.9812,
          order: 3,
        },
      ],
    },
    {
      name: 'Ruta Express Centro',
      description: 'Entregas urgentes',
      assignedTo: userId,
      priority: 'high',
      points: [
        {
          address: 'Jr. de la Unión 500, Lima Centro',
          latitude: -12.0464,
          longitude: -77.0428,
          order: 0,
          contactName: 'Pedro Sánchez',
          contactPhone: '+51 987 654 326',
        },
        {
          address: 'Av. Nicolás de Piérola 1020, Lima',
          latitude: -12.0562,
          longitude: -77.0365,
          order: 1,
        },
      ],
    },
    {
      name: 'Ruta Lima Norte',
      description: 'Independencia y Los Olivos',
      assignedTo: userId,
      priority: 'medium',
      points: [
        {
          address: 'Av. Túpac Amaru 210, Independencia',
          latitude: -11.9889,
          longitude: -77.0608,
          order: 0,
        },
        {
          address: 'Av. Universitaria 1801, Los Olivos',
          latitude: -11.9753,
          longitude: -77.0777,
          order: 1,
        },
        {
          address: 'Av. Alfredo Mendiola 3698, Los Olivos',
          latitude: -11.9625,
          longitude: -77.0521,
          order: 2,
        },
      ],
    },
  ];

  try {
    for (const routeInput of routes) {
      const routeId = await RouteService.createRoute(routeInput);
      console.log(`✅ ${routeInput.name} creada (ID: ${routeId})`);
    }
    console.log('🎉 Todas las rutas de prueba fueron creadas');
    return true;
  } catch (error) {
    console.error('❌ Error al crear rutas:', error);
    return false;
  }
}