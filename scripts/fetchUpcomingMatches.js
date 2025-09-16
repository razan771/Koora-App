const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

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

// 🟠 إضافة تأخير للتأكد من اكتمال العمليات
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🟠 دالة لجلب مباريات دوري معين وإرجاع البيانات مباشرة
async function fetchLeagueMatches(id, league, filename) {
  const dir = path.join(__dirname, "..", "assets", "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let allEvents = [];
  const urls = [
    `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${id}`,
    `https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${id}`,
    `https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=${id}&s=2024-2025`,
  ];

  console.log(`🔄 بدء جلب بيانات ${league.en}...`);

  for (const url of urls) {
    try {
      console.log(`📡 جلب من: ${url}`);
      const res = await fetch(url);

      if (!res.ok) {
        console.warn(`❌ خطأ HTTP ${res.status} من ${url}`);
        continue;
      }

      const data = await res.json();
      console.log(
        `📊 البيانات المستلمة:`,
        data.events ? data.events.length : 0,
        `مباراة`
      );

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

      // تأخير بين الطلبات لتجنب Rate Limiting
      await delay(500);
    } catch (err) {
      console.error(`⚠️ خطأ في fetch من ${url}:`, err.message || err);
    }
  }

  // حفظ الملف الخاص بالدوري
  if (allEvents.length > 0) {
    try {
      const leagueFile = path.join(dir, filename);
      fs.writeFileSync(leagueFile, JSON.stringify(allEvents, null, 2), "utf-8");
      console.log(
        `✅ ${league.en}: تم حفظ ${allEvents.length} مباراة في ${filename}`
      );

      // تأخير للتأكد من اكتمال الكتابة
      await delay(100);
    } catch (writeErr) {
      console.error(`❌ خطأ في كتابة ملف ${filename}:`, writeErr.message);
    }
  } else {
    console.log(`⚠️ لا يوجد بيانات لدوري ${league.en}`);
  }

  return allEvents; // إرجاع البيانات مباشرة بدلاً من قراءتها من الملف
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
        id: 4332, // تغيير معرف دوري الأبطال
        league: { ar: "الدوري الفرنسي", en: "Ligue 1" },
        filename: "ligue1.json",
      },
      {
        id: 4334,
        league: { ar: "الدوري الإيطالي", en: "Serie A" },
        filename: "seriea.json",
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

    console.log(`🚀 بدء جلب ${leagues.length} دوري...`);

    // جلب كل دوري على حدة مع معالجة أفضل للأخطاء
    for (let i = 0; i < leagues.length; i++) {
      const { id, league, filename } = leagues[i];
      console.log(`\n📋 ${i + 1}/${leagues.length} - معالجة ${league.en}...`);

      try {
        // جلب البيانات مباشرة بدلاً من قراءة الملف
        const leagueMatches = await fetchLeagueMatches(id, league, filename);

        if (leagueMatches && leagueMatches.length > 0) {
          allMatches = allMatches.concat(leagueMatches);
          console.log(
            `✅ تم إضافة ${leagueMatches.length} مباراة من ${league.en}`
          );
        } else {
          console.log(`⚠️ لم يتم العثور على مباريات لـ ${league.en}`);
        }

        // تأخير بين الدوريات
        if (i < leagues.length - 1) {
          await delay(1000);
        }
      } catch (leagueError) {
        console.error(`❌ خطأ في معالجة ${league.en}:`, leagueError.message);
        continue; // تجاهل هذا الدوري والانتقال للتالي
      }
    }

    console.log(`\n📊 إجمالي المباريات المجمعة: ${allMatches.length}`);

    if (allMatches.length === 0) {
      console.error("❌ لم يتم جلب أي مباريات!");
      return;
    }

    // تنظيف التكرارات + ترتيب حسب الوقت
    const originalCount = allMatches.length;
    allMatches = sortByTime(removeDuplicates(allMatches));

    if (originalCount !== allMatches.length) {
      console.log(
        `🧹 تم حذف ${originalCount - allMatches.length} مباراة مكررة`
      );
    }

    // كتابة الملف الشامل
    try {
      const upcomingFile = path.join(dir, "upcoming-matches.json");
      fs.writeFileSync(
        upcomingFile,
        JSON.stringify(allMatches, null, 2),
        "utf-8"
      );

      console.log(`\n📦 تم إنشاء الملف الشامل upcoming-matches.json بنجاح!`);
      console.log(`📈 العدد النهائي: ${allMatches.length} مباراة`);

      // طباعة إحصائيات الدوريات
      const leagueStats = {};
      allMatches.forEach((match) => {
        const leagueName = match.league.en;
        leagueStats[leagueName] = (leagueStats[leagueName] || 0) + 1;
      });

      console.log(`\n📊 توزيع المباريات حسب الدوري:`);
      Object.entries(leagueStats).forEach(([league, count]) => {
        console.log(`   • ${league}: ${count} مباراة`);
      });
    } catch (writeError) {
      console.error("❌ خطأ في كتابة الملف الشامل:", writeError.message);
    }
  } catch (err) {
    console.error("⚠️ خطأ عام في fetchUpcomingMatches:", err.message || err);
  }
}

// تشغيل الدالة مع معالجة الأخطاء العامة
fetchUpcomingMatches().catch((err) => {
  console.error("💥 خطأ غير متوقع:", err);
});

module.exports = fetchUpcomingMatches;
