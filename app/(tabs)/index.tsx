import ParallaxScrollView, { ParallaxScrollViewRef } from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

type MatchType = {
  id: number;
  league: string;
  time: string;
  home: {
    name: string;
    logo?: string;
    country_name?: string;
    country_flag?: string; // علم الدولة للفريق المستضيف
  };
  away: {
    name: string;
    logo?: string;
    country_name?: string;
    country_flag?: string; // علم الدولة للفريق الضيف
  };
};

export default function index() {
  const [matches, setMatches] = useState<MatchType[]>([]);
  // ——— حالات العرض
  const [menuVisible, setMenuVisible] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  
  // ——— مراجع ScrollView والأقسام
  const scrollViewRef = useRef<ParallaxScrollViewRef>(null);
  const leaguesRef = useRef<View>(null);
  const newsRef = useRef<View>(null);
  
  // متغيرات لتتبع مواضع الأقسام
  const [leaguesPosition, setLeaguesPosition] = useState(0);
  const [newsPosition, setNewsPosition] = useState(0);

  useEffect(() => {
  const today = new Date().toISOString().split("T")[0]; 
  const url = `https://razan771.github.io/Koora-App/assets/data/matches-${today}.json`;

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("فشل تحميل البيانات");
      return res.json();
    })
    .then((data) => setMatches(data))
    .catch((err) => {
      console.error("❌ خطأ في جلب بيانات اليوم:", err.message);
      setMatches([]); // fallback في حالة الخطأ
    });
}, []);


  // ——— دوال فتح/إغلاق القائمة
  const onMenuPress = () => setMenuVisible(true);
  const onCloseMenu = () => {
    setMenuVisible(false);
    setShowSubMenu(false);
  };

  // دالة لإظهار/إخفاء القائمة الفرعية
  const toggleSubMenu = () => {
    setShowSubMenu(!showSubMenu);
  };

  // دالة للتعامل مع النقر على الخيار الأول
  const handleFirstOption = () => {
    if (showSubMenu) {
      // إذا كانت القائمة الفرعية مفتوحة، قم بالتمرير إلى القسم
      onSelectSection('leagues');
    } else {
      // إذا لم تكن مفتوحة، أظهر القائمة الفرعية
      toggleSubMenu();
    }
  };

  // دالة لحفظ موضع الأقسام
  const handleLeaguesLayout = (event: any) => {
    const { y } = event.nativeEvent.layout;
    setLeaguesPosition(y);
  };

  const handleNewsLayout = (event: any) => {
    const { y } = event.nativeEvent.layout;
    setNewsPosition(y);
  };

  // دالة للتمرير إلى القسم المحدد
  const scrollToSection = (section: 'leagues' | 'news') => {
    if (!scrollViewRef.current) return;
    
    let targetY = 0;
    if (section === 'leagues') {
      targetY = leaguesPosition - 50; // إزاحة 50 بكسل من الأعلى
    } else if (section === 'news') {
      targetY = newsPosition - 50; // إزاحة 50 بكسل من الأعلى
    }
    
    scrollViewRef.current.scrollToPosition(Math.max(0, targetY));
  };

  const onSelectSection = (sec: 'leagues' | 'news') => {
    onCloseMenu();
    setTimeout(() => {
      scrollToSection(sec);
    }, 300); // تأخير للسماح بإغلاق الـ Modal
  };

  // دالة للتعامل مع اختيار دوري معين
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
      >
        <ThemedView 
          ref={leaguesRef}
          style={styles.titleContainer}
          onLayout={handleLeaguesLayout}
        >
          <ThemedText type="title">
            مـبـاريـات الـيـوم
          </ThemedText>
        </ThemedView>

        {matches.map((match) => (
          <ThemedView key={match.id} style={styles.matchCard}>
            <ThemedView style={styles.matchRow}>
              {/* الفريق المستضيف (يمين) */}
              <ThemedView style={styles.teamContainer}>
                {match.home.logo && (
                  <Image source={{ uri: match.home.logo }} style={styles.logo} contentFit="contain" />
                )}
                <ThemedText style={styles.teamName}>{match.home.name}</ThemedText>
                {match.home.country_flag ? (
                  <Image source={{ uri: match.home.country_flag }} style={styles.flag} contentFit="contain" />
                ) : match.home.country_name ? (
                  <ThemedText style={styles.countryText}>{match.home.country_name}</ThemedText>
                ) : null} 
              </ThemedView>

              {/* معلومات المباراة (وسط) */}
              <ThemedView style={styles.middleInfo}>
                <ThemedText type="defaultSemiBold" style={styles.league}>{match.league}</ThemedText>
                <ThemedText style={styles.time}>
                  {new Date(match.time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </ThemedText>
              </ThemedView>

              {/* الفريق الضيف (يسار) */}
              <ThemedView style={styles.teamContainer}>
                {match.away.logo && (
                  <Image source={{ uri: match.away.logo }} style={styles.logo} contentFit="contain" />
                )}
                <ThemedText style={styles.teamName}>{match.away.name}</ThemedText>
                {match.away.country_flag ? (
                  <Image source={{ uri: match.away.country_flag }} style={styles.flag} contentFit="contain" />
                ) : match.away.country_name ? (
                  <ThemedText style={styles.countryText}>{match.away.country_name}</ThemedText>
                ) : null}  
              </ThemedView>
            </ThemedView>
          </ThemedView>
        ))}
        
        <ThemedView 
          ref={newsRef}
          style={styles.titleContainer}
          onLayout={handleNewsLayout}
        >
          <ThemedText type="title">
            أهم الأخبار
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>
      
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.backdrop} onPress={onCloseMenu} />
        <ThemedView style={[styles.menuContainer, showSubMenu && styles.expandedMenu]}>
          <TouchableOpacity onPress={handleFirstOption} style={styles.menuItemContainer}>
            <ThemedText style={styles.menuItem}>الدوريات</ThemedText>
            <ThemedText style={[styles.arrow, showSubMenu && styles.arrowRotated]}>
              {showSubMenu ? '▲' : '▼'}
            </ThemedText>
          </TouchableOpacity>
          
          {showSubMenu && (
            <ThemedView style={styles.subMenuContainer}>
              <TouchableOpacity onPress={() => onSelectLeague('الدوري السعودي')}>
                <ThemedText style={styles.subMenuItem}>الدوري السعودي</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSelectLeague('الدوري الإنجليزي')}>
                <ThemedText style={styles.subMenuItem}>الدوري الإنجليزي</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSelectLeague('الدوري الإسباني')}>
                <ThemedText style={styles.subMenuItem}>الدوري الإسباني</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSelectLeague('دوري أبطال أوروبا')}>
                <ThemedText style={styles.subMenuItem}>دوري أبطال أوروبا</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSelectLeague('كأس العالم')}>
                <ThemedText style={styles.subMenuItem}>كأس العالم</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
          
          <TouchableOpacity onPress={() => onSelectSection('news')}>
            <ThemedText style={styles.menuItem}>أخبار كرة القدم</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 30,
  },
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
    minHeight: 130,
    padding: 12,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0bb33a',
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  teamContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 6,
  },
  teamName: {
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  middleInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  league: {
    paddingBottom: 4
  },
  time: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flag: {
    width: 24,
    height: 16,
    marginTop: 4,
    borderRadius: 2,
  },
  countryText: {
    fontSize: 12,
    marginTop: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuContainer: {
    flexDirection: 'column',
    position: 'absolute',
    top: 80,
    left: 20,
    right: 80,
    borderRadius: 8,
    borderColor: "black",
    borderWidth: 1,
    padding: 16,
    alignContent: 'center',
    alignItems: 'center',
    maxHeight: 300,
  },
  expandedMenu: {
    maxHeight: 500,
  },
  menuItemContainer: {
    flexDirection: 'row',
    writingDirection: 'rtl',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  menuItem: {
    fontSize: 18,
    paddingVertical: 12,
    flex: 1,
  },
  arrow: {
    fontSize: 16,
    marginLeft: 10,
    color: '#666',
  },
  arrowRotated: {
    transform: [{ rotate: '180deg' }],
  },
  subMenuContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  subMenuItem: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#333',
  },
});