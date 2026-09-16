package repository

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

// TableStore handles safe, isolated persistence for a single database table / entity file.
type TableStore[T any] struct {
	filePath string
	mu       sync.RWMutex
}

// NewTableStore creates a new isolated table store.
func NewTableStore[T any](filePath string) *TableStore[T] {
	return &TableStore[T]{
		filePath: filePath,
	}
}

// FilePath returns the underlying file path for this table.
func (t *TableStore[T]) FilePath() string {
	return t.filePath
}

// Exists checks whether the table file currently exists.
func (t *TableStore[T]) Exists() bool {
	_, err := os.Stat(t.filePath)
	return err == nil
}

// Read executes a read-locked function with current table records.
func (t *TableStore[T]) Read(fn func(records []T) error) error {
	t.mu.RLock()
	defer t.mu.RUnlock()

	records, err := t.loadRecords()
	if err != nil {
		return err
	}
	return fn(records)
}

// Write executes a write-locked function to modify and save table records.
func (t *TableStore[T]) Write(fn func(records *[]T) error) error {
	t.mu.Lock()
	defer t.mu.Unlock()

	records, err := t.loadRecords()
	if err != nil {
		return err
	}

	if err := fn(&records); err != nil {
		return err
	}

	return t.saveRecords(records)
}

// loadRecords reads the table file into slice of T.
func (t *TableStore[T]) loadRecords() ([]T, error) {
	if _, err := os.Stat(t.filePath); os.IsNotExist(err) {
		return make([]T, 0), nil
	}

	data, err := os.ReadFile(t.filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read table %s: %w", filepath.Base(t.filePath), err)
	}

	if len(data) == 0 {
		return make([]T, 0), nil
	}

	var records []T
	if err := json.Unmarshal(data, &records); err != nil {
		return nil, fmt.Errorf("failed to parse table %s: %w", filepath.Base(t.filePath), err)
	}

	if records == nil {
		records = make([]T, 0)
	}

	return records, nil
}

// saveRecords writes the slice of T to disk atomically using a temp file.
func (t *TableStore[T]) saveRecords(records []T) error {
	if records == nil {
		records = make([]T, 0)
	}

	data, err := json.MarshalIndent(records, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal table %s: %w", filepath.Base(t.filePath), err)
	}

	dir := filepath.Dir(t.filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", dir, err)
	}

	// Atomic write: write to temp file then rename
	tempFile := t.filePath + ".tmp"
	if err := os.WriteFile(tempFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write temp file for table %s: %w", filepath.Base(t.filePath), err)
	}

	if err := os.Rename(tempFile, t.filePath); err != nil {
		_ = os.Remove(tempFile)
		return fmt.Errorf("failed to commit table %s: %w", filepath.Base(t.filePath), err)
	}

	return nil
}
