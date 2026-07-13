package ws

import (
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
)

type DedupCache struct {
	mu    sync.Mutex
	items map[string]cachedResult
}

type cachedResult struct {
	response []byte
	expireAt time.Time
}

func NewDedupCache(cleanupInterval time.Duration) *DedupCache {
	dc := &DedupCache{
		items: make(map[string]cachedResult),
	}

	go func() {
		ticker := time.NewTicker(cleanupInterval)
		defer ticker.Stop()
		for range ticker.C {
			dc.cleanup()
		}
	}()

	return dc
}

func (dc *DedupCache) cleanup() {
	dc.mu.Lock()
	defer dc.mu.Unlock()

	now := time.Now()
	for key, v := range dc.items {
		if now.After(v.expireAt) {
			delete(dc.items, key)
		}
	}
}

func (dc *DedupCache) CheckOrStore(
	userID uuid.UUID,
	clientID uuid.UUID,
	businessLogic func() ([]byte, error),
) (result []byte, isDuplicate bool, err error) {
	key := fmt.Sprintf("%s:%s", userID.String(), clientID.String())

	dc.mu.Lock()
	if cached, ok := dc.items[key]; ok {
		dc.mu.Unlock()
		return cached.response, true, nil
	}

	dc.items[key] = cachedResult{}
	dc.mu.Unlock()

	resp, err := businessLogic()
	if err != nil {
		dc.mu.Unlock()
		delete(dc.items, key)
		dc.mu.Unlock()
		return nil, false, err
	}

	dc.mu.Lock()
	dc.items[key] = cachedResult{
		response: resp, expireAt: time.Now().Add(5 * time.Minute),
	}
	dc.mu.Unlock()

	return resp, false, nil
}
