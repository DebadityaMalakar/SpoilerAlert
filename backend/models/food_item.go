package models

import (
	"time"
)

type FoodItem struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	UniqueID  string    `json:"_id" gorm:"unique"`
	FoodName  string    `json:"food_name"`
	FoodType  string    `json:"food_type"` // New field for food type
	FoodImage []byte    `json:"food_image"`
	ImageExt  string    `json:"image_ext"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}
