const { mysqlPool } = require("./config/database");

async function getPreproLogs(userId, startDate, endDate) {
  const pool = await mysqlPool;
  const [result] = await pool.query(
    `
    select * from sleepLogs
    where userId = ?
    and date > ?
    and date <= ?
    `,
    [userId, startDate, endDate]
  );

  return result;
}

function calculateAverages() {}

function generateSummaries() {}

function uploadToPrepro() {}

module.exports = { getPreproLogs };
