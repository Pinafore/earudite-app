package hls

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

func TranscodeHLS(inputWav string, inputVTT string, rid string) error {
	folder := fmt.Sprintf("%s/%s", viper.GetString("cache.static"), rid)

	_, err := os.Stat(folder)
	if os.IsNotExist(err) {
		err = os.MkdirAll(folder, 0777)
		if err != nil {
			logger.Errorf(err.Error())
		}
	}
	err = SegmentAudio(inputWav, rid, 5)
	if err != nil {
		logger.Errorf(err.Error())
		return err
	}
	err = SegmentVTT(inputVTT, rid, 5)
	if err != nil {
		logger.Errorf(err.Error())
		return err
	}

	masterPlaylist := "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID=\"subs\",NAME=\"English\",URI=\"sub.m3u8\",LANGUAGE=\"en\"\n#EXT-X-STREAM-INF:NAME=\"audio\",SUBTITLES=\"subs\"\nplaylist.m3u8"

	index, err := os.Create(fmt.Sprintf("%s/index.m3u8", folder))

	if err != nil {
		logger.Errorf(err.Error())
	}

	defer index.Close()

	_, err = index.WriteString(masterPlaylist)

	if err != nil {
		logger.Errorf(err.Error())
		return err
	}
	return err
}
