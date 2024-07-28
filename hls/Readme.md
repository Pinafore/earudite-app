# Go HLS Streaming Service

A simple service to cache media files and provide on demand HLS streams for the corresponding media files

---

## Usage

### Config

Create a file `hls.yaml` or modify the existing one with the following parameters:

```yaml
cache:
  dir: "/root/cache" # Cache Directory
  size: "100MB" # Size limit for media cache
  limit: 100 # Limit on number of files in media cache
  tempdir: "/root/temp" # Temporary directory for medial transcoding
  static: "/root/static" # Directory for storing HLS Streams
  expiry: "2m30s" # Expiration time for generated tokens and HLS Streams
  killsize:
    enabled: true # Enables a Kill Switch to prevent extreme disk usage.
    tempdir: "200MB" # Max Size Limit for temp directory, kills program if this is exceeded
    static: "512MB" # Max Size Limit for statuc directory, kills program if this is exceeded

port: 7000 # Port to run the HTTP Server ( alternatively use the --port flag)

handshake: "I-AM-A-SECRET-KEY" # Secret Key to generate tokens

url:
  audio: http://localhost:5000/audio # Download url for audio files such that for a given audio id, the download url is http://localhost:5000/audio/<id>
  vtt: http://localhost:5000/vtt # Download url for vtt files such that for a given audio id, the download url is http://localhost:5000/vtt/<id>
```

### Build

To build the binary run `make depend` to check dependencies, then run `make install` to build the binray.

### Docker

You can also use the provided Dockerfile. Please ensure you modify the `hls.yaml` and mount it correctly at `/root/hls.yaml`.

## Data Flow

1. Generate token:

- Once a user requests a audio, the server backend should send a HTTP POST request to gostreamer with the following parameters:

```json
METHOD : POST
URL : /api/token
PAYLOAD : {
            "handshake" : <handshake key>,
            "qid" : <audioid>
          }
RESPONSE : {
            "token" : <accesstoken>,
            "rid" : <streamid>
          }
```

2. Use stream

- The stream would now be accessible at `http[s]://<url>/hls/<stream id>` , strictly for `cache.expiry`time, only when the request header `x-gostreamer-token` contains the access token. This can be done using the `useQuestion` hook from the `online-answering` npm package:

```tsx
useQuestion({
    backend_url: 'http[s]://<url>/hls',
    recording_id: '<stream id>',
    header: "x-gostreamer-token"
    token: '<access token>',
  })
```

## Data Flow (Batch)

1. Generate token:

- Once a user requests a gameplay, the server backend should send a HTTP POST request to gostreamer with the following parameters:

```json
METHOD : POST
URL : /api/batch
PAYLOAD : {
            "handshake" : "<handshake key>",
            "qids" : ["<audioid1>","<audioid2>,"....],
            "expiry" : "5m30s" // expiry for the entire batch after which it would not be possible to request any token for this batch
          }
RESPONSE : {
            "batchid" : "<batchid>",
            "streams" : [
              {
                "rid" : "<streamid1>",
                "qid" : "<audioid1>"
              },
              {
                "rid" : "<streamid2>",
                "qid" : "<audioid2>"
              },
            ]
          }
```

2. Get Token

You can now access token for the streams that were returned from batch processing using the stream ids. Note that tokens will expire after `cache:expiry` in the config file even when the batch is still valid.

```json
METHOD : POST
URL : /api/unlock
PAYLOAD : {
            "handshake" :"<handshake key>",
            "rid" : "<streamid>"
          }
RESPONSE : {
            "token" : "<accesstoken>",
          }
```

3. Use stream

- The stream would now be accessible at `http[s]://<url>/hls/<stream id>` , strictly for `cache.expiry`time, only when the request header `x-gostreamer-token` contains the access token. This can be done using the `useQuestion` hook from the `online-answering` npm package:

```tsx
useQuestion({
    backend_url: 'http[s]://<url>/hls',
    recording_id: '<stream id>',
    header: "x-gostreamer-token"
    token: '<access token>',
  })
```
