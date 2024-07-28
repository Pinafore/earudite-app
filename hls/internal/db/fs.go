package db

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	uuid "github.com/satori/go.uuid"
	"github.com/spf13/viper"
)

func RemoveContents(dir string) error {
	d, err := os.Open(dir)
	if err != nil {
		return err
	}
	defer d.Close()
	names, err := d.Readdirnames(-1)
	if err != nil {
		return err
	}
	for _, name := range names {
		err = os.RemoveAll(filepath.Join(dir, name))
		if err != nil {
			return err
		}
	}
	return nil
}

func DirSize(path string) (int64, error) {
	var size int64
	err := filepath.Walk(path, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			size += info.Size()
		}
		return err
	})
	return size, err
}

func WriteWAV(qid string) (string, error) {
	b, err := GetWAV(qid)

	if err != nil {
		logger.Errorf(err.Error())
		return "", err
	}

	fname := uuid.NewV4().String()
	err = ioutil.WriteFile(fmt.Sprintf("%s/%s.wav", viper.GetString("cache.tempdir"), fname), b, 0777)
	if err != nil {
		logger.Errorf(err.Error())
		return "", err
	}
	return fmt.Sprintf("%s/%s.wav", viper.GetString("cache.tempdir"), fname), err
}

func WriteVTT(qid string) (string, error) {
	b, err := GetVTT(qid)

	if err != nil {
		logger.Errorf(err.Error())
		return "", err
	}

	fname := uuid.NewV4().String()
	err = ioutil.WriteFile(fmt.Sprintf("%s/%s.vtt", viper.GetString("cache.tempdir"), fname), b, 0777)
	if err != nil {
		logger.Errorf(err.Error())
		return "", err
	}
	return fmt.Sprintf("%s/%s.vtt", viper.GetString("cache.tempdir"), fname), err
}
