import { useEffect, useState } from 'react';

type WorkStatus = 'WORKING' | 'BREAK' | 'OFF_DUTY' | 'OVERTIME';

interface WorkSchedule {
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  workDays: number[]; // 1-5 para lunes-viernes
}

interface UseWorkScheduleReturn {
  workStatus: WorkStatus;
  isInWorkHours: boolean;
  currentSchedule: WorkSchedule;
  timeUntilNextChange: string | null;
}

export const useWorkSchedule = (userId: string = 'cymperu'): UseWorkScheduleReturn => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Horario por defecto
  const defaultSchedule: WorkSchedule = {
    startTime: '08:00',
    endTime: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    workDays: [1, 2, 3, 4, 5], // Lunes a Viernes
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(timer);
  }, []);

  const getCurrentWorkStatus = (): WorkStatus => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime24 = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    const dayOfWeek = now.getDay(); // 0=domingo, 1=lunes, etc.

    // Verificar si es día laboral
    if (!defaultSchedule.workDays.includes(dayOfWeek)) {
      return 'OFF_DUTY';
    }

    // Convertir horarios a minutos para comparación fácil
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const currentMinutesTotal = timeToMinutes(currentTime24);
    const startMinutes = timeToMinutes(defaultSchedule.startTime);
    const endMinutes = timeToMinutes(defaultSchedule.endTime);
    const breakStartMinutes = timeToMinutes(defaultSchedule.breakStart);
    const breakEndMinutes = timeToMinutes(defaultSchedule.breakEnd);

    // Determinar estado
    if (currentMinutesTotal < startMinutes) {
      return 'OFF_DUTY'; // Antes del horario
    } else if (currentMinutesTotal >= startMinutes && currentMinutesTotal < breakStartMinutes) {
      return 'WORKING'; // Mañana
    } else if (currentMinutesTotal >= breakStartMinutes && currentMinutesTotal < breakEndMinutes) {
      return 'BREAK'; // Almuerzo
    } else if (currentMinutesTotal >= breakEndMinutes && currentMinutesTotal < endMinutes) {
      return 'WORKING'; // Tarde
    } else if (currentMinutesTotal >= endMinutes && currentMinutesTotal < endMinutes + 120) {
      return 'OVERTIME'; // Horas extra (hasta 2 horas)
    } else {
      return 'OFF_DUTY'; // Después del horario
    }
  };

  const getTimeUntilNextChange = (): string | null => {
    const workStatus = getCurrentWorkStatus();
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const currentMinutesTotal = currentHour * 60 + currentMinutes;

    switch (workStatus) {
      case 'OFF_DUTY':
        if (currentMinutesTotal < timeToMinutes(defaultSchedule.startTime)) {
          const minutesUntilStart = timeToMinutes(defaultSchedule.startTime) - currentMinutesTotal;
          const hours = Math.floor(minutesUntilStart / 60);
          const minutes = minutesUntilStart % 60;
          return `Inicio en ${hours}h ${minutes}m`;
        }
        return 'Horario finalizado';

      case 'WORKING':
        if (currentMinutesTotal < timeToMinutes(defaultSchedule.breakStart)) {
          const minutesUntilBreak = timeToMinutes(defaultSchedule.breakStart) - currentMinutesTotal;
          const hours = Math.floor(minutesUntilBreak / 60);
          const minutes = minutesUntilBreak % 60;
          return `Descanso en ${hours}h ${minutes}m`;
        } else {
          const minutesUntilEnd = timeToMinutes(defaultSchedule.endTime) - currentMinutesTotal;
          const hours = Math.floor(minutesUntilEnd / 60);
          const minutes = minutesUntilEnd % 60;
          return `Fin en ${hours}h ${minutes}m`;
        }

      case 'BREAK':
        const minutesUntilWorkResume = timeToMinutes(defaultSchedule.breakEnd) - currentMinutesTotal;
        const hours = Math.floor(minutesUntilWorkResume / 60);
        const minutes = minutesUntilWorkResume % 60;
        return `Regreso en ${hours}h ${minutes}m`;

      case 'OVERTIME':
        return 'Horas extra activas';

      default:
        return null;
    }
  };

  const workStatus = getCurrentWorkStatus();
  const isInWorkHours = workStatus === 'WORKING' || workStatus === 'OVERTIME';

  return {
    workStatus,
    isInWorkHours,
    currentSchedule: defaultSchedule,
    timeUntilNextChange: getTimeUntilNextChange(),
  };
};