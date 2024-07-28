package api

import (
	"fmt"
	"os"
	"time"

	"github.com/Mshivam2409/hls-streamer/internal/db"
	"github.com/Mshivam2409/hls-streamer/internal/hls"
	"github.com/gofiber/fiber/v2"
	gonanoid "github.com/matoous/go-nanoid/v2"
	uuid "github.com/satori/go.uuid"
	"github.com/spf13/viper"
)

type Question struct {
	Qid       string `json:"qid"`
	Handshake string `json:"handshake"`
}

type Unlocker struct {
	Rid       string `json:"rid"`
	Handshake string `json:"handshake"`
}

func Health(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusOK)
}

func GetToken(c *fiber.Ctx) error {
	q := new(Question)

	if err := c.BodyParser(q); err != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{"error": err.Error()})
	}

	if q.Handshake != viper.GetString("handshake") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid Handshake"})
	}
	rid := uuid.NewV4().String()

	token, _ := gonanoid.New()

	wavPath, err := db.WriteWAV(q.Qid)
	if err != nil {
		fmt.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	vttPath, err := db.WriteVTT(q.Qid)
	if err != nil {
		fmt.Println(err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if err = hls.TranscodeHLS(wavPath, vttPath, rid); err != nil {
		return err
	}

	dur, err := time.ParseDuration(viper.GetString("cache.expiry"))
	if err != nil {
		dur = 2 * time.Minute
	}

	db.GoStreamer.TTLCache.SetWithTTL(rid, fmt.Sprintf("%s/%s", viper.GetString("cache.static"), rid), dur)

	db.GoStreamer.BadgerClient.Save(token, rid, dur)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"token": token, "rid": rid})
}

func ProcessBatch(c *fiber.Ctx) error {

	b := new(hls.Batch)

	if err := c.BodyParser(b); err != nil {
		return err
	}

	if b.Handshake != viper.GetString("handshake") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid Handshake"})
	}

	h, err := hls.TranscodeHLSBatch(*b)

	if err != nil {
		return err
	}
	return c.Status(201).JSON(h)
}

func Unlock(c *fiber.Ctx) error {
	q := new(Unlocker)

	if err := c.BodyParser(q); err != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{"error": err.Error()})
	}

	if q.Handshake != viper.GetString("handshake") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid Handshake"})
	}

	_, err := os.Stat(fmt.Sprintf("%s/%s", viper.GetString("cache.static"), q.Rid))
	if os.IsNotExist(err) {
		logger.Warningf(fmt.Sprintf("Requested Expired Resource : %s! Ensure that expiry is not too short", q.Rid))
		return c.Status(fiber.StatusGone).JSON(fiber.Map{"error": err.Error()})
	}

	token, err := gonanoid.New()
	if err != nil {
		return err
	}

	dur, err := time.ParseDuration(viper.GetString("cache.expiry"))
	if err != nil {
		dur = 2 * time.Minute
	}

	db.GoStreamer.BadgerClient.Save(token, q.Rid, dur)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"token": token})
}
