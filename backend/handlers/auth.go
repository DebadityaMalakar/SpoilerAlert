package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"time"

	"spoiler-alert/database"
	"spoiler-alert/models"

	"github.com/gofiber/fiber/v2"
)

// Custom response struct for Signup and Login
type UserResponse struct {
	ID       int    `json:"id"`
	UniqueID string `json:"_id"`
}

// GenerateRandomSalt generates a cryptographically secure random salt
func GenerateRandomSalt() (string, error) {
	salt := make([]byte, 16) // 16 bytes = 128 bits
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(salt), nil
}

// HashPassword hashes the password with the provided salt
func HashPassword(password, salt string) string {
	hasher := sha256.New()
	hasher.Write([]byte(password + salt))
	return hex.EncodeToString(hasher.Sum(nil))
}

func Signup(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// Generate a random salt
	salt, err := GenerateRandomSalt()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not generate salt"})
	}

	// Hash the password with the salt
	user.Password = HashPassword(user.Password, salt)
	user.Salt = salt

	// Generate unique ID
	user.UniqueID = generateSHA256(user.Name + user.Salt + time.Now().String())

	// Save user to database
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create user"})
	}

	// Return only ID and UniqueID
	response := UserResponse{
		ID:       user.ID,
		UniqueID: user.UniqueID,
	}

	return c.Status(201).JSON(response)
}

func Login(c *fiber.Ctx) error {
	type LoginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// Find user by email
	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Verify password
	hashedPassword := HashPassword(req.Password, user.Salt)
	if hashedPassword != user.Password {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Return only ID and UniqueID
	response := UserResponse{
		ID:       user.ID,
		UniqueID: user.UniqueID,
	}

	return c.Status(200).JSON(response)
}

func generateSHA256(input string) string {
	hasher := sha256.New()
	hasher.Write([]byte(input))
	return hex.EncodeToString(hasher.Sum(nil))
}
