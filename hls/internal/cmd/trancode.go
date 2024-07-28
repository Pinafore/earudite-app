package cmd

import (
	"errors"
	"log"
	"path/filepath"

	"github.com/Mshivam2409/hls-streamer/internal/hls"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(transcodeCmd)
}

var transcodeCmd = &cobra.Command{
	Use:   "trancode",
	Short: "Transcodes the given wav and vtt files into a HLS stream.",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) != 3 {
			return errors.New("requires a color argument")
		}
		if filepath.Ext(args[0]) != ".wav" {
			return errors.New("first Argument must be a wav file")
		}
		if filepath.Ext(args[1]) != ".vtt" {
			return errors.New("first Argument must be a vtt file")
		}
		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		if err := hls.TranscodeHLS(args[0], args[1], args[2]); err != nil {
			log.Println(err.Error())
			return err
		}
		return nil
	},
}
