package handlers

import (
	"spoiler-alert/database"
	"spoiler-alert/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Custom response struct for user details
type UserDetailsResponse struct {
	ID           int       `json:"id"`
	UniqueID     string    `json:"_id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	VerifyStatus bool      `json:"verify_status"`
	PFP          []byte    `json:"pfp"`
	PFPExt       string    `json:"pfp_ext"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetUserByID fetches user details by UniqueID (_id)
func GetUserByID(c *fiber.Ctx) error {
	userID := c.Params("_id") // Get user._id from the URL

	var user models.User
	if err := database.DB.Where("unique_id = ?", userID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Return only specific fields
	response := UserDetailsResponse{
		ID:           user.ID,
		UniqueID:     user.UniqueID,
		Name:         user.Name,
		Email:        user.Email,
		VerifyStatus: user.VerifyStatus,
		PFP:          user.PFP,
		PFPExt:       user.PFPExt,
		CreatedAt:    user.CreatedAt,
	}

	return c.JSON(response)
}
