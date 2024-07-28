import '../styles/CreateAccount.css';
import { useState } from "react";
import { useAlert } from 'react-alert';
import { useRecoilValue, useSetRecoilState } from "recoil";
import { PROFILE, SCREEN, URLS, INTERFACE_NAME } from "../store";
import firebase from 'firebase';
import axios from 'axios';


//hook for creating accounts
function CreateAccount(props) {
    const urls = useRecoilValue(URLS);
    const [username, setUsername] = useState('');
    const setScreen = useSetRecoilState(SCREEN);
    const placeholderUsername = "mickthemouse123";
    const maxUsernameLength = 16;
    const setProfile = useSetRecoilState(PROFILE);
    const interface_name = useRecoilValue(INTERFACE_NAME);
    const alert2 = useAlert();

    // Terms & Conditions
    const [createAccountScreen, setCreateAccountScreen] = useState("normal");
    const [registerAttempts, setRegisterAttempts] = useState(0);
    const [termsAgreed, setTermsAgreed] = useState(false);

    //restricts usernames to alphanumeric
    function handleUsername(event) {
        setUsername(event.target.value.replace(/[^a-z0-9]/gi,''));
    }

    //registers the user
    function register() {
        if(username.length > maxUsernameLength) {
            alert2.error("Username must be at most " + maxUsernameLength + " characters long");
            return;
        }
        if(!termsAgreed) {
            if(registerAttempts <= 0) {
                setRegisterAttempts(1);
                alert("Please agree to the terms and conditions, privacy policy, and consent form to finish registration.");
            } else {
                setCreateAccountScreen("disagreed");
            }
        } else {
            // Agreed to consent
            axios.post(urls['dataflow'] + '/profile', {
                    pfp: [0],
                    username: username,
                    consented: true
                })
                .then(function () {
                    axios.get(urls['dataflow'] + '/profile')
                        .then(function (response) {
                            // handle success
                            setProfile(response['data']);
                            setScreen(2);
                        })
                        .catch(function (error) {
                            if(error.response.status === 404) {
                                setScreen(7);
                            }
                        });
                })
                .catch(function (error) {
                    alert2.error("Failed to register account");
                });
        }
    }

    return (
        <div class="createaccount-content-wrapper">
            <div class="createaccount-quizzr-title">
                {interface_name}
            </div>
            <div class="createaccount-quizzr-subtitle">
                <b>the</b> quiz game
            </div>
            {createAccountScreen === "normal" &&
                <div class="createaccount-body-wrapper">
                    <div class="createaccount-welcome-wrapper">
                        <div class="createaccount-welcome-welcome">
                            Welcome, 
                        </div>
                        <div class="createaccount-welcome-firstname">
                            {firebase.auth().currentUser.displayName}
                        </div>
                    </div>
                    <div class="createaccount-description">
                        Before you can play, we just need some last bits of information from you: 
                    </div>
                    <div class="createaccount-username-label">
                        <div>
                            Username: 
                        </div>
                        <div class="createaccount-username-textbox-wrapper">
                            <div class="createaccount-tinylabel"></div>
                            <input type="text" value={username} placeholder={placeholderUsername} onChange={handleUsername} class="createaccount-username-textbox"/>
                            <div class="createaccount-tinylabel">
                                Alphanumeric characters only. {maxUsernameLength} characters max
                            </div>
                        </div>
                    </div>
                    <div class="createaccount-consent-label">
                        <div class="createaccount-consent-label-text">
                            By clicking on the "Agree" button below you indicate that you are at least 18 years of age; you have read the 
                            &nbsp;<a href="https://docs.google.com/document/d/1pQq3HgdMJy_4cahZ5DvRCkMAYkbsIe-OHZL58z0-VuU/edit?usp=sharing" target="_blank" rel="noopener noreferrer">User Terms and Conditions</a> 
                            &nbsp;and 
                            &nbsp;<a href="https://docs.google.com/document/d/1IFyZkc-wjfpTmME08WWXsJwneRB5jBh7/edit?usp=sharing&ouid=117138658017388824283&rtpof=true&sd=true" target="_blank" rel="noopener noreferrer">Consent to Participate form</a> 
                            &nbsp;or have had it read to you; your questions have been answered to your satisfaction and you voluntarily agree to participate in this research study. You will receive a copy of the "User Terms and Conditions" and "Privacy Policy &#38; Consent to Participate" forms.
                            <br/>
                            <br/>
                            If you agree to participate, please select "Agree" below.
                        </div>
                        <div class="createaccount-consent-btn-wrapper">
                            <div className={'createaccount-consent-btn createaccount-consent-btn-right' + (termsAgreed ? " createaccount-consent-btn-selected-right" : "")} onClick={() => {setTermsAgreed(true)}}>
                                Agree
                            </div>
                            <div className={'createaccount-consent-btn' + (termsAgreed ? "" : " createaccount-consent-btn-selected")} onClick={() => {setTermsAgreed(false)}}>
                                Disagree
                            </div>
                        </div>
                    </div>
                    <div class="createaccount-footer-btn-wrapper">
                        <div class="createaccount-footer-btn-register" onClick={register}>
                            Register
                        </div>
                        <div class="createaccount-footer-btn-cancel" onClick={() => {firebase.auth().signOut();}}>
                            Cancel
                        </div>
                    </div>
                </div>
            }
            {createAccountScreen === "disagreed" &&
                <div class="createaccount-body-wrapper">
                    <div class="createaccount-welcome-wrapper">
                        <div class="createaccount-welcome-welcome">
                            Thank you for your time, 
                        </div>
                        <div class="createaccount-welcome-firstname">
                            {firebase.auth().currentUser.displayName}
                        </div>
                    </div>
                    <div class="createaccount-description">
                        Unfortunately, for legal, financial, and ethical reasons, we are unable to provide Earudite accounts for users who do not agree to our terms and conditions, privacy policy, and consent form.
                        <br/>
                        <br/>
                        However, if you ever change your mind, realize you made a mistake, or otherwise become able to agree, please reload this page to return to the normal registration flow.
                        <br/>
                        <br/>
                        Have a great day,
                        <br/>
                        - The Earudite Team
                    </div>
                </div>
            }
        </div>
    );
}

export default CreateAccount;
