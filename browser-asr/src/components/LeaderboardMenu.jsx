import "../styles/LeaderboardMenu.css";
import "../styles/Leaderboards.css";
// import { useEffect } from "react";

// Hook for displaying older leaderboards
function LeaderboardMenu(props) {
    // useEffect(() => {
    //     console.log(props.years);
    //     console.log(Object.entries(props.years));
    //     console.log(Object.entries(props.years).map(([year, months]) => [year, months]))
    // });
    return (
        <div class="leaderboard-menu-wrapper">
            <div class="leaderboards-board-title">
                Past Leaderboards
            </div>
            <div class="leaderboard-menu-content-wrapper-wrapper">
                <div class="leaderboard-menu-content-wrapper">
                    {props.years.map(([year, months]) => (
                        <Year key={year} year={year} months={months} setBoardCallback={props.setBoardCallback}/>
                    ))}
                    {/* <Year year={2022} months={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]}/> */}
                </div>
            </div>
        </div>
    );
}

function Year(props) {
    return (
        <div class="leaderboard-menu-year-wrapper">
            <div class="leaderboard-menu-year-text">{props.year}</div>
            <div class="leaderboard-menu-year-divider"></div>
            {props.months.map((month) => (
                <Month key={props.year.toString() + month} month={month} year={props.year} setBoardCallback={props.setBoardCallback}/>
            ))}
        </div>
    );
}

function Month(props) {
    return (
        <div class="leaderboard-menu-month-wrapper" onClick={() => {props.setBoardCallback(props.year, props.month)}}>
            {props.month}
        </div>
    );
}

export default LeaderboardMenu;