// components/TeamBadgeFetcher.tsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

type Props = {
  teamName: string;
  size?: number;
};

type ApiResponse = {
  teams: {
    strTeamBadge: string;
  }[];
};

export const TeamCard = ({ teamName, size = 80 }: Props) => {
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const response = await axios.get<ApiResponse>(`https://www.thesportsdb.com/api/v1/json/1/searchteams.php`, {
  params: {
    t: teamName.trim()
  }
});

        console.log('🔍 Response:', response.data);
        const badge = response.data?.teams?.[0]?.strTeamBadge || null;
        setBadgeUrl(badge);
      } catch (error) {
        console.error('❌ فشل في تحميل الشعار:', error);
        setBadgeUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBadge();
  }, [teamName]);

  if (loading) {
    return <ActivityIndicator size="small" />;
  }

  if (!badgeUrl) {
    return (
      <View style={[styles.placeholder, { width: size, height: size }]} />
    );
  }

  return (
    <Image
      source={{ uri: badgeUrl }}
      style={{ width: size, height: size, resizeMode: 'contain' }}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#ccc',
    borderRadius: 8,
  },
});
