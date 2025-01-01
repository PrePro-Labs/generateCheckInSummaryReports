const {
  getSleepLogs,
  calculateAverages,
  getPastCheckIns,
} = require("./helperFunctions");

async function main() {
  try {
    console.log("---------- STARTING PROCESS ----------");

    const userId = process.env.USER_ID;
    const startDate = "2024-12-20";
    const endDate = "2024-12-27";

    // Getting prepro logs
    console.log("Getting prepro logs", new Date());
    const logs = await getSleepLogs(userId, startDate, endDate);
    console.log(`Got logs for ${logs.length} days`, new Date());

    // Calculating averages since last checkin
    console.log("Calculating averages", new Date());
    const averages = calculateAverages(logs);
    if (!Object.keys(averages).length === 0) {
      throw new Error("No logs within specified range");
    }
    console.log("Averages calculated", new Date());

    // Retrieving last 4 checkin results
    console.log("Retrieving historical checkin data", new Date());
    const historical = await getPastCheckIns(userId, endDate);
    console.log(
      `Retrieved historical data for ${historical.length} checkins`,
      new Date()
    );

    // Generating summary of data
    const reports = [{ ...averages, date: endDate }, ...historical];
    console.log("Generating AI summary of sleep", new Date());

    console.log("---------- ENDING PROCESS (success) ----------");
    process.exit();
  } catch (error) {
    console.log(error);
    console.log("---------- ENDING PROCESS (error) ----------");
    process.exit();
  }
}

main();
