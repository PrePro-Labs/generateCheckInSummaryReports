import helperFunctions from "./helperFunctions.js";

async function main(startDate) {
  try {
    console.log("---------- STARTING PROCESS ----------");

    const userId = process.env.USER_ID;
    const endDate = "2025-01-03";

    // Getting prepro logs
    console.log("-- Getting prepro logs", new Date());
    const logs = await helperFunctions.getSleepLogs(userId, endDate);
    console.log(`-- Got logs for ${logs.length} days`, new Date());

    // Calculating averages since last checkin
    console.log("-- Calculating averages", new Date());
    const averages = helperFunctions.calculateAverages(logs);
    if (!Object.keys(averages).length === 0) {
      throw new Error("No logs within specified range");
    }
    console.log("-- Averages calculated", new Date());

    // Retrieving last 4 checkin results
    console.log("-- Retrieving historical checkin data", new Date());
    const historical = await helperFunctions.getPastCheckIns(userId, endDate);
    console.log(
      `-- Retrieved historical data for ${historical.length} checkins`,
      new Date()
    );

    // Generating summary of data
    const reports = [{ ...averages, date: endDate }, ...historical];
    console.log("-- Generating AI summary of sleep", new Date());
    const summary = await helperFunctions.generateSummary(reports);
    console.log("-- Generated AI summary of sleep", new Date());

    // Updating prepro
    console.log("-- Updating PrePro", new Date());
    await helperFunctions.uploadToPrepro(endDate, averages, userId, summary);
    console.log("-- PrePro updated", new Date());

    console.log("---------- ENDING PROCESS (success) ----------");
    process.exit();
  } catch (error) {
    console.log(error);
    console.log("---------- ENDING PROCESS (error) ----------");
    process.exit();
  }
}

main();
