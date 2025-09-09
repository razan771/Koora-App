const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 🟠 دالة لإزالة التكرارات بناءً على id
function removeDuplicates(matches) {
  const seen = new Set();
  return matches.filter((match) => {
    if (seen.has(match.id)) {
      return false;
    }
    seen.add(match.id);
    return true;
  });
}

async function fetchUpcomingMatches() {
  try {
    const urls = [
          "https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4480", //  دوري أبطال
      "https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4331", //  الدوري الألماني
      "https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328", //  الدوري الإنجليزي
      "https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4335", //  الدوري الإسباني
    ];

    let allMatches = [];

    for (const url of urls) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`❌ خطأ في الجلب من ${url}`);
      const data = await res.json();

      if (!data.events) continue;

      // 🔹 تنسيق البيانات
      const formatted = data.events.map((e) => ({
        id: e.idEvent,
        league: e.strLeague,
        time: e.dateEvent + " " + e.strTime,
        home: {
          name: e.strHomeTeam,
          logo: e.strHomeTeamBadge,
          country_name: e.strCountry,
          country_flag: e.strCountryBadge,
        },
        away: {
          name: e.strAwayTeam,
          logo: e.strAwayTeamBadge,
          country_name: e.strCountry,
          country_flag: e.strCountryBadge,
        },
      }));

      allMatches = allMatches.concat(formatted);
    }

    // 🔹 تنظيف التكرارات
    allMatches = removeDuplicates(allMatches);

    return allMatches;
  } catch (err) {
    console.error("⚠️ خطأ في fetchUpcomingMatches:", err.message || err);
    return [];
  }
}

module.exports = fetchUpcomingMatches;
