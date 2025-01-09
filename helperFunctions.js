import { mysqlPool } from "./config.js";
import openai from "openai";

const helperFunctions = {
  getSleepLogs: async function (userId, endDate) {
    const pool = await mysqlPool;
    const [result] = await pool.query(
      `
    select * from sleepLogs
    where userId = ?
    and date > (select max(date) from checkIns where userId = ? and date < ?)
    and date <= ?
    `,
      [userId, userId, endDate, endDate]
    );

    return result;
  },

  calculateAverages: function (logs) {
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
  },

  getPastCheckIns: async function (userId, date) {
    const pool = await mysqlPool;
    const [result] = await pool.query(
      `
        select 
          avgTotalSleep,
          avgTotalBed,
          avgRecoveryIndex,
          avgRemQty,
          avgDeepQty,
          date
        from checkIns
        where userId = ?
        and date < ?
        order by date desc
        limit 4
        `,
      [userId, date]
    );

    return result;
  },

  generateSummary: async function (reports) {
    try {
      const client = new openai.OpenAI();
      const result = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "I have a weekly check-in and I want to summarize my sleep habits for my bodybuilding coach. Analyze the lastest weekly entry with relation to the previous weeks in 50 words or less without using full sentences. Don't give any advice--just comment on trends.",
          },
          {
            role: "user",
            content: JSON.stringify(reports),
          },
        ],
        model: "gpt-4o-mini",
      });

      const summary = result.choices[0].message.content;

      return summary;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  uploadToPrepro: async function (endDate, averages, userId, summary) {
    const {
      avgTotalSleep,
      avgTotalBed,
      avgRecoveryIndex,
      avgRemQty,
      avgDeepQty,
    } = averages;
    const pool = await mysqlPool;
    const [result] = await pool.query(
      `
        update checkIns set 
          avgTotalSleep = ?,
          avgTotalBed = ?,
          avgRecoveryIndex = ?,
          avgRemQty = ?,
          avgDeepQty = ?,
          recoveryAnalysis = ?
        where date = ?
        and userId = ?
        `,
      [
        avgTotalSleep,
        avgTotalBed,
        avgRecoveryIndex,
        avgRemQty,
        avgDeepQty,
        summary,
        endDate,
        userId,
      ]
    );

    return result;
  },
};

export default helperFunctions;
