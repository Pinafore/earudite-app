package cmd

import "github.com/Mshivam2409/hls-streamer/internal"

var logger internal.XLogger

func init() {
	logger = *internal.GetLogger(1, "viper  ")
}
