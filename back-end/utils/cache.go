package utils

import (
	"sync"
	"time"
)

type cacheItem struct {
	value      interface{}
	expiration time.Time
}

// MemoryCache é um cache concorrente em memória com suporte a expiração por TTL
type MemoryCache struct {
	mu    sync.RWMutex
	items map[string]cacheItem
}

var globalCache = NewMemoryCache()

// GetCache retorna a instância singleton do cache em memória
func GetCache() *MemoryCache {
	return globalCache
}

// NewMemoryCache cria uma nova instância de cache
func NewMemoryCache() *MemoryCache {
	return &MemoryCache{
		items: make(map[string]cacheItem),
	}
}

// Get obtém um valor armazenado no cache se ainda não tiver expirado
func (c *MemoryCache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		return nil, false
	}

	if time.Now().After(item.expiration) {
		return nil, false
	}

	return item.value, true
}

// Set armazena um valor com tempo de expiração definido
func (c *MemoryCache) Set(key string, value interface{}, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = cacheItem{
		value:      value,
		expiration: time.Now().Add(ttl),
	}
}

// Delete remove uma chave do cache
func (c *MemoryCache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
}

// Clear limpa todas as entradas do cache
func (c *MemoryCache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items = make(map[string]cacheItem)
}
