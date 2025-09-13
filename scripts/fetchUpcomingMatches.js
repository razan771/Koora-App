const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch"); // تأكدي من تثبيت node-fetch إذا لم يكن موجود

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

// 🟠 دالة لجلب مباريات دوري معين وحفظها في ملف مستقل
async function fetchLeagueMatches(id, league, filename) {
  const dir = path.join(__dirname, "..", "assets", "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let allEvents = [];
  const urls = [
    `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${id}`, // القادمة
    `https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${id}`, // السابقة
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`❌ خطأ في الجلب من ${url}`);
        continue;
      }

      const data = await res.json();
      if (data.events && data.events.length > 0) {
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
        allEvents = allEvents.concat(formatted);
      }
    } catch (err) {
      console.error(`⚠️ خطأ في fetch من ${url}:`, err.message || err);
    }
  }

  // حفظ الملف الخاص بالدوري
  if (allEvents.length > 0) {
    const leagueFile = path.join(dir, filename);
    fs.writeFileSync(leagueFile, JSON.stringify(allEvents, null, 2), "utf-8");
    console.log(
      `✅ ${league.en}: تم حفظ ${allEvents.length} مباراة في ${filename}`
    );
  } else {
    console.log(`⚠️ لا يوجد بيانات لدوري ${league.en}`);
  }

  return allEvents;
}

// 🟠 دالة لجلب كل الدوريات ودمجها في ملف شامل
async function fetchUpcomingMatches() {
  try {
    const leagues = [
      {
        id: 4328,
        league: { ar: "الدوري الإنجليزي الممتاز", en: "Premier League" },
        filename: "premier.json",
      },
      {
        id: 4335,
        league: { ar: "الدوري الإسباني", en: "La Liga" },
        filename: "laliga.json",
      },
      {
        id: 4331,
        league: { ar: "الدوري الألماني", en: "Bundesliga" },
        filename: "bundesliga.json",
      },
      {
        id: 4480,
        league: { ar: "دوري أبطال أوروبا", en: "UEFA Champions League" },
        filename: "ucl.json",
      },
    ];

    const dir = path.join(__dirname, "..", "assets", "data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let allMatches = [];

    // جلب كل دوري على حدة
    for (const { id, league, filename } of leagues) {
      await fetchLeagueMatches(id, league, filename);
      // قراءة الملف بعد حفظه لضمان دمج كل المباريات
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        const leagueMatches = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        allMatches = allMatches.concat(leagueMatches);
      }
    }

    // تنظيف التكرارات + ترتيب حسب الوقت
    allMatches = sortByTime(removeDuplicates(allMatches));

    // كتابة الملف الشامل
    const upcomingFile = path.join(dir, "upcoming-matches.json");
    fs.writeFileSync(
      upcomingFile,
      JSON.stringify(allMatches, null, 2),
      "utf-8"
    );

    console.log(
      `📦 الملف الشامل upcoming-matches.json: ${allMatches.length} مباراة`
    );
  } catch (err) {
    console.error("⚠️ خطأ في fetchUpcomingMatches:", err.message || err);
  }
}

fetchUpcomingMatches();

module.exports = fetchUpcomingMatches;
