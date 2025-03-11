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

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",                          // Allow requests from this origin
		AllowMethods: "GET,POST,PUT,DELETE",        // Allow these HTTP methods
		AllowHeaders: "Origin,Content-Type,Accept", // Allow these headers
	}))

	// Auth routes
	app.Post("/signup", handlers.Signup)
	app.Post("/login", handlers.Login)

	app.Get("/api/user/:_id", handlers.GetUserByID)
	app.Post("/api/food/add", handlers.AddFoodItem)

	app.Get("/api/food", handlers.GetFoodList)
	app.Get("/api/food/image/:id", handlers.GetFoodImage)

	app.Delete("/api/food/delete/:id", handlers.DeleteFoodItem)

	// Start server
	app.Listen(":3000")
}
