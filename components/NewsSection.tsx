import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const newsData = [
  {
    id: '1',
    title: 'الهلال يفوز على النصر 2-1 في مباراة مثيرة',
    image: require('@/assets/images/match1.jpeg'),
    time: 'قبل ساعتين',
  },
  {
    id: '2',
    title: 'تعادل مثير بين ريال مدريد وبرشلونة 3-3',
    image: require('@/assets/images/match2.jpg'),
    time: 'منذ 4 ساعات',
  },
];

export default function NewsSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📢 آخر أخبار المباريات</Text>

      <FlatList
        horizontal
        data={newsData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => {}}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 10,
    color: '#3a2e1f',
  },
  list: {
    paddingHorizontal: 10,
  },
  card: {
    width: 250,
    backgroundColor: '#fff7ec',
    borderRadius: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 120,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    padding: 10,
    color: '#4c3611',
  },
  time: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingBottom: 10,
    color: '#7a6d58',
  },
});
