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

const DateFormat = "02/01/2006"

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

func (d Date) Value() (driver.Value, error) {
	if d.IsZero() {
		return nil, nil
	}
	return d.Time, nil
}

func (d Date) MarshalJSON() ([]byte, error) {
	if d.IsZero() {
		return []byte("null"), nil
	}
	return json.Marshal(d.Format(DateFormat))
}

func (d *Date) UnmarshalJSON(data []byte) error {
	str := string(data)
	if str == "null" || str == `""` || str == "" {
		*d = Date{Time: time.Time{}}
		return nil
	}

	dateStr := str
	if len(dateStr) >= 2 && dateStr[0] == '"' && dateStr[len(dateStr)-1] == '"' {
		dateStr = dateStr[1 : len(dateStr)-1]
	}

	if dateStr == "" || dateStr == "null" {
		*d = Date{Time: time.Time{}}
		return nil
	}

	formats := []string{
		"02/01/2006",
		"2006-01-02",
		"2006-01-02T15:04:05Z07:00",
	}

	var parsedTime time.Time
	var err error
	for _, format := range formats {
		parsedTime, err = time.Parse(format, dateStr)
		if err == nil {
			d.Time = parsedTime
			return nil
		}
	}

	return fmt.Errorf("invalid date format: %s", dateStr)
}

func Today() Date {
	return Date{Time: time.Now()}
}

func ParseDate(dateStr string) (Date, error) {
	formats := []string{
		"02/01/2006",
		"02/01/06",
		"2006-01-02",
		"2006-02-01",
	}

	var parsedDate time.Time
	var err error

	for _, format := range formats {
		parsedDate, err = time.Parse(format, dateStr)
		if err == nil {
			if format == "02/01/06" {
				parsedDate = adjustYear(parsedDate)
			}
			return Date{Time: parsedDate}, nil
		}
	}

	return Date{}, errors.New("invalid date format: " + dateStr)
}

func adjustYear(parsedDate time.Time) time.Time {
	year := parsedDate.Year()
	if year < 100 {
		parsedDate = parsedDate.AddDate(2000-1, 0, 0)
	}
	return parsedDate
}
