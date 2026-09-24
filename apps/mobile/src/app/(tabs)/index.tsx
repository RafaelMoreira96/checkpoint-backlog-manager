import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useDashboardStats, useLastGamesBeaten } from '@checkpoint/core';
import { mobileApi } from '../../lib/api';
import { Trophy, Clock, Crown, CalendarCheck } from 'lucide-react-native';

export default function MobileDashboardScreen() {
  const { data: stats, refetch: refetchStats, isRefetching } = useDashboardStats(mobileApi);
  const { data: lastBeaten = [], refetch: refetchBeaten } = useLastGamesBeaten(mobileApi);

  const onRefresh = () => {
    refetchStats();
    refetchBeaten();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={onRefresh}
          tintColor="#8b5cf6"
        />
      }
    >
      <Text style={styles.headerTitle}>Dashboard Gamer</Text>
      <Text style={styles.headerSubtitle}>Suas estatísticas no CheckPOINT Mobile</Text>

      {/* Metric Cards Grid */}
      <View style={styles.grid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Total Zerados</Text>
            <Trophy size={16} color="#10b981" />
          </View>
          <Text style={styles.metricValue}>
            {stats?.total_games_finished || 0}
          </Text>
          <Text style={styles.metricHint}>jogos concluídos</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Zerados no Mês</Text>
            <CalendarCheck size={16} color="#06b6d4" />
          </View>
          <Text style={styles.metricValue}>
            {stats?.games_finished_this_month || 0}
          </Text>
          <Text style={styles.metricHint}>ritmo mensal</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Horas no Mês</Text>
            <Clock size={16} color="#8b5cf6" />
          </View>
          <Text style={styles.metricValue}>
            {stats?.total_hours_played_this_month
              ? `${Number(stats.total_hours_played_this_month).toFixed(1)}h`
              : '0h'}
          </Text>
          <Text style={styles.metricHint}>tempo dedicado</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Gênero Top</Text>
            <Crown size={16} color="#f59e0b" />
          </View>
          <Text style={styles.metricValueSmall} numberOfLines={1}>
            {stats?.most_used || 'N/A'}
          </Text>
          <Text style={styles.metricHint}>mais jogado</Text>
        </View>
      </View>

      {/* Recent Completions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimos Jogos Zerados</Text>
        {lastBeaten.map((game) => (
          <View key={game.id_game} style={styles.recentItem}>
            <View style={styles.recentInfo}>
              <Text style={styles.recentTitle}>{game.name_game}</Text>
              <Text style={styles.recentSubtitle}>
                {game.console?.name_console} • {game.genre?.name_genre}
              </Text>
            </View>
            {game.time_beating !== undefined && (
              <Text style={styles.recentTime}>{game.time_beating}h</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8b949e',
    marginBottom: 20,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#161b22',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8b949e',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  metricValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  metricHint: {
    fontSize: 10,
    color: '#6e7681',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161b22',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 8,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  recentSubtitle: {
    fontSize: 11,
    color: '#8b949e',
  },
  recentTime: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10b981',
    marginLeft: 8,
  },
});
