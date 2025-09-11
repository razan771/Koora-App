import ParallaxScrollView, { ParallaxScrollViewRef } from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

type MatchType = {
  id: number;
  league: { ar: string; en: string };
  time?: string | null;
  home: {
    name: { ar: string; en: string };
    logo?: string | null;
  };
  away: {
    name: { ar: string; en: string };
    logo?: string | null;
  };
};

export default function Index() {
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar'); // ✅ حالة اللغة الموحدة

  // ——— حالات القائمة
  const [menuVisible, setMenuVisible] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  // ——— مراجع ScrollView
  const scrollViewRef = useRef<ParallaxScrollViewRef>(null);
  const leaguesRef = useRef<View>(null);
  const newsRef = useRef<View>(null);

  const [leaguesPosition, setLeaguesPosition] = useState(0);
  const [newsPosition, setNewsPosition] = useState(0);

  // 🔹 جلب المباريات القادمة
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
  }, []);

  // ——— تبديل اللغة
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // ——— دوال القائمة
  const onMenuPress = () => setMenuVisible(true);
  const onCloseMenu = () => {
    setMenuVisible(false);
    setShowSubMenu(false);
  };
  const toggleSubMenu = () => setShowSubMenu(!showSubMenu);

  const handleFirstOption = () => {
    if (showSubMenu) {
      onSelectSection('leagues');
    } else {
      toggleSubMenu();
    }
  };

  const handleLeaguesLayout = (event: any) => {
    const { y } = event.nativeEvent.layout;
    setLeaguesPosition(y);
  };
  const handleNewsLayout = (event: any) => {
    const { y } = event.nativeEvent.layout;
    setNewsPosition(y);
  };

  const scrollToSection = (section: 'leagues' | 'news') => {
    if (!scrollViewRef.current) return;
    let targetY = 0;
    if (section === 'leagues') targetY = leaguesPosition - 50;
    else if (section === 'news') targetY = newsPosition - 50;
    scrollViewRef.current.scrollToPosition(Math.max(0, targetY));
  };

  const onSelectSection = (sec: 'leagues' | 'news') => {
    onCloseMenu();
    setTimeout(() => {
      scrollToSection(sec);
    }, 300);
  };

  const onSelectLeague = (leagueName: string) => {
    console.log('تم اختيار الدوري:', leagueName);
    onSelectSection('leagues');
  };

  return (
    <>
      <ParallaxScrollView
        ref={scrollViewRef}
        headerImage={
          <Image source={require('@/assets/images/headerImage.jpg')} style={styles.reactLogo} />
        }
        onMenuPress={onMenuPress}
        onLangChange={toggleLanguage} // ✅ ربط زر اللغة
      >
        <ThemedView
          ref={leaguesRef}
          style={styles.titleContainer}
          onLayout={handleLeaguesLayout}
        >
          <ThemedText type="title">
            {language === 'ar' ? 'المباريات القادمة' : 'Upcoming Matches'}
          </ThemedText>
        </ThemedView>

        {matches.length > 0 ? (
          matches.map((match) => (
            <ThemedView key={match.id} style={styles.matchCard}>
              {/* اسم الدوري */}
              <ThemedText style={styles.league}>
                {match.league[language]}
              </ThemedText>

              {/* صف الفرق */}
              <View style={styles.matchRow}>
                {/* الفريق المستضيف */}
                <View style={styles.teamContainer}>
                  {match.home.logo && (
                    <Image
                      source={{ uri: match.home.logo }}
                      style={styles.logo}
                      contentFit="contain"
                    />
                  )}
                  <ThemedText style={styles.teamName}>
                    {match.home.name[language]}
                  </ThemedText>
                </View>

                {/* التاريخ والوقت */}
                <View style={styles.timeContainer}>
                  <ThemedText style={styles.time}>
                    {match.time || ''}
                  </ThemedText>
                </View>

                {/* الفريق الضيف */}
                <View style={styles.teamContainer}>
                  {match.away.logo && (
                    <Image
                      source={{ uri: match.away.logo }}
                      style={styles.logo}
                      contentFit="contain"
                    />
                  )}
                  <ThemedText style={styles.teamName}>
                    {match.away.name[language]}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          ))
        ) : (
          <ThemedText style={{ textAlign: "center", marginTop: 20 }}>
            {language === 'ar' ? '⚠️ لا توجد بيانات متاحة' : '⚠️ No data available'}
          </ThemedText>
        )}

        <ThemedView
          ref={newsRef}
          style={styles.titleContainer}
          onLayout={handleNewsLayout}
        >
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
              <TouchableOpacity onPress={() => onSelectLeague('الدوري الإنجليزي')}>
                <ThemedText style={styles.subMenuItem}>
                  {language === 'ar' ? 'الدوري الإنجليزي' : 'Premier League'}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSelectLeague('الدوري الألماني')}>
                <ThemedText style={styles.subMenuItem}>
                  {language === 'ar' ? 'الدوري الألماني' : 'Bundesliga'}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSelectLeague('دوري أبطال أوروبا')}>
                <ThemedText style={styles.subMenuItem}>
                  {language === 'ar' ? 'دوري أبطال أوروبا' : 'UEFA Champions League'}
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
  reactLogo: {
    resizeMode: 'cover',
    height: 178,
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
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
  league: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
  },
  teamContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  logo: {
    width: 55,
    height: 55,
    marginBottom: 6,
  },
  teamName: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  timeContainer: {
    flex: 1, // ✅ ياخذ المساحة الباقية بالمنتصف
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    alignItems: 'center',
    maxHeight: 300,
    backgroundColor: '#fff',
  },
  expandedMenu: { maxHeight: 500 },
  menuItemContainer: {
    flexDirection: 'row',
    writingDirection: 'rtl',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  menuItem: { fontSize: 18, paddingVertical: 12, flex: 1 },
  arrow: { fontSize: 16, marginLeft: 10, color: '#666' },
  arrowRotated: { transform: [{ rotate: '180deg' }] },
  subMenuContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5ff',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  subMenuItem: { fontSize: 16, paddingVertical: 8, paddingHorizontal: 12, color: '#333' },
});
