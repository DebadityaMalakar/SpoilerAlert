package models

import (
	"time"
)

type FoodItem struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	UniqueID  string    `json:"_id" gorm:"unique"`
	FoodName  string    `json:"food_name"`
	FoodType  string    `json:"food_type"`  // New field for food type
	FoodState string    `json:"food_state"` // Represents the state of the food (e.g., "Rotten" or "Not Rotten")
	ImagePath string    `json:"image_path"` // Path to the image file
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}
