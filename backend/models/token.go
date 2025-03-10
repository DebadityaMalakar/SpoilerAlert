package models

type Token struct {
	ID           int     `json:"id" gorm:"primaryKey"`
	Value        string  `json:"value"`
	ExchangeRate float64 `json:"exchange_rate"`
	UserID       string  `json:"user_id"`
}
