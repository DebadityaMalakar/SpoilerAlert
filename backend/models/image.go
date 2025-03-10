package models

import (
	"time"
)

type Image struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	UniqueID  string    `json:"_id" gorm:"unique"`
	ImageData []byte    `json:"image_data"` // Base64-encoded image data
	ImageExt  string    `json:"image_ext"`  // Image extension (e.g., "png", "jpg")
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}
