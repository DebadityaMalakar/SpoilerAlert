package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"os"
	"path/filepath"
	"time"

	"spoiler-alert/database"
	"spoiler-alert/models"

	"github.com/gofiber/fiber/v2"
)

// AddFoodItem handles adding a new food item
func AddFoodItem(c *fiber.Ctx) error {
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse form data"})
	}

	// Get image file
	fileHeader := form.File["image"][0]
	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot open image file"})
	}
	defer file.Close()

	// Ensure the images directory exists
	if err := os.MkdirAll("images", os.ModePerm); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create images directory"})
	}

	// Generate unique filename
	hash := sha256.New()
	hash.Write([]byte(fileHeader.Filename + time.Now().String()))
	hashedFilename := hex.EncodeToString(hash.Sum(nil)) + filepath.Ext(fileHeader.Filename)
	imagePath := filepath.Join("images", hashedFilename)

	// Save the image
	out, err := os.Create(imagePath)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not save image"})
	}
	defer out.Close()
	if _, err := io.Copy(out, file); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not write image to disk"})
	}

	// Get food state
	foodState := form.Value["food_state"][0]

	// Create food item in database
	foodItem := models.FoodItem{
		FoodName:  form.Value["food_name"][0],
		FoodType:  form.Value["food_type"][0],
		FoodState: foodState,
		ImagePath: imagePath,
		UniqueID:  generateSHA256(fileHeader.Filename + time.Now().String()),
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&foodItem).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create food item"})
	}

	return c.Status(201).JSON(foodItem)
}

// GetFoodList retrieves all food items with state and image URI
func GetFoodList(c *fiber.Ctx) error {
	var foodItems []models.FoodItem

	if err := database.DB.Find(&foodItems).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not fetch food items"})
	}

	response := []fiber.Map{}
	for _, item := range foodItems {
		imageURI := "/api/food/image/" + item.UniqueID
		response = append(response, fiber.Map{
			"food_state": item.FoodState,
			"image_uri":  imageURI,
		})
	}

	return c.JSON(response)
}

// GetFoodImage serves the food image by unique ID
func GetFoodImage(c *fiber.Ctx) error {
	uniqueID := c.Params("id")

	var foodItem models.FoodItem
	if err := database.DB.Where("unique_id = ?", uniqueID).First(&foodItem).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Food item not found"})
	}

	imagePath := foodItem.ImagePath
	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
		return c.Status(404).JSON(fiber.Map{"error": "Image not found"})
	}

	return c.SendFile(imagePath)
}

// DeleteFoodItem handles deleting a food item by its unique ID
func DeleteFoodItem(c *fiber.Ctx) error {
	uniqueID := c.Params("id")

	var foodItem models.FoodItem
	if err := database.DB.Where("unique_id = ?", uniqueID).First(&foodItem).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Food item not found"})
	}

	// Delete image file from disk
	if err := os.Remove(foodItem.ImagePath); err != nil && !os.IsNotExist(err) {
		return c.Status(500).JSON(fiber.Map{"error": "Could not delete image file"})
	}

	// Delete food item from database
	if err := database.DB.Delete(&foodItem).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not delete food item"})
	}

	return c.JSON(fiber.Map{"message": "Food item deleted successfully"})
}
