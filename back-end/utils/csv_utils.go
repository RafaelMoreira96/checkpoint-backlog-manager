package utils

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"strings"
)

// CSVBatchConfig define as configurações para leitura e processamento em lote
type CSVBatchConfig struct {
	Comma          rune // Delimitador de campos (ex: ';', ',')
	LazyQuotes     bool // Permite aspas desbalanceadas ou literais
	BatchSize      int  // Quantidade de registros por lote
	SkipHeader     bool // Se deve ignorar a primeira linha caso seja cabeçalho
	TrimSpaces     bool // Se deve remover espaços em branco das extremidades dos campos
	MinColumnCount int  // Quantidade mínima de colunas exigida por linha (0 desativa)
}

// DefaultCSVBatchConfig retorna a configuração padrão otimizada para o CheckPOINT
func DefaultCSVBatchConfig() CSVBatchConfig {
	return CSVBatchConfig{
		Comma:          ';',
		LazyQuotes:     true,
		BatchSize:      100,
		SkipHeader:     true,
		TrimSpaces:     true,
		MinColumnCount: 1,
	}
}

// ReadCSVRowBatches lê um arquivo CSV em stream e envia lotes de fatias de strings para o callback
// Mantém o consumo de memória fixo em O(BatchSize), independente do tamanho do arquivo.
func ReadCSVRowBatches(
	r io.Reader,
	cfg CSVBatchConfig,
	handleBatch func(batchNumber int, rows [][]string) error,
) (totalRows int, err error) {
	if r == nil {
		return 0, errors.New("reader cannot be nil")
	}

	batchSize := cfg.BatchSize
	if batchSize <= 0 {
		batchSize = 100
	}

	comma := cfg.Comma
	if comma == 0 {
		comma = ';'
	}

	reader := csv.NewReader(r)
	reader.Comma = comma
	reader.LazyQuotes = cfg.LazyQuotes
	reader.FieldsPerRecord = -1 // Permite linhas com tamanhos variáveis se necessário

	batch := make([][]string, 0, batchSize)
	batchNumber := 1
	rowIndex := 0

	for {
		record, readErr := reader.Read()
		if readErr == io.EOF {
			break
		}
		if readErr != nil {
			return totalRows, fmt.Errorf("error reading CSV at line %d: %w", rowIndex+1, readErr)
		}

		rowIndex++

		// Trata cabeçalho na primeira linha
		if rowIndex == 1 && cfg.SkipHeader {
			continue
		}

		// Valida quantidade mínima de colunas
		if cfg.MinColumnCount > 0 && len(record) < cfg.MinColumnCount {
			return totalRows, fmt.Errorf("line %d has %d columns, expected at least %d", rowIndex, len(record), cfg.MinColumnCount)
		}

		// Limpeza opcional de espaços
		if cfg.TrimSpaces {
			for i := range record {
				record[i] = strings.TrimSpace(record[i])
			}
		}

		// Ignora linhas totalmente vazias
		allEmpty := true
		for _, col := range record {
			if col != "" {
				allEmpty = false
				break
			}
		}
		if allEmpty {
			continue
		}

		batch = append(batch, record)
		totalRows++

		// Quando o lote atinge o tamanho configurado, despacha para o callback e reseta o lote
		if len(batch) >= batchSize {
			if err := handleBatch(batchNumber, batch); err != nil {
				return totalRows, fmt.Errorf("error processing batch %d: %w", batchNumber, err)
			}
			batchNumber++
			batch = make([][]string, 0, batchSize)
		}
	}

	// Processa o último lote residual se houver registros pendentes
	if len(batch) > 0 {
		if err := handleBatch(batchNumber, batch); err != nil {
			return totalRows, fmt.Errorf("error processing final batch %d: %w", batchNumber, err)
		}
	}

	return totalRows, nil
}

// ProcessCSVInBatches é uma função genérica (Go 1.18+) de alta performance que lê um CSV em stream,
// mapeia cada linha para uma entidade tipada T e despacha fatias de []T em lotes para processamento/persistência no banco.
func ProcessCSVInBatches[T any](
	r io.Reader,
	cfg CSVBatchConfig,
	mapRow func(lineNumber int, record []string) (T, error),
	handleBatch func(batchNumber int, batch []T) error,
) (totalEntities int, err error) {
	if mapRow == nil {
		return 0, errors.New("mapRow function cannot be nil")
	}
	if handleBatch == nil {
		return 0, errors.New("handleBatch function cannot be nil")
	}

	batchSize := cfg.BatchSize
	if batchSize <= 0 {
		batchSize = 100
	}

	entityBatch := make([]T, 0, batchSize)
	currentBatchNum := 1
	currentLineNumber := 0

	_, err = ReadCSVRowBatches(r, cfg, func(batchNum int, rows [][]string) error {
		for _, row := range rows {
			currentLineNumber++
			entity, mapErr := mapRow(currentLineNumber, row)
			if mapErr != nil {
				return fmt.Errorf("error mapping row %d: %w", currentLineNumber, mapErr)
			}

			entityBatch = append(entityBatch, entity)

			if len(entityBatch) >= batchSize {
				if err := handleBatch(currentBatchNum, entityBatch); err != nil {
					return err
				}
				currentBatchNum++
				totalEntities += len(entityBatch)
				entityBatch = make([]T, 0, batchSize)
			}
		}
		return nil
	})

	if err != nil {
		return totalEntities, err
	}

	// Processa lote residual restante
	if len(entityBatch) > 0 {
		if err := handleBatch(currentBatchNum, entityBatch); err != nil {
			return totalEntities, err
		}
		totalEntities += len(entityBatch)
	}

	return totalEntities, nil
}
