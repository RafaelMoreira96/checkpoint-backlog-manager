package utils

import (
	"fmt"
	"strconv"
	"strings"
	"testing"
)

type TestGameRecord struct {
	Name string
	Year int
}

func TestReadCSVRowBatches(t *testing.T) {
	csvData := `Nome;Ano
Super Mario World;1990
Donkey Kong Country;1994
Chrono Trigger;1995
Wild Guns;1994
Mega Man X;1993`

	cfg := DefaultCSVBatchConfig()
	cfg.Comma = ';'
	cfg.BatchSize = 2
	cfg.SkipHeader = true

	var batchCounts []int
	var totalProcessed int

	totalRows, err := ReadCSVRowBatches(strings.NewReader(csvData), cfg, func(batchNumber int, rows [][]string) error {
		batchCounts = append(batchCounts, len(rows))
		totalProcessed += len(rows)
		return nil
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if totalRows != 5 {
		t.Errorf("expected 5 total rows, got %d", totalRows)
	}

	// Com 5 registros e batchSize 2, esperamos lotes de: 2, 2, 1
	expectedBatches := []int{2, 2, 1}
	if len(batchCounts) != len(expectedBatches) {
		t.Fatalf("expected %d batches, got %d", len(expectedBatches), len(batchCounts))
	}
	for i, count := range batchCounts {
		if count != expectedBatches[i] {
			t.Errorf("batch %d: expected size %d, got %d", i+1, expectedBatches[i], count)
		}
	}
}

func TestProcessCSVInBatches(t *testing.T) {
	csvData := `Nome,Ano
Elden Ring,2022
Dark Souls,2011
Bloodborne,2015
Sekiro,2019
Armored Core VI,2023
Demon Souls,2009`

	cfg := DefaultCSVBatchConfig()
	cfg.Comma = ','
	cfg.BatchSize = 3
	cfg.SkipHeader = true

	var receivedBatches [][]TestGameRecord

	totalEntities, err := ProcessCSVInBatches[TestGameRecord](
		strings.NewReader(csvData),
		cfg,
		func(lineNum int, record []string) (TestGameRecord, error) {
			if len(record) < 2 {
				return TestGameRecord{}, fmt.Errorf("insufficient columns")
			}
			year, err := strconv.Atoi(record[1])
			if err != nil {
				return TestGameRecord{}, err
			}
			return TestGameRecord{Name: record[0], Year: year}, nil
		},
		func(batchNumber int, batch []TestGameRecord) error {
			// Salva cópia do lote recebido
			copied := make([]TestGameRecord, len(batch))
			copy(copied, batch)
			receivedBatches = append(receivedBatches, copied)
			return nil
		},
	)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if totalEntities != 6 {
		t.Errorf("expected 6 total entities, got %d", totalEntities)
	}

	// 6 itens com batchSize 3 -> 2 lotes de 3
	if len(receivedBatches) != 2 {
		t.Fatalf("expected 2 batches, got %d", len(receivedBatches))
	}

	if len(receivedBatches[0]) != 3 || len(receivedBatches[1]) != 3 {
		t.Errorf("expected batches of 3 and 3, got %d and %d", len(receivedBatches[0]), len(receivedBatches[1]))
	}

	if receivedBatches[0][0].Name != "Elden Ring" || receivedBatches[0][0].Year != 2022 {
		t.Errorf("unexpected first item: %+v", receivedBatches[0][0])
	}
	if receivedBatches[1][2].Name != "Demon Souls" || receivedBatches[1][2].Year != 2009 {
		t.Errorf("unexpected last item: %+v", receivedBatches[1][2])
	}
}

func TestProcessCSVInBatches_ErrorHandling(t *testing.T) {
	csvData := `Nome;Ano
Zelda;1986
Metroid;invalid_year
Mario;1985`

	cfg := DefaultCSVBatchConfig()
	cfg.BatchSize = 10

	_, err := ProcessCSVInBatches[TestGameRecord](
		strings.NewReader(csvData),
		cfg,
		func(lineNum int, record []string) (TestGameRecord, error) {
			year, parseErr := strconv.Atoi(record[1])
			if parseErr != nil {
				return TestGameRecord{}, fmt.Errorf("invalid year format '%s'", record[1])
			}
			return TestGameRecord{Name: record[0], Year: year}, nil
		},
		func(batchNum int, batch []TestGameRecord) error {
			return nil
		},
	)

	if err == nil {
		t.Fatal("expected error parsing invalid year, got nil")
	}

	if !strings.Contains(err.Error(), "invalid year format") {
		t.Errorf("error did not contain expected message: %v", err)
	}
}
