package database

import (
	"spoiler-alert/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
	}

	// Auto-migrate tables
	DB.AutoMigrate(&models.User{}, &models.Token{}, &models.FoodItem{})
}
