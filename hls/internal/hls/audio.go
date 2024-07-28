package hls

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/spf13/viper"
)

func SegmentAudio(inWavPath string, rid string, segment_duration int) error {
	_, err := os.Stat(inWavPath)
	if os.IsNotExist(err) {
		return err
	}
	segmentList := fmt.Sprintf("%s/%s/playlist.m3u8", viper.GetString("cache.static"), rid)
	outputPattern := fmt.Sprintf("%s/%s/file%%d.m4a", viper.GetString("cache.static"), rid)
	
	log.Println(fmt.Sprint(segment_duration))
	log.Println(segmentList)
	
	cmd := exec.Command(
		"ffmpeg",
		"-i", inWavPath,
		"-muxdelay", "0",
		"-c:a", "aac",
		"-b:a", "128k",
		"-f", "segment",
		"-sc_threshold", "0",
		"-segment_time", fmt.Sprint(segment_duration),
		"-segment_list", segmentList,
		"-segment_format", "mpegts",
		outputPattern,
	)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	err = cmd.Run()
	if err != nil {
		log.Println("error here")
		// Log the detailed ffmpeg error
		log.Printf("ffmpeg stderr: %s", stderr.String())
		return err
	}

	if err = os.Remove(inWavPath); err != nil {
		log.Println(err)
		return err
	}
	return nil
}
