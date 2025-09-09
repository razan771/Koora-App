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
      { id: 4480, file: "champions-league.json", name: "دوري أبطال أوروبا" },
      { id: 4331, file: "bundesliga.json", name: "الدوري الألماني" },
      { id: 4328, file: "premier-league.json", name: "الدوري الإنجليزي" },
      { id: 4335, file: "laliga.json", name: "الدوري الإسباني" },
    ];

    // 📁 إنشاء مجلد assets/data لو غير موجود
    const dir = path.join(__dirname, "assets", "data");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let allMatches = [];

    for (const league of leagues) {
      const url = `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${league.id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`❌ خطأ في الجلب من ${url}`);
      const data = await res.json();

      if (!data.events) continue;

      // 🔹 تنسيق البيانات
      let formatted = data.events.map((e) => ({
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

      // 🔹 إزالة التكرارات داخل الدوري نفسه
      formatted = removeDuplicates(formatted);

      // 📝 حفظ بيانات الدوري في ملف مستقل
      const filePath = path.join(dir, league.file);
      fs.writeFileSync(filePath, JSON.stringify(formatted, null, 2), "utf-8");

      console.log(`✅ تم حفظ ${formatted.length} مباراة في ${filePath}`);

      // إضافة لمجموعة المباريات الشاملة
      allMatches = allMatches.concat(formatted);
    }

    // 🔹 إزالة التكرارات من جميع المباريات المجمعة
    allMatches = removeDuplicates(allMatches);

    // 📝 حفظ ملف شامل لكل المباريات
    const allFilePath = path.join(dir, "upcoming-matches.json");
    fs.writeFileSync(allFilePath, JSON.stringify(allMatches, null, 2), "utf-8");

    console.log(`📦 تم حفظ ملف شامل (${allMatches.length} مباراة) في ${allFilePath}`);

    return allMatches;
  } catch (err) {
    console.error("⚠️ خطأ في fetchUpcomingMatches:", err.message || err);
    return [];
  }
}

module.exports = fetchUpcomingMatches;

// ✨ للتشغيل المباشر من Node
if (require.main === module) {
  fetchUpcomingMatches();
}
