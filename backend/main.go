package main

import (
	"spoiler-alert/database"
	"spoiler-alert/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// Initialize database
	database.InitDB()

	// Create Fiber app
	app := fiber.New()

	// Enable CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Auth routes
	app.Post("/signup", handlers.Signup)
	app.Post("/login", handlers.Login)

	// User routes
	app.Get("/api/user/:_id", handlers.GetUserByID)
	app.Put("/api/user/:_id/pfp", handlers.UpdateUserPFP)
	app.Get("/api/user/image/:_id", handlers.GetUserPFP)
	app.Put("/api/user/:_id/profession", handlers.UpdateUserProfession)
	app.Put("/api/user/:_id/dob", handlers.UpdateUserDateOfBirth)
	app.Put("/api/user/:_id/username", handlers.UpdateUsername)

	// Food routes
	app.Post("/api/food/add", handlers.AddFoodItem)
	app.Get("/api/food", handlers.GetFoodList)
	app.Get("/api/food/image/:id", handlers.GetFoodImage)
	app.Delete("/api/food/delete/:id", handlers.DeleteFoodItem)

	// Start server
	app.Listen(":3000")
}
