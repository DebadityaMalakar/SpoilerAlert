package models

import (
	"time"
)

type User struct {
	ID           int       `json:"id" gorm:"primaryKey"`
	UniqueID     string    `json:"_id" gorm:"unique"`
	Name         string    `json:"name"`
	Email        string    `json:"email" gorm:"unique"`
	Password     string    `json:"password"`
	Salt         string    `json:"salt"`
	VerifyStatus bool      `json:"verify_status" gorm:"default:false"`
	PFP          []byte    `json:"pfp"`
	PFPExt       string    `json:"pfp_ext"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
}
