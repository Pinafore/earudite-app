package db

import (
	"fmt"
	"log"
	"os"

	"github.com/ReneKroon/ttlcache/v2"
)

func NewTTLCache() *ttlcache.Cache {
	t := ttlcache.NewCache()
	t.SetExpirationCallback(func(key string, value interface{}) {
		log.Println(fmt.Sprintf("%s expired! Deleting %s", key, value))
		if err := os.RemoveAll(fmt.Sprintf("%s", value)); err != nil {
			logger.Errorf(err.Error())
		}
	})
	return t
}
