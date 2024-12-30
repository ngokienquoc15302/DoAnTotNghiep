import firestore from '@react-native-firebase/firestore';
const playlists = [
  {
    title: "Relaxing Vibes",
    description: "Những giai điệu thư giãn cho ngày dài",
    imageUrl: "https://example.com/images/relaxing-vibes.jpg",
    isSystemGenerated: true,
    likes: 250,
    tags: ["Chill", "Instrumental"],
    songs: [
      "7jkL8M9hRVBDSx7r2P10",
      "AJ38PdVDLgZA2EX7y5dB",
      "I4uLAsksHuKY9zWTUuX"
    ],
    createdAt: firestore.Timestamp.fromDate(new Date("2024-12-01T08:15:42")),
    updatedAt: firestore.Timestamp.fromDate(new Date("2024-12-01T08:15:42")),
  },
  {
    title: "Workout Energy",
    description: "Âm nhạc sôi động để tập luyện",
    imageUrl: "https://example.com/images/workout-energy.jpg",
    isSystemGenerated: true,
    likes: 340,
    tags: ["Workout", "Upbeat"],
    songs: [
      "8nmh0T7f2cVFMvSxvC14",
      "CJ00GdVQLgZC6PY9h4dB",
      "I5uLJsksGuKJ8xGTTrE"
    ],
    createdAt: firestore.Timestamp.fromDate(new Date("2024-11-30T10:20:30")),
    updatedAt: firestore.Timestamp.fromDate(new Date("2024-11-30T10:20:30")),
  },
  {
    title: "Party Night",
    description: "Playlist bùng cháy cho những bữa tiệc",
    imageUrl: "https://example.com/images/party-night.jpg",
    isSystemGenerated: true,
    likes: 180,
    tags: ["Party", "Dance"],
    songs: [
      "9nmh1T8h3cVJMvSxvC15",
      "CJ01GdVQLgZC7PX9h5dB",
      "I6uLJsksGuJJ9yGTTrF"
    ],
    createdAt: firestore.Timestamp.fromDate(new Date("2024-12-05T22:30:42")),
    updatedAt: firestore.Timestamp.fromDate(new Date("2024-12-05T22:30:42")),
  },
  {
    title: "Acoustic Bliss",
    description: "Âm nhạc mộc mạc, nhẹ nhàng",
    imageUrl: "https://example.com/images/acoustic-bliss.jpg",
    isSystemGenerated: true,
    likes: 120,
    tags: ["Acoustic", "Relaxing"],
    songs: [
      "6nmh0T8h2cVFMvSxvC16",
      "CJ09GdVQLgZC6PX9h6dB",
      "I3uLJsksGuJJ8yGTTrG"
    ],
    createdAt: firestore.Timestamp.fromDate(new Date("2024-12-10T11:45:15")),
    updatedAt: firestore.Timestamp.fromDate(new Date("2024-12-10T11:45:15")),
  },
  {
    title: "Classical Favorites",
    description: "Những bản nhạc cổ điển bất hủ",
    imageUrl: "https://example.com/images/classical-favorites.jpg",
    isSystemGenerated: true,
    likes: 200,
    tags: ["Classical", "Timeless"],
    songs: [
      "7nmh2T9h3cVFMvSxvC17",
      "CJ10GdVQLgZC6PX9h7dB",
      "I4uLJsksGuJJ9yGTTrH"
    ],
    createdAt: firestore.Timestamp.fromDate(new Date("2024-12-15T14:00:00")),
    updatedAt: firestore.Timestamp.fromDate(new Date("2024-12-15T14:00:00")),
  },
  {
    title: "Morning Boost",
    description: "Những bài hát năng lượng để khởi đầu ngày mới",
    imageUrl: "https://example.com/images/morning-boost.jpg",
    isSystemGenerated: true,
    likes: 150,
    tags: ["Morning", "Motivational"],
    songs: [
      "7nmh2T9h3cVFMvSxvC19",
      "CJ10GdVQLgZC6PX9h9dB",
      "I4uLJsksGuJJ9yGTTrJ"
    ],
    createdAt: firestore.Timestamp.fromDate(new Date("2024-12-20T07:00:00")),
    updatedAt: firestore.Timestamp.fromDate(new Date("2024-12-20T07:00:00")),
  }
];

export default playlists;
