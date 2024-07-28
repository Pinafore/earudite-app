package hls

import (
	"fmt"
	"sync"
	"time"

	"github.com/Mshivam2409/hls-streamer/internal/db"
	uuid "github.com/satori/go.uuid"
	"github.com/spf13/viper"
	"go.uber.org/multierr"
)

type Batch struct {
	Qids      []string `json:"qids"`
	Handshake string   `json:"handshake"`
	Expiry    string   `json:"expiry"`
}

type HLSStream struct {
	Qid string `json:"qid"`
	Rid string `json:"rid"`
}

type BatchProcessingResult struct {
	BatchId string      `json:"batchid"`
	Rids    []HLSStream `json:"streams"`
}

func TranscodeHLSBatch(audioBatch Batch) (BatchProcessingResult, error) {

	var ProcessingGroup sync.WaitGroup
	ProcessingGroup.Add(len(audioBatch.Qids))

	processingErrorChan := make(chan error)
	processingDoneChan := make(chan int)
	processingErrors := make([]error, 0)
	audioIdChan := make(chan HLSStream)
	audioIdList := make([]HLSStream, 0)

	dur, err := time.ParseDuration(audioBatch.Expiry)
	if err != nil {
		dur = 30 * time.Minute
	}

	go func() {
		for {
			select {
			case err := <-processingErrorChan:
				processingErrors = append(processingErrors, err)

			case id := <-audioIdChan:
				audioIdList = append(audioIdList, id)

			case <-processingDoneChan:
				close(processingErrorChan)
				close(processingDoneChan)
				return
			}
		}
	}()

	for idx := range audioBatch.Qids {
		go func(item *string, idx int, expiry time.Duration) {
			defer ProcessingGroup.Done()
			wavPath, err := db.WriteWAV(*item)
			if err != nil {
				processingErrorChan <- err
				return
			}

			vttPath, err := db.WriteVTT(*item)
			if err != nil {
				processingErrorChan <- err
				return
			}
			rid := uuid.NewV4().String()
			err = TranscodeHLS(wavPath, vttPath, rid)
			if err != nil {
				processingErrorChan <- err
				return
			}
			err = db.GoStreamer.TTLCache.SetWithTTL(rid, fmt.Sprintf("%s/%s", viper.GetString("cache.static"), rid), dur)
			if err != nil {
				processingErrorChan <- err
				return
			}
			audioIdChan <- HLSStream{Qid: *item, Rid: rid}

		}(&audioBatch.Qids[idx], idx, dur)
	}

	ProcessingGroup.Wait()

	processingDoneChan <- 0

	logger.Infof(fmt.Sprintln(processingErrors, audioIdList))

	return BatchProcessingResult{BatchId: uuid.NewV4().String(), Rids: audioIdList}, multierr.Combine(processingErrors...)
}

// func someFailingOperation() error {
// 	return errors.New("something went wrong")
// }
