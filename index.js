const jsonfile = require("jsonfile");
const moment = require("moment");
const simpleGit = require("simple-git");
const random = require("random");
const FILE_PATH = "./data.json";

// Generate all weekdays in 2026 for natural distribution
const startDate = moment('2026-01-01');
const endDate = moment('2027-01-01');
let weekdays = [];
let currentDate = startDate.clone();
while (currentDate.isBefore(endDate)) {
  if (currentDate.day() !== 0 && currentDate.day() !== 6) {
    weekdays.push(currentDate.format('YYYY-MM-DD'));
  }
  currentDate.add(1, 'day');
}
console.log(`Generated ${weekdays.length} weekdays in 2026.`);

// Select 148 random unique weekdays (avg 2 commits/day → 296 added for total 467)
const NUM_DAYS = 148;
let tempWeekdays = [...weekdays];
const TARGET_DATES = [];
while (TARGET_DATES.length < NUM_DAYS) {
  const idx = random.int(0, tempWeekdays.length - 1);
  TARGET_DATES.push(tempWeekdays[idx]);
  tempWeekdays.splice(idx, 1);
}

// Sort chronologically to process in order
TARGET_DATES.sort((a, b) => moment(a).valueOf() - moment(b).valueOf());
console.log(`Selected ${TARGET_DATES.length} random weekdays for commits (expected ~296 added).`);

const commitForDate = (dateIndex) => {
  if (dateIndex >= TARGET_DATES.length) {
    console.log("All dates processed. Pushing to remote...");
    return simpleGit().push();
  }

  const dateString = TARGET_DATES[dateIndex];
  const DATE = moment(`${dateString}T12:00:00`).format();
  
  // Variation: 1 to 3 commits per day for realistic 2026 density
  const numCommits = random.int(1, 3);
  
  console.log(`Processing ${dateString}: creating ${numCommits} commits...`);

  let commitsLeft = numCommits;

  const makeSingleCommit = () => {
    if (commitsLeft === 0) {
      return commitForDate(dateIndex + 1);
    }

    const data = {
      date: DATE,
      entropy: random.int(0, 1000000)
    };

    jsonfile.writeFile(FILE_PATH, data, () => {
      simpleGit()
        .add([FILE_PATH])
        .commit(DATE, { "--date": DATE }, () => {
          commitsLeft--;
          makeSingleCommit();
        });
    });
  };

  makeSingleCommit();
};

console.log(`Starting generation for ${TARGET_DATES.length} days in 2026 (target add 296 commits → 467 total for year)...`);
commitForDate(0);