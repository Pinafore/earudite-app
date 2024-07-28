# How to run

1. Clone the repository
2. Switch to the dev2 branch
3. Run npm install
4. Run `yarn start`. This runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

# Common Solutions to Running Errors
- https://stackoverflow.com/questions/46013544/yarn-install-command-error-no-such-file-or-directory-install

# File structure

Most files are in 3 folders: `assets`, `components`, and `styles`. More documentation is available inside each file.

## Assets

Contains images, svgs, sound effects, etc. 

## Components

Contains all of the react hooks. 

`AnimatedCard` - Legacy hook, not used in the current website. It displays a small tile with customizable image, title, and description that animates on hover

`AnswerBox` - Contains the answering hook used in all games (the textbox + toggles for voice controls + the voice controls)

`AudioRecorder` - Contains the hook for recording (and saving the recording) sentence-by-sentence in the shop.

`CreateAccount` - Contains the hook for the create account page displayed when a user logs in for the first time

`Dashboard` - Contains the hook for the dashboard page

`Game` - Contains the hook with socket integration for live gameplay

`Leaderboards` - Contains the hook for the leaderboards page

`Lobby` - Contains the hook for the lobby created upon lobby start (from the `Play` page)

`Play` - Contains the hook for the play page

`Player` - Legacy hook that played a VTT and Wav Audio in sync.

`Profile` - Contains the hook for the profile page

`Record` - Legacy hook that for recording a transcript

`Shop` - Contains the hook for the shop page

`StatsCardsAccordion` - Contains the hook for the stats cards (from the `Profile` page)

`Tooltip` - Legacy hook for putting a tooltip on an element on hover

`WhitePanel` - Hook behind the entire app that encapsulates all the other hooks. 

## Styles

Contains all of the css files for the entire app. Files are named exactly the same as their corresponding hook except with the `.css` suffix replacing `.jsx`
