import RouteService from '../services/RouteService';
import { CreateRouteInput } from '../types/route.types';

export async function createTestRoutes(userId: string) {
  const testRoutes: CreateRouteInput[] = [
    {
      name: 'Ruta Centro',
      description: 'Entregas en el centro de la ciudad',
      assignedTo: userId,
      priority: 'high',
      points: [
        {
          address: 'Av. Arequipa 2080, Lima',
          latitude: -12.0897,
          longitude: -77.0439,
          order: 0,
          contactName: 'Juan Pérez',
          contactPhone: '987654321',
        },
        {
          address: 'Jr. de la Unión 500, Lima',
          latitude: -12.0464,
          longitude: -77.0428,
          order: 1,
          contactName: 'María García',
          contactPhone: '987654322',
        },
        {
          address: 'Av. Javier Prado 1234, San Isidro',
          latitude: -12.0931,
          longitude: -77.0324,
          order: 2,
          contactName: 'Carlos Rodríguez',
          contactPhone: '987654323',
        },
      ],
    },
    {
      name: 'Ruta Norte',
      description: 'Entregas en Lima Norte',
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
          address: 'Av. Universitaria 1800, Los Olivos',
          latitude: -11.9753,
          longitude: -77.0777,
          order: 1,
        },
      ],
    },
    {
      name: 'Ruta Sur',
      description: 'Entregas en Lima Sur',
      assignedTo: userId,
      priority: 'low',
      points: [
        {
          address: 'Av. Benavides 555, Miraflores',
          latitude: -12.1211,
          longitude: -77.0289,
          order: 0,
        },
        {
          address: 'Av. El Sol 896, Chorrillos',
          latitude: -12.1693,
          longitude: -77.0192,
          order: 1,
        },
        {
          address: 'Av. Huaylas 1234, Surco',
          latitude: -12.1397,
          longitude: -76.9942,
          order: 2,
        },
      ],
    },
  ];

  try {
    console.log('🚀 Creando rutas de prueba...');
    
    for (const routeInput of testRoutes) {
      const routeId = await RouteService.createRoute(routeInput);
      console.log(`✅ Ruta creada: ${routeInput.name} (ID: ${routeId})`);
    }
    
    console.log('🎉 Todas las rutas de prueba creadas exitosamente');
  } catch (error) {
    console.error('❌ Error al crear rutas de prueba:', error);
  }
}