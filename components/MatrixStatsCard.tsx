import { getAllMatrices } from '@/constants/monitoring';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

interface MatrixStatsCardProps {
  stats: {
    air: number;
    water: number;
    soil: number;
    'occupational-health': number;
  };
}

export default function MatrixStatsCard({ stats }: MatrixStatsCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const matrices = getAllMatrices();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>
        Distribución por Matriz
      </Text>
      <View style={styles.grid}>
        {matrices.map((config) => {
          const count = stats[config.id as keyof typeof stats] || 0;
          return (
            <View 
              key={config.id} 
              style={[styles.card, { backgroundColor: config.lightBackground }]}
            >
              <Ionicons name={config.icon} size={24} color={config.color} />
              <Text style={[styles.count, { color: config.color }]}>{count}</Text>
              <Text style={styles.label}>{config.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDark: {
    backgroundColor: '#1c1c1e',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  titleDark: {
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  count: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});