import { atom } from "recoil";
import socketIOClient from "socket.io-client";

const URLS = atom({ // change to real URLS
    key: 'URLS',
    default: {
        'dataflow': process.env.REACT_APP_PUBLIC_DATAFLOW_URL,
        'socket': process.env.REACT_APP_PUBLIC_SOCKET_URL,
        'socket_flask': process.env.REACT_APP_PUBLIC_SOCKETFLASK_URL,
        'HLS': process.env.REACT_APP_PUBLIC_HLS_URL,
    }
})

const INTERFACE_NAME = atom({
    key: 'INTERFACE_NAME',
    default: "Earudite"
})

const AUDIO_BLOB = atom<Blob | undefined>({
    key: 'AUDIO_BLOB',
    default: undefined
})

const TEXT = atom<String>({
    key: 'ASR',
    default: ""
})

const SCREEN = atom({
    key: 'SCREEN',
    default: -1
})

const PLAY_SCREEN = atom({
    key: 'PLAY_SCREEN', // 0 = select gamemode screen, 1 = in-lobby screen
    default: "home"
})

const JOIN_CUSTOM_LOBBY_SCREEN = atom({
    key: 'JOIN_CUSTOM_LOBBY_SCREEN',
    default: false
})

const LOBBY_CODE = atom({
    key: 'LOBBY_CODE',
    default: ""
})


const SOCKET_ENDPOINT = process.env.REACT_APP_PUBLIC_SOCKET_URL || 'http://127.0.0.1:4000';
const SOCKET_PATH = process.env.REACT_APP_PUBLIC_SOCKET_PATH || '/socket.io'
const SOCKET = atom({
    key: 'SOCKET',
    default: socketIOClient(SOCKET_ENDPOINT,{path:SOCKET_PATH})
})

const PLAYERS = atom({
    key: 'PLAYERS',
    default: [""]
})

const PROFILE = atom({
    key: 'PROFILE',
    default: undefined
})

const TRANSCRIPTS = atom({
    key: 'TRANSCRIPTS',
    default: [
        [
            {"transcript": ""},
            {"transcript": ""},
            {"transcript": ""},
            {"transcript": ""},
        ],
        [
            {"transcript": ""},
            {"transcript": ""},
            {"transcript": ""},
            {"transcript": ""},
        ],
        [
            {"transcript": ""},
            {"transcript": ""},
            {"transcript": ""},
            {"transcript": ""},
        ]
    ]
})

const AUTHTOKEN = atom({
    key: 'AUTHTOKEN',
    default: ""
})

const GAMESETTINGS = atom({
    key: 'GAMESETTINGS',
    default: {
        'players': [''],
        'max_players': 8,
        'teams': 0,
        'rounds': 3,
        'questions_num': 10,
        'gap_time': 10,
        'post_buzz_time': 5,
        // tiebreaker
        // topics
    }
})

const PREVSCREEN = atom({
    key: 'PREVSCREEN',
    default: -1
})




export { URLS, AUDIO_BLOB, TEXT, SCREEN, PLAY_SCREEN, JOIN_CUSTOM_LOBBY_SCREEN, LOBBY_CODE, SOCKET, PLAYERS, PROFILE, TRANSCRIPTS, AUTHTOKEN, GAMESETTINGS, PREVSCREEN, INTERFACE_NAME }

