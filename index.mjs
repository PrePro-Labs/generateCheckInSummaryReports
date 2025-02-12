import helperFunctions from "./helperFunctions.js";

export const handler = async (event) => {
  try {
    console.log("---------- STARTING PROCESS ----------");

    const { lambdaKey, userId, date } = JSON.parse(event.body);

    if (!lambdaKey || !userId || !date) {
      throw new Error(`Invalid request body... ${event.body}`);
    }

    if (lambdaKey !== process.env.LAMBDA_API_KEY) {
      throw new Error(`Invalid API key`);
    }

    // Getting prepro logs
    console.log("-- Getting prepro logs", new Date());
    const logs = await helperFunctions.getSleepLogs(userId, date);
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
    const historical = await helperFunctions.getPastCheckIns(userId, date);
    console.log(
      `-- Retrieved historical data for ${historical.length} checkins`,
      new Date()
    );

    // Generating summary of data
    const reports = [{ ...averages, date: date }, ...historical];
    console.log("-- Generating AI summary of sleep", new Date());
    const sleepSummary = await helperFunctions.generateSleepSummary(reports);
    console.log("-- Generated AI summary of sleep", new Date());

    // gathering training comments
    const lastCheckIn = reports[1] || {};
    const lastDate = lastCheckIn.date;
    console.log(
      `-- Getting prepro training log comments between ${lastDate} and ${date}`,
      new Date()
    );
    const comments = await helperFunctions.getComments(userId, lastDate, date);
    console.log(`-- Got ${comments.length} training log comments`, new Date());

    // generating summary of training
    console.log("-- Generating AI summary of training", new Date());
    const trainingSummary = await helperFunctions.generateTrainingSummary(
      comments
    );
    console.log("-- Generated AI summary of training", new Date());

    console.log("summary", trainingSummary);

    // Updating prepro
    console.log("-- Updating PrePro", new Date());
    await helperFunctions.uploadToPrepro(
      date,
      averages,
      userId,
      sleepSummary,
      trainingSummary
    );
    console.log("-- PrePro updated", new Date());

    const response = {
      statusCode: 200,
      body: JSON.stringify(`-- FINISHED`),
    };
    console.log("---------- EXITING PROCESS (SUCCESS) ----------");
    return response;
  } catch (err) {
    console.log("---------- EXITING PROCESS (ERROR) ----------");
    console.log(err);
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        error: err.message || "An unknown error occurred",
      }),
    };
    return response;
  }
};
