const { getPreproLogs } = require("./helperFunctions");

async function main() {
  try {
    console.log("---------- STARTING PROCESS ----------");

    // const userId = params.userId;
    const userId = process.env.USER_ID;
    const startDate = "2024-12-20";
    const endDate = "2024-12-27";
    console.log("Getting prepro logs", new Date());
    const logs = await getPreproLogs(userId, startDate, endDate);
    console.log(logs);

    console.log("---------- ENDING PROCESS (success) ----------");
    process.exit();
  } catch (error) {
    console.log(error);
    console.log("---------- ENDING PROCESS (error) ----------");
    process.exit();
  }
}

main();
