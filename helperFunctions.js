const { mysqlPool } = require("./config/database");

async function getSleepLogs(userId, startDate, endDate) {
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

function calculateAverages(logs) {
  const totals = logs.reduce(
    (acc, log) => {
      acc.count += 1;
      acc.totalSleep += parseFloat(log.totalSleep);
      acc.totalBed += parseFloat(log.totalBed);
      acc.recoveryIndex += log.recoveryIndex;
      acc.remQty += parseFloat(log.remQty);
      acc.deepQty += parseFloat(log.deepQty);
      return acc;
    },
    {
      count: 0,
      totalSleep: 0,
      totalBed: 0,
      recoveryIndex: 0,
      remQty: 0,
      deepQty: 0,
    }
  );

  if (totals.count === 0) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(totals)
      .filter(([key]) => key !== "count")
      .map(([key, value]) => [
        `avg${key.charAt(0).toUpperCase()}${key.slice(1)}`,
        (value / totals.count).toFixed(2),
      ])
  );
}

async function getPastCheckIns(userId, date) {
  const pool = await mysqlPool;
  const [result] = await pool.query(
    `
      select 
        avgTotalSleep,
        avgTotalBed,
        avgRecoveryIndex,
        avgRemQty,
        avgDeepQty
      from checkIns
      where userId = ?
      and date < ?
      order by date desc
      limit 4
      `,
    [userId, date]
  );

  return result;
}

function generateSummaries(averages) {}

function uploadToPrepro() {}

module.exports = { getSleepLogs, calculateAverages, getPastCheckIns };
