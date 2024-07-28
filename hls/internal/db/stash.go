package db

import (
	"fmt"
	"log"
	"os"

	"github.com/alecthomas/units"
	"github.com/spf13/viper"
	"gopkg.in/stash.v1"
)

func NewStash() *stash.Cache {
	f := fmt.Sprintf("%s/.stash", viper.GetString("cache.dir"))
	_, err := os.Stat(f)
	if os.IsNotExist(err) {
		err = os.MkdirAll(f, 0777)
		if err != nil {
			log.Fatalln(err)
		}
	} else {
		err := RemoveContents(f)
		if err != nil {
			log.Fatalln(err)
		}
	}
	s, err := units.ParseStrictBytes(viper.GetString("cache.size"))
	if err != nil {
		log.Fatalln(err)
	}
	c, err := stash.New(f, s, viper.GetInt64("cache.limit"))
	if err != nil {
		log.Fatalln(err)
	}

	return c
}
