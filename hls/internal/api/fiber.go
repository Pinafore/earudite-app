package api

import (
	"fmt"
	"strings"
	"github.com/Mshivam2409/hls-streamer/internal/db"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/spf13/viper"
)

func HTTPListen() error {

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSON)
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
	}))

	SetupRoutes(app)

app.Use(func(c *fiber.Ctx) error {
	tok1 := c.Get("x-gostreamer-token") 

	fmt.Println(tok1)
	tok_parts := strings.Split(tok1, ",")
	tok := tok_parts[0]
	fmt.Println(tok_parts)
	fmt.Println(tok)


	if len(tok) == 21 { 
		
		uri := strings.Split(c.Path(), "/") 
		fmt.Println(uri)
	
		if len(uri) < 2 {
			return c.SendStatus(fiber.StatusUnauthorized) 
		}

		path1 := uri[len(uri)-2] 
		path := path1 

		fmt.Println(path1, path)

		rid, err := db.GoStreamer.BadgerClient.Get(tok) 
		fmt.Println(rid)
		fmt.Println("=======")
		if err != nil {
			return c.SendStatus(fiber.StatusUnauthorized)
		}
		

		if path != rid { 
			return c.SendStatus(fiber.StatusUnauthorized) 
		}

		return c.Next() 
	}

	return c.SendStatus(fiber.StatusUnauthorized)
})
	
	app.Static("/hls", viper.GetString("cache.static"))

	err := app.Listen(fmt.Sprintf(":%d", viper.GetInt("port")))
	if err != nil {
		return err
	}

	return nil
}
