package db

import (
	"fmt"
	"log"

	"github.com/alecthomas/units"
	"github.com/jasonlvhit/gocron"
	"github.com/spf13/viper"
)

func checkStorageLimit() {
	size, err := DirSize(viper.GetString("cache.tempdir"))
	limit, _ := units.ParseStrictBytes(viper.GetString("cache.killsize.tempdir"))
	if err == nil && size > limit && viper.GetBool("cache.killsize.enabled") {
		RemoveContents(viper.GetString("cache.tempdir"))
		log.Println(fmt.Sprintf("Temporary Directory at Size: %d Limit: %d", size, limit))
	} else if err == nil && !viper.GetBool("cache.killsize.enabled") {
		log.Println(fmt.Sprintf("Temporary Directory at Size: %d Limit: %d", size, limit))
	} else if err != nil {
		log.Println(err)
	}
	size, err = DirSize(viper.GetString("cache.static"))
	limit, _ = units.ParseStrictBytes(viper.GetString("cache.killsize.static"))
	if err == nil && size > int64(viper.GetInt("cache.killsize.static")) && viper.GetBool("cache.killsize.enabled") {
		RemoveContents(viper.GetString("cache.static"))
	} else if err == nil && !viper.GetBool("cache.killsize.enabled") {
		log.Println(fmt.Sprintf("Static Directory at Size: %d Limit: %d", size, limit))
	} else if err != nil {
		log.Println(err)
	}
}

func ScheduleSizeCheck() {
	gocron.Every(1).Minute().Do(checkStorageLimit)
	<-gocron.Start()
}
