package db

import (
	"github.com/ReneKroon/ttlcache/v2"
	"gopkg.in/stash.v1"
)

type BlobCache struct {
	BadgerClient *badgerClient
	StashClient  *stash.Cache
	TTLCache     *ttlcache.Cache
}

var GoStreamer BlobCache

func InitializeCache() {
	GoStreamer.TTLCache = NewTTLCache()
	GoStreamer.BadgerClient = NewBadgerDB()
	GoStreamer.StashClient = NewStash()
}
