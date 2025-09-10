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

    for (const { id, league } of urls) {
      const url = `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${id}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`❌ خطأ في الجلب من ${url}`);
      const data = await res.json();

      if (!data.events) continue;

      // 🔹 تنسيق البيانات
      const formatted = data.events.map((e) => ({
        id: e.idEvent,
        league, // يحتوي على { ar, en }
        time: e.dateEvent + " " + e.strTime,
        home: {
          name: { ar: e.strHomeTeam, en: e.strHomeTeam }, // هنا ممكن نطور لاحقاً لإضافة أسماء مترجمة
          logo: e.strHomeTeamBadge || null,
        },
        away: {
          name: { ar: e.strAwayTeam, en: e.strAwayTeam },
          logo: e.strAwayTeamBadge || null,
        },
      }));

      allMatches = allMatches.concat(formatted);
    }

    // 🔹 تنظيف التكرارات
    allMatches = removeDuplicates(allMatches);

    // 📁 إنشاء مجلد assets/data في جذر المشروع
    const dir = path.join(__dirname, "..", "assets", "data");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 📝 كتابة النتائج في ملف JSON
    const filePath = path.join(dir, "upcoming-matches.json");
    fs.writeFileSync(filePath, JSON.stringify(allMatches, null, 2), "utf-8");

    console.log(`✅ تم حفظ ${allMatches.length} مباراة في ${filePath}`);
  } catch (err) {
    console.error("⚠️ خطأ في fetchUpcomingMatches:", err.message || err);
  }
}

fetchUpcomingMatches();

module.exports = fetchUpcomingMatches;
