package internal

import (
	"log"
	"os"
)

// Logger is implemented by any logging system that is used for standard logs.
type Logger interface {
	Errorf(string, ...interface{})
	Warningf(string, ...interface{})
	Infof(string, ...interface{})
	Debugf(string, ...interface{})
}

type loggingLevel int

const (
	DEBUG loggingLevel = iota
	INFO
	WARNING
	ERROR
)

type XLogger struct {
	*log.Logger
	level loggingLevel
}

func GetLogger(level loggingLevel, prefix string) *XLogger {
	return &XLogger{Logger: log.New(os.Stderr, prefix, log.LstdFlags), level: level}
}

func (l *XLogger) Errorf(f string, v ...interface{}) {
	if l.level <= ERROR {
		l.Printf("ERROR: "+f, v...)
	}
}

func (l *XLogger) Warningf(f string, v ...interface{}) {
	if l.level <= WARNING {
		l.Printf("WARNING: "+f, v...)
	}
}

func (l *XLogger) Infof(f string, v ...interface{}) {
	if l.level <= INFO {
		l.Printf("INFO: "+f, v...)
	}
}

func (l *XLogger) Debugf(f string, v ...interface{}) {
	if l.level <= DEBUG {
		l.Printf("DEBUG: "+f, v...)
	}
}
