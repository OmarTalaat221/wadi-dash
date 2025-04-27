export const days = [
  {
    day: 1,

    location: "Reykjavik",
    description:
      "Day five offers the choice of sightseeing around the Snaefellsnes Peninsula or exploring Reykjavik.",
    accommodation: [
      {
        id: 1,
        rating: 9.0,
        reviews: 148,
        title: "Snorri's Guesthouse",
        imageCover:
          "https://gti.images.tshiftcdn.com/4761573/x/0/357218660.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",

        price: 107,
        desc: "Category: 3 Stars Guesthouse, Check-in: 14:00 / 11:00",
        facilities: [
          { facilitiesTitle: "Category", facilitiesImage: "🏠" },
          { facilitiesTitle: "Check-in", facilitiesImage: "🕒" },
          { facilitiesTitle: "Location", facilitiesImage: "📍" },
          { facilitiesTitle: "Parking", facilitiesImage: "🅿️" },
        ],
      },
      {
        id: 2,
        rating: 8.6,
        reviews: 2428,
        title: "KEX Hostel",
        imageCover:
          "https://gti.images.tshiftcdn.com/7771579/x/0/21594775.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",

        price: "42 Bed dorm",
        desc: "Category: Hostel, Check-in: 15:00 / 11:00",
        facilities: [
          { facilitiesTitle: "Category", facilitiesImage: "🏠" },
          { facilitiesTitle: "Check-in", facilitiesImage: "🕒" },
          { facilitiesTitle: "Location", facilitiesImage: "📍" },
          { facilitiesTitle: "Sleeps", facilitiesImage: "🛏️" },
        ],
      },
    ],
    transfers: [
      {
        id: 1,
        image:
          "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
        name: "Mercedes-Benz E-Class",
        category: "Private Transfer",
        duration: "30 minutes",
        language: "English",
        price: 50,
        rating: 4.5,
        reviews: 120,

        difficulty: "Easy",
      },
      {
        id: 2,
        image:
          "https://gti.images.tshiftcdn.com/7446826/x/0/northern-lights-tour-with-free-photos-refreshments.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
        name: "Toyota Hiace",
        category: "Toyota Hiace",
        duration: "45 minutes",
        language: "English",
        price: 25,
        rating: 4.0,
        reviews: 350,
        difficulty: "Easy",
      },
    ],
  },
  {
    day: 2,

    location: "Akureyri",
    description: "Explore the northern capital of Iceland.",
    accommodation: [
      {
        id: 3,
        rating: 9.0,
        reviews: 1201,
        title: "Skuggi Hotel by Keahotels",
        imageCover:
          "https://gti.images.tshiftcdn.com/2608287/x/0/skuggi-hotel-exterior.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
        price: 162,
        desc: "Category: 3 Stars Hotel, Check-in: 15:00 / 12:00",
        facilities: [
          { facilitiesTitle: "Category", facilitiesImage: "🏠" },
          { facilitiesTitle: "Breakfast", facilitiesImage: "🍳" },
          { facilitiesTitle: "Check-in", facilitiesImage: "🕒" },
          { facilitiesTitle: "Location", facilitiesImage: "📍" },
        ],
      },
      {
        id: 2,
        rating: 8.6,
        reviews: 2428,
        title: "KEX Hostel",
        imageCover:
          "https://gti.images.tshiftcdn.com/7771579/x/0/21594775.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",

        price: "42 Bed dorm",
        desc: "Category: Hostel, Check-in: 15:00 / 11:00",
        facilities: [
          { facilitiesTitle: "Category", facilitiesImage: "🏠" },
          { facilitiesTitle: "Check-in", facilitiesImage: "🕒" },
          { facilitiesTitle: "Location", facilitiesImage: "📍" },
          { facilitiesTitle: "Sleeps", facilitiesImage: "🛏️" },
        ],
      },
    ],
    transfers: [
      {
        id: 3,
        language: "English",
        image:
          "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
        name: "Range Rover Sport",
        category: "Range Rover Sport",
        duration: "1 hour",
        price: 150,
        rating: 4.7,
        reviews: 890,
        difficulty: "Easy",
      },
      {
        id: 4,
        image:
          "https://gti.images.tshiftcdn.com/7446826/x/0/northern-lights-tour-with-free-photos-refreshments.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
        name: "Ford Transit",
        category: "Ford Transit",
        duration: "5 hours",
        language: "English",
        price: 75,
        rating: 4.2,
        reviews: 560,
        difficulty: "Easy",
      },
    ],
  },
];
