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
    const leagues = [
      {
        id: 4480,
        league: { ar: "دوري أبطال أوروبا", en: "UEFA Champions League" },
      },
      {
        id: 4331,
        league: { ar: "الدوري الألماني", en: "Bundesliga" },
      },
      {
        id: 4328,
        league: { ar: "الدوري الإنجليزي الممتاز", en: "Premier League" },
      },
      {
        id: 4335,
        league: { ar: "الدوري الإسباني", en: "La Liga" },
      },
    ];

    let allMatches = [];

    // 📁 مجلد الحفظ
    const dir = path.join(__dirname, "..", "assets", "data");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    for (const { id, league } of leagues) {
      const url = `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${id}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`❌ خطأ في الجلب من ${url}`);
      const data = await res.json();

      if (!data.events) continue;

      // 🔹 تنسيق بيانات الدوري الحالي
      const matches = data.events.map((e) => ({
        id: e.idEvent,
        league,
        time: e.dateEvent + " " + e.strTime,
        home: {
          name: { ar: e.strHomeTeam, en: e.strHomeTeam },
          logo: e.strHomeTeamBadge || null,
        },
        away: {
          name: { ar: e.strAwayTeam, en: e.strAwayTeam },
          logo: e.strAwayTeamBadge || null,
        },
      }));

      // 🔹 تنظيف التكرارات
      const uniqueMatches = removeDuplicates(matches);

      // 📝 حفظ ملف خاص بالدوري
      const leagueFile = path.join(dir, `league-${id}.json`);
      fs.writeFileSync(
        leagueFile,
        JSON.stringify(uniqueMatches, null, 2),
        "utf-8"
      );
      console.log(
        `✅ ${league.en}: حفظ ${uniqueMatches.length} مباراة في ${leagueFile}`
      );

      allMatches = allMatches.concat(uniqueMatches);
    }

    // 🔹 حفظ جميع المباريات في ملف شامل
    allMatches = removeDuplicates(allMatches);
    const allFile = path.join(dir, "upcoming-matches.json");
    fs.writeFileSync(allFile, JSON.stringify(allMatches, null, 2), "utf-8");
    console.log(
      `📦 تم حفظ ${allMatches.length} مباراة في الملف الشامل upcoming-matches.json`
    );
  } catch (err) {
    console.error("⚠️ خطأ في fetchUpcomingMatches:", err.message || err);
  }
}

fetchUpcomingMatches();
