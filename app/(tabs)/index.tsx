import ParallaxScrollView, { ParallaxScrollViewRef } from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { teamsAR } from '../../assets/data/teams-ar';

// ✅ إعداد الإشعارات (عرضها فور وصولها حتى لو التطبيق مفتوح)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true, // ✔ جديد
    shouldShowList: true,   // ✔ جديد
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type MatchType = {
  id: number;
  league: { ar: string; en: string };
  time?: string | null; // ⏰ يجب أن يكون ISO مثل "2025-09-20T18:30:00Z"
  home: { name: { ar: string; en: string }; logo?: string | null };
  away: { name: { ar: string; en: string }; logo?: string | null };
};

// ——— دالة حساب حالة المباراة
const getMatchStatus = (time?: string | null) => {
  if (!time) return { text: '', ended: false };

  const matchDate = new Date(time).getTime();
  const now = new Date().getTime();
  const diff = matchDate - now;

  // ⏰ تنسيق التاريخ + الوقت 12 ساعة AM/PM
  const formattedTime = new Date(time).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    day: '2-digit',
    month: 'short',
  });

  if (diff <= 0) {
    return { text: formattedTime, ended: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { text: `${hours}h ${minutes}m ${seconds}s`, ended: false };
};

// ——— دالة تسجيل الإشعارات
async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('⚠️ لم يتم منح إذن الإشعارات');
    return false;
  }

  return true;
}


const date = new Date();
date.setSeconds(date.getSeconds() + 60); // Set the notification to trigger 60 seconds from now

// ——— دالة جدولة التذكير قبل المباراة
const scheduleReminder = async (match: MatchType) => {
  if (!match.time) return;

  const granted = await registerForPushNotificationsAsync();
  if (!granted) return;

  const matchDate = new Date(match.time).getTime();
  const reminderDate = new Date(matchDate - 5 * 60 * 1000); // قبل 5 دقائق

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ تذكير المباراة',
      body: `${match.home.name.en} vs ${match.away.name.en} يبدأ بعد قليل!`,
      sound: true,
    },
    trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    },
  });

  alert('✅ تم ضبط التذكير قبل المباراة بـ 5 دقائق');
};


export default function Index() {
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  const [menuVisible, setMenuVisible] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  const scrollViewRef = useRef<ParallaxScrollViewRef>(null);
  const leaguesRef = useRef<View>(null);
  const newsRef = useRef<View>(null);

  const [leaguesPosition, setLeaguesPosition] = useState(0);
  const [newsPosition, setNewsPosition] = useState(0);

  const fetchUpcoming = () => {
    const url = `https://razan771.github.io/Koora-App/upcoming-matches.json`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`❌ فشل تحميل البيانات من ${url}`);
        return res.json();
      })
      .then((data) => setMatches(data))
      .catch((err) => {
        console.error("خطأ في جلب المباريات:", err.message || err);
        setMatches([]);
      });
  };

  useEffect(() => {
    fetchUpcoming();

    // تحديث العد التنازلي كل ثانية
    const interval = setInterval(() => {
      setMatches((prev) => [...prev]); // 🔄 يعيد التصيير
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  const onMenuPress = () => setMenuVisible(true);
  const onCloseMenu = () => {
    setMenuVisible(false);
    setShowSubMenu(false);
  };
  const toggleSubMenu = () => setShowSubMenu(!showSubMenu);

  const handleFirstOption = () => {
    if (showSubMenu) onSelectSection('leagues');
    else toggleSubMenu();
  };

  const handleLeaguesLayout = (event: any) => setLeaguesPosition(event.nativeEvent.layout.y);
  const handleNewsLayout = (event: any) => setNewsPosition(event.nativeEvent.layout.y);

  const scrollToSection = (section: 'leagues' | 'news') => {
    if (!scrollViewRef.current) return;
    let targetY = section === 'leagues' ? leaguesPosition - 50 : newsPosition - 50;
    scrollViewRef.current.scrollToPosition(Math.max(0, targetY));
  };

  const onSelectSection = (sec: 'leagues' | 'news') => {
    onCloseMenu();
    setTimeout(() => scrollToSection(sec), 300);
  };

  const onSelectLeague = async (leagueKey: string) => {
  const leagueFiles: Record<string, string> = {
    'الدوري الإنجليزي': 'premier.json',
    'الدوري الألماني': 'bundesliga.json',
    'الدوري الإسباني': 'laliga.json',
    'الدوري الفرنسي': 'ligue1.json',
    'الدوري الإيطالي': 'seriea.json',
    'دوري أبطال أوروبا': 'ucl.json',
  };

  console.log('تم اختيار الدوري:', leagueKey);
  onSelectSection('leagues');

  const fileName = leagueFiles[leagueKey];
  if (!fileName) return;

  try {
    const url = `https://razan771.github.io/Koora-App/${fileName}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`❌ فشل تحميل بيانات الدوري من ${url}`);
    const data: MatchType[] = await res.json();
    setMatches(data);
    onSelectSection('leagues');
  } catch (err) {
    console.error('خطأ في جلب الدوري:', err);
    setMatches([]);
  }
};


  return (
    <>
      <ParallaxScrollView
        ref={scrollViewRef}
        headerImage={
          <Image source={require('@/assets/images/headerImage.jpg')} style={styles.reactLogo} />
        }
        onMenuPress={onMenuPress}
        onLangChange={toggleLanguage}
      >
        <ThemedView ref={leaguesRef} style={styles.titleContainer} onLayout={handleLeaguesLayout}>
          <ThemedText type="title">
            {language === 'ar' ? 'المباريات القادمة' : 'Upcoming Matches'}
          </ThemedText>
        </ThemedView>

        {matches.map((match) => {
  const status = getMatchStatus(match.time);

  return (
    <ThemedView key={match.id} style={styles.matchCard}>
      {/* اسم الدوري */}
      <ThemedText style={styles.league}>{match.league[language]}</ThemedText>

      {/* صف الفرق */}
      <View style={styles.matchRow}>
        {/* الفريق المستضيف */}
        <View style={styles.teamContainer}>
          {match.home.logo && (
            <Image source={{ uri: match.home.logo }} style={styles.logo} contentFit="contain" />
          )}
          <ThemedText style={styles.teamName}>
            {language === 'ar'
              ? teamsAR[match.home.name.en] || match.home.name.en
              : match.home.name.en}
          </ThemedText>
        </View>

        {/* بطاقات التاريخ والوقت */}
        <View style={styles.timeColumn}>
          {/* بطاقة التاريخ */}
          <View style={styles.dateCard}>
            <ThemedText style={styles.dateText}>
              {match.time
                ? new Date(match.time).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : ''}
            </ThemedText>
          </View>

          {/* بطاقة الوقت */}
          {/* الوقت أو العد التنازلي */}
          {status.ended ? (
            <ThemedText style={styles.matchEnded}>
              🏁 {language === 'ar' ? 'انتهت المباراة' : 'Match Ended'}
            </ThemedText>
          ) : (
            <View style={styles.timeCard}>
              <ThemedText style={styles.timeText}>
                {status.text}
              </ThemedText>
            </View>
          )}
        </View>

        {/* الفريق الضيف */}
        <View style={styles.teamContainer}>
          {match.away.logo && (
            <Image source={{ uri: match.away.logo }} style={styles.logo} contentFit="contain" />
          )}
          <ThemedText style={styles.teamName}>
            {language === 'ar'
              ? teamsAR[match.away.name.en] || match.away.name.en
              : match.away.name.en}
          </ThemedText>
        </View>
      </View>

      {/* الزر أسفل البطاقة */}
      <TouchableOpacity
        style={[styles.actionButton, status.ended ? styles.watchNow : styles.remindMe]}
        onPress={() =>
          status.ended
            ? console.log('مشاهدة الآن:', match.id)
            : scheduleReminder(match)
        }
      >
        <ThemedText style={styles.actionButtonText}>
          {status.ended
            ? language === 'ar' ? '🎥 مشاهدة الآن' : '🎥 Watch Now'
            : language === 'ar' ? '⏰ ذكرني' : '⏰ Remind Me'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
})}


        <ThemedView ref={newsRef} style={styles.titleContainer} onLayout={handleNewsLayout}>
          <ThemedText type="title">
            {language === 'ar' ? 'أهم الأخبار' : 'Top News'}
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>

      {/* القائمة الجانبية */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.backdrop} onPress={onCloseMenu} />
        <ThemedView style={[styles.menuContainer, showSubMenu && styles.expandedMenu]}>
          <TouchableOpacity onPress={handleFirstOption} style={styles.menuItemContainer}>
            <ThemedText style={styles.menuItem}>
              {language === 'ar' ? 'الدوريات' : 'Leagues'}
            </ThemedText>
            <ThemedText style={[styles.arrow, showSubMenu && styles.arrowRotated]}>
              {showSubMenu ? '▲' : '▼'}
            </ThemedText>
          </TouchableOpacity>

          {showSubMenu && (
            <ThemedView style={styles.subMenuContainer}>
              <TouchableOpacity style={styles.subMenuItemContainer} onPress={() => onSelectLeague('الدوري الإنجليزي')}>
                <ThemedText style={styles.flag}>🏴</ThemedText>
                <ThemedText style={styles.subMenuItem}>
                  {language === 'ar' ? 'الدوري الإنجليزي' : 'Premier League'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.subMenuItemContainer} onPress={() => onSelectLeague('الدوري الألماني')}>
                <ThemedText style={styles.flag}>🇩🇪</ThemedText>
                <ThemedText style={styles.subMenuItem}>
                  {language === 'ar' ? 'الدوري الألماني' : 'Bundesliga'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.subMenuItemContainer} onPress={() => onSelectLeague('دوري أبطال أوروبا')}>
                <ThemedText style={styles.flag}>⭐</ThemedText>
                <ThemedText style={styles.subMenuItem}>
                  {language === 'ar' ? 'دوري أبطال أوروبا' : 'UEFA Champions League'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.subMenuItemContainer} onPress={() => onSelectLeague('الدوري الفرنسي')}>
                <ThemedText style={styles.flag}>🇫🇷</ThemedText>
                <ThemedText style={styles.subMenuItem}>
                  {language === 'ar' ? 'الدوري الفرنسي' : 'Ligue 1'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.subMenuItemContainer} onPress={() => onSelectLeague('الدوري الإيطالي')}>
                <ThemedText style={styles.flag}>🇮🇹</ThemedText>
                <ThemedText style={styles.subMenuItem}>
                  {language === 'ar' ? 'الدوري الإيطالي' : 'Serie A'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          <TouchableOpacity onPress={() => onSelectSection('news')}>
            <ThemedText style={styles.menuItem}>
              {language === 'ar' ? 'أخبار كرة القدم' : 'Football News'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: { flex: 1, alignItems: 'center', gap: 30 },
  reactLogo: { resizeMode: 'cover', height: 178, width: '100%', bottom: 0, left: 0, position: 'absolute' },
  matchCard: {
    width: '100%',
    minHeight: 160,
    padding: 16,
    marginBottom: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ff5733ff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  league: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  matchRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 12 },
  teamContainer: { alignItems: 'center', justifyContent: 'center', width: 100 },
  logo: { width: 55, height: 55, marginBottom: 6 },
  teamName: { fontSize: 14, textAlign: 'center', fontWeight: '500' },
  timeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  time: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    textAlign: 'center',
  },
  timeColumn: {
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 6,
},

matchEnded: {
  marginTop: 6,
  fontSize: 14,
  fontWeight: '700',
  color: '#d32f2f',
  textAlign: 'center',
  backgroundColor: '#ffe0e0',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 6,
  overflow: 'hidden',
  direction: 'rtl',
  writingDirection: 'rtl',
},

dateCard: {
  backgroundColor: '#e0e0e0',
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 8,
},

timeCard: {
  backgroundColor: '#1976d2',
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 8,
},

dateText: {
  fontSize: 12,
  fontWeight: '500',
  color: '#000',
  textAlign: 'center',
},

timeText: {
  fontSize: 12,
  fontWeight: '500',
  color: '#fff',
  textAlign: 'center',
},
  actionButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  watchNow: {
    backgroundColor: '#ff5733', // 🔥 أحمر/برتقالي لمشاهدة
  },
  remindMe: {
    backgroundColor: '#1976d2', // 🔵 أزرق للتذكير
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  menuContainer: {
    flexDirection: 'column',
    position: 'absolute',
    top: 80,
    left: 20,
    right: 80,
    borderRadius: 8,
    borderColor: 'black',
    borderWidth: 1,
    padding: 16,
    alignContent: 'center',
    alignItems: 'flex-start',
    maxHeight: 300,
    backgroundColor: '#fff',
    direction: 'rtl',
    writingDirection: 'rtl',
  },
  expandedMenu: { maxHeight: 500 },
  menuItemContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
  },
  menuItem: { fontSize: 18, paddingVertical: 12, flex: 1, color: '#000' },
  arrow: { fontSize: 16, marginRight: 10, color: '#000' },
  arrowRotated: { transform: [{ rotate: '180deg' }] },
  subMenuContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5ff',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    marginBottom: 16,
    direction: 'rtl',
    writingDirection: 'rtl',
  },
  subMenuItemContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  subMenuItem: {
    fontSize: 16,
    color: '#000',
    textAlign: 'right',
    flex: 1,
  },
  flag: {
    fontSize: 18,
    marginLeft: 50,
  },
});
