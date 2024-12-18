package utils

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

type Date struct {
	time.Time
}

const DateFormat = "2006-01-02"

// Scan implementa a interface Scanner para que o tipo Date funcione com o banco de dados
func (d *Date) Scan(value interface{}) error {
	if value == nil {
		*d = Date{Time: time.Time{}}
		return nil
	}
	parsedTime, ok := value.(time.Time)
	if !ok {
		return fmt.Errorf("can't scan value into Date: %v", value)
	}
	*d = Date{Time: parsedTime}
	return nil
}

// Value implementa a interface para gravar no banco de dados
func (d Date) Value() (driver.Value, error) {
	return d.Time, nil
}

// MarshalJSON converte a data para o formato JSON
func (d Date) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.Format(DateFormat))
}

// UnmarshalJSON converte o formato JSON para o tipo Date
func (d *Date) UnmarshalJSON(data []byte) error {
	var err error
	parsedTime, err := time.Parse(`"`+DateFormat+`"`, string(data))
	if err != nil {
		return err
	}
	d.Time = parsedTime
	return nil
}

func Today() Date {
	return Date{Time: time.Now()}
}

func ParseDate(dateStr string) (Date, error) {
	formats := []string{
		"02/01/2006",
		"2006-01-02",
		"01/02/2006",
	}

	var parsedDate time.Time
	var err error

	for _, format := range formats {
		parsedDate, err = time.Parse(format, dateStr)
		if err == nil {
			return Date{Time: parsedDate}, nil
		}
	}

	return Date{}, errors.New("invalid date format: " + dateStr)
}
