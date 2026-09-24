import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useBacklogList, useDeleteBacklog, useCreateGame } from '@checkpoint/core';
import { mobileApi } from '../../lib/api';
import { GamePosterItem } from '../../components/GamePosterItem';
import { Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function MobileBacklogScreen() {
  const { data: backlog = [], isLoading, refetch, isRefetching } = useBacklogList(mobileApi);
  const deleteBacklogMutation = useDeleteBacklog(mobileApi);
  const createGameMutation = useCreateGame(mobileApi);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredGames = backlog.filter((g) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      g.name_game.toLowerCase().includes(term) ||
      (g.console?.name_console?.toLowerCase().includes(term) ?? false) ||
      (g.genre?.name_genre?.toLowerCase().includes(term) ?? false)
    );
  });

  const handleGamePress = (game: any) => {
    Alert.alert(
      game.name_game,
      'Deseja marcar este jogo como zerado agora?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar como Zerado!',
          style: 'default',
          onPress: async () => {
            // Haptic vibration feedback!
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              // Ignore if unsupported in environment
            }

            await createGameMutation.mutateAsync({
              name_game: game.name_game,
              genre_id: game.genre_id || 1,
              console_id: game.console_id || 1,
              developer: game.developer,
              release_year: game.release_year,
              url_image: game.url_image,
              time_beating: 10,
              date_beating: new Date().toISOString().split('T')[0],
            });

            await deleteBacklogMutation.mutateAsync(game.id_game);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={16} color="#8b949e" style={styles.searchIcon} />
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Buscar no backlog..."
          placeholderTextColor="#6e7681"
          style={styles.searchInput}
        />
      </View>

      {/* Grid */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Carregando backlog...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.id_game.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <GamePosterItem
              game={item}
              isBacklog={true}
              onPress={() => handleGamePress(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchTerm
                  ? 'Nenhum título encontrado para esta busca.'
                  : 'Nenhum jogo na fila do backlog.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8b949e',
    fontSize: 13,
    marginTop: 10,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8b949e',
    fontSize: 14,
    textAlign: 'center',
  },
});
