package hls

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/spf13/viper"
)

func SegmentVTT(inVTTPath string, rid string, segment_duration int) error {
	_, err := os.Stat(inVTTPath)
	if os.IsNotExist(err) {
		return err
	}

	segmentList := fmt.Sprintf("%s/%s/sub.m3u8", viper.GetString("cache.static"), rid)
	outputPattern := fmt.Sprintf("%s/%s/sub%%d.vtt", viper.GetString("cache.static"), rid)
	
	cmd := exec.Command(
		"ffmpeg",
		"-i", inVTTPath,
		"-f", "segment",
		"-sc_threshold", "0",
		"-segment_time", fmt.Sprint(segment_duration),
		"-segment_list", segmentList,
		"-segment_list_size", "0",
		"-segment_format", "webvtt",
		"-scodec", "copy",
		outputPattern,
	)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err = cmd.Run()
	if err != nil {
		log.Println("error here")
		// Log the detailed ffmpeg error
		log.Printf("ffmpeg stderr: %s", stderr.String())
		log.Printf("ffmpeg stdout: %s", stdout.String())
		log.Printf("ffmpeg command: %s", cmd.String())
		return err
	}

	if err = os.Remove(inVTTPath); err != nil {
		log.Println(err)
		return err
	}
	return nil
}
