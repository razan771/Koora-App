const axios = require('axios');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

const API_TOKEN = 's2QZWkF4KrZFiZZXPKrnLPCLzTXHI2GV5GF4gNXT9ZfQUqlmiXGgGK3t5h8Y';
const LEAGUE_IDS = [501, 8, 82];

async function fetchMatchesForDate(dateStr) {
  const leaguesParam = LEAGUE_IDS.join(',');
  const from = moment(dateStr).startOf('day').toISOString();
  const to = moment(dateStr).endOf('day').toISOString();
  const url = `https://api.sportmonks.com/v3/football/fixtures?api_token=${API_TOKEN}&leagues=${leaguesParam}&from=${from}&to=${to}&locale=ar&include=participants;participants.country;league;venue;scores`;


  try {
    const res = await axios.get(url);

    const matches = res.data.data.map(match => {
      const homeTeam = match.participants?.find(p => p.meta.location === 'home');
      const awayTeam = match.participants?.find(p => p.meta.location === 'away');

      return {
        id: match.id,
        league: match.league?.name_ar || match.league?.name || 'دوري غير معروف',
        time: moment.utc(match.starting_at).tz('Asia/Dubai').format('YYYY-MM-DD HH:mm'),
        home: {
          name: homeTeam?.name || 'غير معروف',
          logo: homeTeam?.image_path || null,
          country_name: homeTeam?.country?.name || null,
          country_flag: homeTeam?.country?.image_path || null,
        },
        away: {
          name: awayTeam?.name || 'غير معروف',
          logo: awayTeam?.image_path || null,
          country_name: awayTeam?.country?.name || null,
          country_flag: awayTeam?.country?.image_path || null,
        }
      };
    });

    const outputPath = path.resolve(__dirname, `../assets/data/matches-${dateStr}.json`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2), 'utf-8');
    console.log(`✅ تم حفظ مباريات ${dateStr} في: matches-${dateStr}.json`);
  } catch (err) {
    console.error(`❌ فشل في جلب مباريات ${dateStr}:`, err.response?.data || err.message);
  }
}

async function fetchTodayAndYesterday() {
  const today = moment().format('YYYY-MM-DD');
  const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');

  await fetchMatchesForDate(today);
  await fetchMatchesForDate(yesterday);
}

fetchTodayAndYesterday();
