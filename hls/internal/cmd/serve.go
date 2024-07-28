package cmd

import (
	"log"
	"os"

	"github.com/Mshivam2409/hls-streamer/internal/api"
	"github.com/Mshivam2409/hls-streamer/internal/db"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func init() {
	rootCmd.AddCommand(serveCmd)
	serveCmd.Flags().Int("port", 5000, "Specify the port for HLS server")
	viper.BindPFlag("port", serveCmd.Flags().Lookup("port"))
}

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Starts the HTTP Server",
	RunE: func(cmd *cobra.Command, args []string) error {

		db.InitializeCache()
		f := viper.GetString("cache.static")
		_, err := os.Stat(f)
		if os.IsNotExist(err) {
			err = os.MkdirAll(f, 0777)
			if err != nil {
				log.Fatalln(err)
				return err
			}
		} else {
			err := db.RemoveContents(f)
			if err != nil {
				log.Fatalln(err)
				return err
			}
		}
		if err != nil {
			log.Fatalln(err)
			return err
		}

		t := viper.GetString("cache.tempdir")
		_, err = os.Stat(t)
		if os.IsNotExist(err) {
			err = os.MkdirAll(t, 0777)
			if err != nil {
				log.Fatalln(err)
				return err
			}
		} else {
			err := db.RemoveContents(t)
			if err != nil {
				log.Fatalln(err)
				return err
			}
		}
		if err != nil {
			log.Fatalln(err)
			return err
		}

		if err := api.HTTPListen(); err != nil {
			return err
		}
		return nil
	},
}
