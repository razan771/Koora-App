import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';

import { CardView } from '@/components/CardView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';

// بيانات الفرق
const teams = [
  {
    id: '1',
    name: 'ريال مدريد',
    query: 'Real Madrid',
    badge: 'https://www.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png',
  },
  {
    id: '2',
    name: 'برشلونة',
    query: 'Barcelona',
    badge: 'https://www.thesportsdb.com/images/media/team/badge/vrtrtp1448813175.png',
  },
  {
    id: '3',
    name: 'الهلال',
    query: 'Al Hilal Riyadh',
    badge: 'https://www.thesportsdb.com/images/media/team/badge/swwvwr1420637053.png',
  },
];


export default function TeamsScreen() {
  return (
    <ParallaxScrollView
      headerImage={
        <Image
          source={require('@/assets/images/headerImage.jpg')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">تعرف على أشهر الفرق</ThemedText>

      </ThemedView>

      <ThemedView style={styles.grid}>
        {teams.map((item) => (
          <CardView style={styles.card}>
          <Pressable
            key={item.id}
            onPress={() => router.push({ pathname: '/TeamScreen', params: { team: item.query } })}
          >

            <ThemedText type="subtitle" style={styles.teamName}>{item.name}</ThemedText>
          </Pressable>
          </CardView>
        ))}
      </ThemedView>
    </ParallaxScrollView>
    
  );
  
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  reactLogo: {
    height: 178,
    width: 290,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    width: '47%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1.41,
    marginBottom: 15,
  },
  badge: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
