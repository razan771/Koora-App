const fs = require("fs");
const path = require("path");

// 🟠 دالة لإزالة التكرارات بناءً على id
function removeDuplicates(matches) {
  const seen = new Set();
  return matches.filter((match) => {
    if (seen.has(match.id)) return false;
    seen.add(match.id);
    return true;
  });
}

// 🟠 دالة لترتيب المباريات حسب الوقت
function sortByTime(matches) {
  return matches.sort((a, b) => {
    const dateA = new Date(a.time);
    const dateB = new Date(b.time);
    return dateA - dateB;
  });
}

// 🟠 دالة لجلب مباريات دوري معين (قادمة أو سابقة)
async function fetchLeagueMatches(id, league) {
  const dir = path.join(__dirname, "..", "assets", "data");
  const urls = [
    `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${id}`, // القادمة
    `https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${id}`, // السابقة
  ];

  for (const url of urls) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`❌ خطأ في الجلب من ${url}`);
    const data = await res.json();

    if (data.events && data.events.length > 0) {
      // 🔹 تنسيق البيانات
      const formatted = data.events.map((e) => ({
        id: e.idEvent,
        league,
        leagueId: id,
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

      // 📝 حفظ الملف الخاص بالدوري
      const leagueFile = path.join(dir, `${id}.json`);
      fs.writeFileSync(leagueFile, JSON.stringify(formatted, null, 2), "utf-8");
      console.log(`✅ ${league.en}: تم حفظ ${formatted.length} مباراة`);

      return formatted;
    }
  }

  console.log(`⚠️ لا يوجد بيانات لدوري ${league.en}`);
  return [];
}

async function fetchUpcomingMatches() {
  try {
    const urls = [
      {
        id: 4480,
        league: { ar: "دوري أبطال أوروبا", en: "UEFA Champions League" },
      },
      { id: 4331, league: { ar: "الدوري الألماني", en: "Bundesliga" } },
      {
        id: 4328,
        league: { ar: "الدوري الإنجليزي الممتاز", en: "Premier League" },
      },
      { id: 4335, league: { ar: "الدوري الإسباني", en: "La Liga" } },
    ];

    let allMatches = [];

    // 📁 إنشاء مجلد assets/data
    const dir = path.join(__dirname, "..", "assets", "data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const { id, league } of urls) {
      const leagueMatches = await fetchLeagueMatches(id, league);
      allMatches = allMatches.concat(leagueMatches);
    }

    // 🔹 تنظيف التكرارات + ترتيب حسب الوقت
    allMatches = sortByTime(removeDuplicates(allMatches));

    // 📝 كتابة الملف الشامل
    const filePath = path.join(dir, "upcoming-matches.json");
    fs.writeFileSync(filePath, JSON.stringify(allMatches, null, 2), "utf-8");

    console.log(`📦 الملف الشامل: ${allMatches.length} مباراة`);
  } catch (err) {
    console.error("⚠️ خطأ في fetchUpcomingMatches:", err.message || err);
  }
}

fetchUpcomingMatches();

module.exports = fetchUpcomingMatches;
