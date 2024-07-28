# from inference.audio import AudioClassifier
import time
import requests
import random
import json
import recordings_database as rd
import os
import copy
import wave
# from inference.classify import classify_and_upload

# os.environ.get("HLS_HANDSHAKE") = "Lt`cw%Y9sg*bJ_~KZ#;|rbfI)nx[r5"
# export HLS_os.environ.get("HLS_HANDSHAKE")="Lt\`cw%Y9sg*bJ_~KZ#;|rbfI)nx[r5"
from pydub import AudioSegment
from pydub.utils import mediainfo

def convert_webm_to_wav(input_file, output_file):
    try:
        # Load the WebM file using pydub
        audio = AudioSegment.from_file(input_file)

        # Check the audio file format and codec
        input_format = mediainfo(input_file)['codec_name']

        # Ensure input file is WebM format
        if input_format != 'opus':
            raise ValueError("Input file must be in WebM (opus) format")

        # Export audio to WAV format
        audio.export(output_file, format="wav")

        print(f"Conversion completed: {output_file}")
    except Exception as e:
        print(f"An error occurred: {e}")

# returns the final time of a VTT string passed in
def get_final_time(vtt):
    time_str = vtt.split("\n")[-2].split(">")[-1].strip()
    minutes, seconds = time_str.split(':')
    minutes = int(minutes)
    seconds = float(seconds)
    total_seconds = (minutes * 60) + seconds
    return total_seconds + 5

    print(vtt.split("\n")[-2].split(">")[-1].strip())
    return 25.0
    return float(vtt.split("\n")[-2].split(":")[-1])


def get_minutes_seconds(seconds):
    minutes = seconds // 60
    seconds %= 60

    return "%02dm%02ds" % (minutes, seconds)


class Game:
    def __init__(self, lobby, socketio):
        # TODO Set settings according to game type
        self.good_game = True

        # game settings
        self.gamecode = lobby.settings["code"]
        self.gamemode = lobby.gamemode  # game type
        self.rounds_num = lobby.settings["rounds"]  # total number of rounds
        self.questions_num = lobby.settings["questions_num"]  # questions per round
        self.tiebreaker = "random"  # method to break ties
        self.buzz_time = 15  # time a player is given to answer after buzzing
        self.post_buzz_time = lobby.settings[
            "post_buzz_time"
        ]  # time after a question that a player can still buzz
        self.gap_time = lobby.settings["gap_time"]  # time between questions
        self.teams = lobby.settings["teams"]
        self.players = lobby.settings["players"]
        self.auth_token = lobby.auth_token

        # HLS Tokens
        self.socketio = socketio
        self.hls_rids = []
        self.hls_tokens = []
        try:
            raw_questions = requests.get(
                os.environ.get("BACKEND_URL") + "/question",
                params={"batchSize": self.questions_num * self.rounds_num},
                headers={"Authorization": self.auth_token},
            ).json()["results"]
            self.questions = []  # id, qb_id, time length
            for question in raw_questions:
                final_vtt = requests.get(
                    os.environ.get("BACKEND_URL") + "/hls/vtt/" + question["audio"][0]["id"] + "?batch",
                    headers={"Authorization": self.auth_token},
                )

                print("QUESTION HERE", question["audio"])
                print([question["audio"][question_index]["id"] for question_index in range(len(question["audio"]))])
                self.questions.append(
                    [
                        [question["audio"][question_index]["id"] for question_index in range(len(question["audio"]))][0], #BIJAN
                        question["qb_id"],
                        get_final_time(final_vtt.text)
                        + self.post_buzz_time,
                    ]
                )
            
            print('questions', self.questions)
            for i in range(len(self.questions)): # FIRST QUESTION ONLY
                self.hls_tokens.append("")
                self.hls_rids.append("")

            expiry_time = get_minutes_seconds(
                round(
                    sum([i[2] for i in self.questions])
                    + (self.gap_time + 10) * len(self.questions)
                )
            )

            print("Getting HLS data for game " + str(self.gamecode))
            print("Expiry time: " + str(expiry_time))

            try:
                print([i[0] for i in self.questions])
                hls_response = requests.post(
                    os.environ.get("HLS_URL") + "/api/batch",
                    data={
                        "handshake": os.environ.get("HLS_HANDSHAKE"),
                        "qids": [i[0] for i in self.questions],
                        "expiry": str(expiry_time)
                        # all the questions added up + the gap times between them + 30 seconds
                    },
                )
                print(os.environ.get("HLS_URL"))
                print(hls_response.json())
                print("DONE HERE")
                print(self.questions)
                qids = [x[0] for x in self.questions]
                print("==========")
                print(self.questions)
                #self.questions[0][0] = self.questions[0][0][0]
                #print(self.questions)
                #self.questions[0] 
                print("==========")
                print(qids)
                #self.hls_rids = [0] * len(qids)
                for pair in hls_response.json()["streams"]:
                    
                    print(self.hls_rids)

                    self.hls_rids[qids.index(pair["qid"])] = pair["rid"]
                    #arr[
                    #    [x[0] for x in self.questions].index(pair["qid"])
                    #] = pair["rid"]

                print("LAST LINE", self.hls_rids)
            except Exception as e:
                raise e #print(e)
                print(e)
                self.good_game = False
                socketio.emit("startgamefailed")
                socketio.emit(
                    "alert", ["error", "Starting game failed"], to=self.gamecode
                )

            # for game state
            self.active_game = True  # active
            self.active_question = [False, 0]  # active, time started
            self.active_buzz = [
                False,
                0,
                0,
                "",
            ]  # active, time started, question time remaining at buzz, username
            self.active_gap = [True, time.time()]  # active, time started
            self.round = 1  # current round
            self.question = 1  # current question
            self.buzzer = ""  # username of person who buzzed
            self.prev_answers = []
            self.points = {}
            if self.teams == 0:
                for player in self.players:
                    self.points[player] = 0
            else:
                self.points = [{}, {}]
                for player in self.players[0]:
                    self.points[0][player] = 0
                for player in self.players[1]:
                    self.points[1][player] = 0

            # for storage
            self.date = time.strftime(
                "%Y %m %d %H %M %S", time.gmtime()
            )  # Year month day hour minute second (UTC)
            self.rounds = []  # rounds[i][j] = time length of question j in round i
            self.buzz_recording = [
                [[] for i in range(self.questions_num)] for j in range(self.rounds_num)
            ]  # buzz_recording[i][j][k] = buzz time of round i, question j, buzz k
            self.answering_ids = (
                []
            )  # answering_ids[i][j] = answer of round i, question j
            self.recording_json = {}

            questions_ptr = 0
            for i in range(self.rounds_num):
                round1 = []
                answering_ids1 = []
                for j in range(self.questions_num):
                    round1.append(self.questions[questions_ptr][2])
                    answering_ids1.append(self.questions[questions_ptr][1])
                    questions_ptr += 1
                self.rounds.append(round1)
                self.answering_ids.append(answering_ids1)

            unlock_response = requests.post(
                os.environ.get("HLS_URL") + "/api/unlock",
                data={"handshake": os.environ.get("HLS_HANDSHAKE"), "rid": self.hls_rids[0]},
            ).json()
            self.hls_tokens[0] = unlock_response["token"]
        except Exception as e:
            print("Potential audio error", e)
            raise e
            self.good_game = False
            socketio.emit("startgamefailed")
            socketio.emit("alert", ["error", "Starting game failed"], to=self.gamecode)

    # returns the current game state
    # round #, question #, question time remaining, buzz time remaining, gap time remaining
    def gamestate(self):
        if not self.active_game:  # game is over
            return [self.active_game, 0, 0, 0, 0, 0, 0, self.points]
        if self.active_gap[0]:  # between questions
            # if gap time is over, move to question
            if self.get_gap_time() < 0:
                question_idx = (
                    ((self.round - 1) * self.questions_num) + self.question - 1
                )
                self.prev_answers = [] # clear previous answers
                print("IN GAME STATE RIDS", self.hls_rids)
                print("IN GAME STATE TOKENS", self.hls_tokens)
                self.socketio.emit(
                    "hlsupdate",
                    {
                        "rid": self.hls_rids, #SENDING ALL #self.hls_rids[question_idx],
                        "token": self.hls_tokens,
                        "classifiable": False
                        #     AudioClassifier.is_predictable(
                        #     self.answering_ids[self.round - 1][self.question - 1]
                        # ),
                    },
                    to=self.gamecode,
                )
                self.active_gap = [False, 0]
                self.active_question = [True, time.time()]

        if self.active_buzz[0]:  # in a buzz
            # if buzz time is over, keep going through question
            if self.get_buzz_time() < 0:
                if self.teams == 0:
                    self.points[self.active_buzz[3]] -= 5
                else:
                    for team in self.points:
                        if self.active_buzz[3] in team:
                            team[self.active_buzz[3]] -= 5
                self.active_question[1] = self.active_question[1] + self.buzz_time
                self.active_buzz = [False, 0, 0]
                self.buzzer = ""
                self.socketio.emit("answeredincorrectly", {}, to=self.gamecode)

        if self.active_question[0]:  # in a question
            # if question time is over, check round & question number- go to gap OR to next round OR end game
            unlock_next = True
            if self.get_question_time() <= 0:
                if len(self.prev_answers) == 0 or not self.prev_answers[-1][1] or self.prev_answers[-1][0] == 'Answered via classifier':
                    correct_answer = requests.get(
                        os.environ.get("BACKEND_URL") + "/answer_full/" + str(self.answering_ids[self.round - 1][self.question - 1])
                    ).json()
                    self.prev_answers.append([correct_answer['answer'], True])
                self.question += 1
                self.active_gap = [True, time.time()]
                self.active_question = [False, 0]
                # add correct answers to answer list


                if self.question > self.questions_num:
                    self.question = 1
                    self.round += 1
                    if self.round > self.rounds_num:
                        unlock_next = False
                        self.round = 0
                        self.question = 0
                        self.active_gap = [False, 0]
                        self.active_game = False
                        self.save_game()

                if unlock_next:
                    question_idx = (
                            ((self.round - 1) * self.questions_num) + self.question - 1
                    )
                    unlock_response = requests.post(
                        os.environ.get("HLS_URL") + "/api/unlock",
                        data={
                            "handshake": os.environ.get("HLS_HANDSHAKE"),
                            "rid": self.hls_rids[question_idx],
                        },
                    ).json()
                    self.hls_tokens[question_idx] = unlock_response["token"]
                    

        return [
            self.active_game,
            self.round,
            self.question,
            self.get_question_time(),
            self.get_buzz_time(),
            self.get_gap_time(),
            self.buzzer,
            self.points,
            self.prev_answers
        ]

    # gets new question + tells HLS to get new question
    def get_new_question(self):
        return 1
        # question_idx = ((self.round-1) * self.questions_num) + self.question
        # hls_response = requests.post('http://127.0.0.1:3500/token',
        #                                 data={
        #                                     'handshake': os.environ.get("HLS_HANDSHAKE"),
        #                                     'qid': self.questions[question_idx][0]
        #                                 }
        #                              )
        # print(hls_response.text)
        # return {'token': hls_response['token'], 'rid': hls_response['rid']}

    # makes adjustments to timers when buzzing
    def buzz(self, username):
        if self.active_buzz[0] or not self.active_question[0]:
            return 0
        elif any(username in sublist for sublist in self.buzz_recording[self.round - 1][self.question - 1]):
            return 1
        else:
            self.buzzer = username
            self.active_buzz = [True, time.time(), self.get_question_time(), username]
            self.buzz_recording[self.round - 1][self.question - 1].append(
                ["buzz", self.active_buzz[2], username]
            )
            print("Buzzed at: " + str(self.active_buzz[2]))
            return 2

    # check answer while buzzed
    def answer(self, username, answer):
        # if game is over, return 0
        if not self.active_buzz[0]:
            return False
        else:
            correct = json.loads(
                requests.get(
                    os.environ.get("BACKEND_URL") + "/answer",
                    params={
                        "a": answer,
                        "qid": self.answering_ids[self.round - 1][self.question - 1],
                    },
                    headers={"Authorization": self.auth_token},
                ).text
            )["correct"]
            print(
                "qb_id for current question: "
                + str(self.answering_ids[self.round - 1][self.question - 1])
            )
            print(
                answer
                + " for Q:"
                + str(self.question)
                + "/R:"
                + str(self.round)
                + " was "
                + ("correct" if correct else "incorrect")
            )
            self.prev_answers.append([answer, correct])
            self.active_question[1] = (
                    time.time() - self.active_buzz[1] + self.active_question[1]
            )  # readjust active question timer
            self.buzz_recording[self.round - 1][self.question - 1].append(
                ["answer", correct, self.get_buzz_time(), username]
            )

            if correct:
                self.active_question[1] = (
                        time.time()
                        - self.active_question[1]
                        - self.rounds[self.round - 1][self.question - 1]
                )  # readjust active question timer
                if self.teams == 0:
                    self.points[username] += 10
                else:
                    for team in self.points:
                        if username in team:
                            team[username] += 10
                self.socketio.emit("answeredcorrectly", {}, to=self.gamecode)
            else:
                if self.teams == 0:
                    self.points[username] -= 5
                else:
                    for team in self.points:
                        if username in team:
                            team[username] -= 5
                self.socketio.emit("answeredincorrectly", {}, to=self.gamecode)
            print(self.points)
            self.active_buzz = [False, 0]
            self.buzzer = ""
            return True

        # check answer while buzzed

    def classifier_answer(self, username, filename):
        print("classifier_answer reached with filename " + filename)
        # if game is over, return 0
        if not self.active_buzz[0]:
            print("classifier_answer no active buzz")
            return False
        else:
            qid = self.answering_ids[self.round - 1][self.question - 1]
            print("classifier_answer found file")
            correct = True




            answer = requests.get("{}/answer_full/{}".format(os.environ.get("BACKEND_URL"), qid)).json()["answer"]
            convert_webm_to_wav('answer-audios/' + filename, 'answer-audios/wav_' + filename)
            frames = None
            with wave.open('answer-audios/wav_' + filename, 'rb') as wf:
                frames = wf.readframes(wf.getnframes())

            # Convert frames to a list of integers
            sound_data = list(frames)

            files = {'file': ('answer-audios/wav_' + filename, open('answer-audios/wav_' + filename, 'rb'), 'audio/x-wav')}
            payload = {
                #"sound": sound_data, #list(b"".join(frames)),
                "ground_truth": answer.upper(),
                #"fr": 44100
            }

            print("SENDING HERE")
            response = requests.post(os.environ.get("FORCED_DECODING") + "/api/getConfidence", data=payload, files=files) #$"/" + str(44100) + "/" + "_".join(answer.split(" ")), files=files)
            print("DONE SENDING")
            answer = True
            bad_prob = 0

            #if response.status_code == 200:

            if response.text != "0\n":

                # probabilities given to us as seperate lines
                prob_arr = [float(p) for p in response.text.split("\n")[:-1]]
                print(prob_arr)

                # our measure of correctness (one bad word is enough to be incorrect)
                correct = True

                if len(prob_arr) == 0:
                    correct = False
                else:
                    for curr in prob_arr:
                        if curr < 0.1:
                            bad_prob = curr
                            correct = False
                            break
    
                if correct:
                    answer = True
                    print("CORRECT")
                else:
                    answer = False
                    print("INCORRECT")

            # correct = classify_and_upload(filename, qid)
            print(
                "qb_id for current question: "
                + str(self.answering_ids[self.round - 1][self.question - 1])
            )
            print(
                "Audio for Q:"
                + str(self.question)
                + "/R:"
                + str(self.round)
                + " was classified as "
                + ("correct" if correct else "incorrect")
            )

            if correct:
                self.prev_answers.append(["Answered via classifier", correct])
                self.active_question[1] = (
                        time.time() - self.active_buzz[1] + self.active_question[1]
                )  # readjust active question timer
                self.buzz_recording[self.round - 1][self.question - 1].append(
                    ["answer", correct, self.get_buzz_time(), username]
                )
            else:
                self.prev_answers.append([str(bad_prob * 100) + "%", correct])
                self.active_question[1] = (
                        time.time() - self.active_buzz[1] + self.active_question[1]
                )  # readjust active question timer
                self.buzz_recording[self.round - 1][self.question - 1].append(
                    ["answer", correct, self.get_buzz_time(), username]
                )


            if correct:
                self.active_question[1] = (
                        time.time()
                        - self.active_question[1]
                        - self.rounds[self.round - 1][self.question - 1]
                )  # readjust active question timer
                if self.teams == 0:
                    self.points[username] += 10
                else:
                    for team in self.points:
                        if username in team:
                            team[username] += 10
                self.socketio.emit("answeredcorrectly", {}, to=self.gamecode)
            else:
                if self.teams == 0:
                    self.points[username] -= 5
                else:
                    for team in self.points:
                        if username in team:
                            team[username] -= 5
                self.socketio.emit("answeredincorrectly", {}, to=self.gamecode)
            print(self.points)
            self.active_buzz = [False, 0]
            self.buzzer = ""
            return True

    # get remaining question time
    def get_question_time(self):
        # if in the middle of a buzz, set the question time to the buzz time
        # if game is over, return 0
        if not self.active_game:
            return 0

        if self.active_question[0]:
            if self.active_buzz[0]:
                return self.active_buzz[2]
            else:
                return (
                        self.active_question[1]
                        + self.rounds[self.round - 1][self.question - 1]
                        - time.time()
                )
        else:
            return self.rounds[self.round - 1][self.question - 1]

    # get remaining buzz time
    def get_buzz_time(self):
        if not self.active_game:
            return 0

        if self.active_buzz[0]:
            return self.active_buzz[1] + self.buzz_time - time.time()
        else:
            return self.buzz_time

    # get remaining gap time
    def get_gap_time(self):
        if not self.active_game:
            return 0

        if not self.active_gap[0]:
            return self.gap_time
        return self.active_gap[1] + self.gap_time - time.time()

    # save game's buzz times into text
    def save_game(self):

        self.recording_json["buzz_recording"] = self.buzz_recording
        self.recording_json["settings"] = {}
        self.recording_json["settings"]["gamemode"] = self.gamemode
        self.recording_json["settings"]["rounds_num"] = self.rounds_num
        self.recording_json["settings"]["questions_num"] = self.questions_num
        self.recording_json["settings"]["tiebreaker"] = self.tiebreaker
        self.recording_json["settings"]["buzz_time"] = self.buzz_time
        self.recording_json["settings"]["post_buzz_time"] = self.post_buzz_time
        self.recording_json["settings"]["gap_time"] = self.gap_time
        self.recording_json["settings"]["teams"] = self.teams
        self.recording_json["settings"]["players"] = self.players
        self.recording_json["date"] = self.date
        self.recording_json["questions"] = [
            {"id": i[0], "qb_id": i[1]} for i in self.questions
        ]

        # POST SCORES TO LEADERBOARDS
        pointsObj = {}
        if self.teams == 0:
            pointsObj["ratings"] = self.points
        else:
            pointsObj["ratings"] = copy.deepcopy(self.points[0])
            pointsObj["ratings"].update(self.points[1])
        requests.post(
            os.environ.get("BACKEND_URL") + "/game/ratings",
            json=pointsObj
        )
        

        # POST RECORDING
        recording_code = rd.database.add_recording(self.recording_json)
        requests.post(
            os.environ.get("BACKEND_URL") + "/game",
            json={"id": recording_code, "session": self.recording_json},
        )
        print(
            "Recording of game "
            + str(self.gamecode)
            + " saved at "
            + str(recording_code)
        )
