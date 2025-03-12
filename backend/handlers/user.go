package handlers

import (
	"net/http"
	"spoiler-alert/database"
	"spoiler-alert/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

type UserDetailsResponse struct {
	ID           int       `json:"id" gorm:"primaryKey"`
	UniqueID     string    `json:"_id" gorm:"unique"`
	Name         string    `json:"name"`
	Email        string    `json:"email" gorm:"unique"`
	Username     string    `json:"username" gorm:"unique"`
	Profession   string    `json:"profession"`
	DateOfBirth  time.Time `json:"date_of_birth"`
	Password     string    `json:"password"`
	Salt         string    `json:"salt"`
	VerifyStatus bool      `json:"verify_status" gorm:"default:false"`
	PFP          []byte    `json:"pfp"`
	PFPExt       string    `json:"pfp_ext"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
}

// GetUserByID fetches user details by UniqueID (_id)
func GetUserByID(c *fiber.Ctx) error {
	userID := c.Params("_id")

	var user models.User
	if err := database.DB.Where("unique_id = ?", userID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	response := UserDetailsResponse{
		ID:           user.ID,
		UniqueID:     user.UniqueID,
		Name:         user.Name,
		Email:        user.Email,
		Profession:   user.Profession,
		DateOfBirth:  user.DateOfBirth,
		Username:     user.Username,
		VerifyStatus: user.VerifyStatus,
		PFP:          user.PFP,
		PFPExt:       "png", // Force PNG format
		CreatedAt:    user.CreatedAt,
	}

	return c.JSON(response)
}

// UpdateUserPFP allows users to upload a profile picture (always stored as PNG)
func UpdateUserPFP(c *fiber.Ctx) error {
	userID := c.Params("_id")

	file, err := c.FormFile("pfp")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid file upload"})
	}

	// Open the uploaded file
	openedFile, err := file.Open()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process image"})
	}
	defer openedFile.Close()

	// Read file content into []byte
	buf := make([]byte, file.Size)
	_, err = openedFile.Read(buf)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to read image data"})
	}

	// Retrieve user from the database
	var user models.User
	if err := database.DB.Where("unique_id = ?", userID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Update user PFP (force PNG format)
	user.PFP = buf
	user.PFPExt = "png"

	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update profile picture"})
	}

	return c.JSON(fiber.Map{
		"message": "Profile picture updated successfully",
		"pfp_ext": "png",
	})
}

// GetUserPFP serves the profile picture of a user by UniqueID (_id)
func GetUserPFP(c *fiber.Ctx) error {
	userID := c.Params("_id") // Extract user ID from the URL

	var user models.User
	if err := database.DB.Where("unique_id = ?", userID).First(&user).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	// If user has no profile picture stored
	if len(user.PFP) == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Profile picture not set"})
	}

	// Always return PNG format
	c.Set("Content-Type", "image/png")
	return c.Send(user.PFP)
}

// UpdateUserProfession updates the profession of a user
func UpdateUserProfession(c *fiber.Ctx) error {
	userID := c.Params("_id")

	type UpdateProfessionRequest struct {
		Profession string `json:"profession"`
	}

	var req UpdateProfessionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// Retrieve user from the database
	var user models.User
	if err := database.DB.Where("unique_id = ?", userID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Update profession
	user.Profession = req.Profession

	// Save changes to the database
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update profession"})
	}

	return c.JSON(fiber.Map{
		"message":    "Profession updated successfully",
		"profession": user.Profession,
	})
}

// UpdateUserDateOfBirth updates the date of birth of a user
func UpdateUserDateOfBirth(c *fiber.Ctx) error {
	userID := c.Params("_id")

	type UpdateDateOfBirthRequest struct {
		DateOfBirth string `json:"date_of_birth"` // Expecting format: "YYYY-MM-DD"
	}

	var req UpdateDateOfBirthRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// Parse the date of birth
	dob, err := time.Parse("2006-01-02", req.DateOfBirth)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid date format. Use YYYY-MM-DD"})
	}

	// Retrieve user from the database
	var user models.User
	if err := database.DB.Where("unique_id = ?", userID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Update date of birth
	user.DateOfBirth = dob

	// Save changes to the database
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update date of birth"})
	}

	return c.JSON(fiber.Map{
		"message":       "Date of birth updated successfully",
		"date_of_birth": user.DateOfBirth.Format("2006-01-02"),
	})
}

func UpdateUsername(c *fiber.Ctx) error {
	userID := c.Params("_id")

	type UpdateUsernameRequest struct {
		Username string `json:"username"`
	}

	var req UpdateUsernameRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// Retrieve user from the database
	var user models.User
	if err := database.DB.Where("unique_id = ?", userID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Check if the new username is already taken by another user
	if req.Username != user.Username {
		var existingUser models.User
		if err := database.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
			return c.Status(400).JSON(fiber.Map{"error": "Username already taken"})
		}
	}

	// Update username
	user.Username = req.Username

	// Save changes to the database
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update username"})
	}

	return c.JSON(fiber.Map{
		"message":  "Username updated successfully",
		"username": user.Username,
	})
}
