const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// 🟠 دالة لترتيب المباريات حسب الوقت
function sortByTime(matches) {
  return matches.sort((a, b) => new Date(a.time) - new Date(b.time));
}

// 🟠 إضافة تأخير لتجنب Rate Limiting
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🟠 دالة لجلب مباريات يوم معين لدوري محدد
async function fetchMatchesForDay(leagueName, date) {
  const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&l=${encodeURIComponent(
    leagueName
  )}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`❌ خطأ HTTP ${res.status} من ${url}`);
      return [];
    }
    const data = await res.json();
    if (!data.events) return [];

    return data.events.map((e) => ({
      id: e.idEvent,
      time: `${e.dateEvent} ${e.strTime}`,
      home: {
        name: { ar: e.strHomeTeam, en: e.strHomeTeam },
        logo: e.strHomeTeamBadge || null,
      },
      away: {
        name: { ar: e.strAwayTeam, en: e.strAwayTeam },
        logo: e.strAwayTeamBadge || null,
      },
    }));
  } catch (err) {
    console.error(`⚠️ خطأ في fetchMatchesForDay:`, err.message);
    return [];
  }
}

// 🟠 الدالة الرئيسية
async function fetchMatchesTodayAndNeighbors() {
  const leagues = [
    { name: "Premier League", filename: "premier.json" },
    { name: "La Liga", filename: "laliga.json" },
    { name: "Bundesliga", filename: "bundesliga.json" },
    { name: "Serie A", filename: "seriea.json" },
    { name: "Ligue 1", filename: "ligue1.json" },
    { name: "UEFA Champions League", filename: "ucl.json" },
  ];

  // 🗓️ حساب التواريخ: أمس، اليوم، غداً
  const today = new Date();
  const formatDate = (d) => d.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dates = {
    yesterday: formatDate(yesterday),
    today: formatDate(today),
    tomorrow: formatDate(tomorrow),
  };

  const dir = path.join(__dirname, "..", "assets", "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const league of leagues) {
    console.log(`\n📋 معالجة ${league.name}...`);

    const leagueMatches = { yesterday: [], today: [], tomorrow: [] };

    for (const [key, date] of Object.entries(dates)) {
      console.log(`📡 جلب مباريات ${league.name} ليوم ${date}...`);
      const matches = await fetchMatchesForDay(league.name, date);
      leagueMatches[key] = sortByTime(matches);
      await delay(500); // تهدئة
    }

    // حفظ الملف الخاص بالدوري
    const leagueFile = path.join(dir, league.filename);
    fs.writeFileSync(JSON.stringify(leagueMatches, null, 2), "utf-8");
    fs.writeFileSync(
      leagueFile,
      JSON.stringify(leagueMatches, null, 2),
      "utf-8"
    );
    console.log(`✅ تم حفظ ${league.name} في ${leagueFile}`);
  }
}

// تشغيل
fetchMatchesTodayAndNeighbors().catch((err) =>
  console.error("💥 خطأ غير متوقع:", err)
);

module.exports = fetchMatchesTodayAndNeighbors;
