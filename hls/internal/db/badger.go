package db

import (
	"fmt"
	"log"
	"time"

	"github.com/dgraph-io/badger/v3"
	"github.com/spf13/viper"
)

type badgerClient struct {
	d *badger.DB
}

func NewBadgerDB() *badgerClient {
	db, err := badger.Open(badger.DefaultOptions(fmt.Sprintf("%s/.badger", viper.GetString("cache.dir"))))
	if err != nil {
		log.Fatal(err)
	}
	err = db.DropAll()
	if err != nil {
		log.Fatal(err)
	}
	return &badgerClient{db}
}

func (b badgerClient) Save(key string, value string, ttl time.Duration) error {
	err := b.d.Update(func(txn *badger.Txn) error {
		e := badger.NewEntry([]byte(key), []byte(value)).WithTTL(ttl)
		err := txn.SetEntry(e)
		return err
	})
	return err
}

func (b badgerClient) Get(key string) (string, error) {
	var p []byte

	err := b.d.View(func(txn *badger.Txn) error {
		item, err := txn.Get([]byte(key))

		if err != nil {
			logger.Errorf(err.Error())
			return err
		}

		err = item.Value(func(val []byte) error {
			p = append([]byte{}, val...)
			return err
		})

		return nil
	})
	if err != nil {
		logger.Errorf(err.Error())
		return "", err
	}

	return string(p), err
}
