package handlers

import (
	"time"

	"spoiler-alert/database"
	"spoiler-alert/models"

	"github.com/gofiber/fiber/v2"
)

// AddFoodItem adds a new food item to the database
func AddFoodItem(c *fiber.Ctx) error {
	var foodItem models.FoodItem
	if err := c.BodyParser(&foodItem); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// Generate a unique ID for the food item
	foodItem.UniqueID = generateSHA256(foodItem.FoodName + time.Now().String())

	// Set the creation timestamp
	foodItem.CreatedAt = time.Now()

	// Save the food item to the database
	if err := database.DB.Create(&foodItem).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create food item"})
	}

	return c.Status(201).JSON(foodItem)
}
