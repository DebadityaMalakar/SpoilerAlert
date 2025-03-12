package database

import (
	"fmt"
	"log"
	"os"

	"spoiler-alert/models"

	"github.com/joho/godotenv"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		fmt.Println("⚠️ No .env file found, using system environment variables")
	}

	// Check if running online
	envOnline := os.Getenv("ENV_ONLINE") == "True"

	if envOnline {
		// Read PostgreSQL credentials from env variables
		host := os.Getenv("PGHOST")
		dbName := os.Getenv("PGDATABASE")
		user := os.Getenv("PGUSER")
		password := os.Getenv("PGPASSWORD")
		port := os.Getenv("PGPORT")

		// Construct the DSN (PostgreSQL connection string)
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require",
			host, user, password, dbName, port,
		)

		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Fatalf("❌ Failed to connect to PostgreSQL (Neon): %v", err)
		} else {
			fmt.Println("✅ Connected to PostgreSQL (Neon)")
		}
	} else {
		// Fallback to SQLite
		DB, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
		if err != nil {
			log.Fatalf("❌ Failed to connect to SQLite: %v", err)
		} else {
			fmt.Println("✅ Connected to SQLite")
		}
	}

	// Auto-migrate tables
	DB.AutoMigrate(&models.User{}, &models.Token{}, &models.FoodItem{})
}
