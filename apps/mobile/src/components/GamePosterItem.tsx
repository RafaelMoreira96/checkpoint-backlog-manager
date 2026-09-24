import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Game } from '@checkpoint/core';

interface GamePosterItemProps {
  game: Game;
  isBacklog?: boolean;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding
const ITEM_HEIGHT = ITEM_WIDTH * (4 / 3); // 3:4 aspect ratio

export const GamePosterItem: React.FC<GamePosterItemProps> = ({
  game,
  isBacklog = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, { width: ITEM_WIDTH, height: ITEM_HEIGHT }]}
    >
      {/* Poster Image */}
      {game.url_image ? (
        <Image
          source={{ uri: game.url_image }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{game.name_game}</Text>
        </View>
      )}

      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: isBacklog ? 'rgba(245, 158, 11, 0.9)' : 'rgba(16, 185, 129, 0.9)' },
        ]}
      >
        <Text style={styles.statusBadgeText}>
          {isBacklog ? 'Backlog' : 'Zerado'}
        </Text>
      </View>

      {/* Time Badge */}
      {game.time_beating !== undefined && (
        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeText}>{game.time_beating}h</Text>
        </View>
      )}

      {/* Bottom Gradient Info */}
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {game.name_game}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {game.console?.name_console || ''} {game.genre?.name_genre ? `• ${game.genre.name_genre}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161b22',
    padding: 8,
  },
  placeholderText: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  timeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(13, 17, 23, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  timeBadgeText: {
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13, 17, 23, 0.92)',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    color: '#8b949e',
    fontSize: 10,
  },
});
