import formattedDate from "../utils/formatDate";

  const days = [
  {
    day: 1,
    date: formattedDate("2025-06-19"),
    location: {
      en: "Reykjavik",
      ar: "ريكيافيك",
    },
    description: {
      en: "Day one offers the choice of sightseeing around the Snaefellsnes Peninsula or exploring Reykjavik.",
      ar: "يقدم اليوم الأول خيار مشاهدة المعالم السياحية حول شبه جزيرة سنايفلسنيس أو استكشاف ريكيافيك.",
    },
    accommodation: [
      {
        id: 1,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729794/Accommodation_2_feidgt.png",
        name: {
          en: "KEX Hostel",
          ar: "نزل كيكس",
        },
        category: {
          en: "Hostel",
          ar: "نزل",
        },
        check_in_out: "15:00 / 11:00",
        location: {
          en: "1 km from center",
          ar: "1 كم من المركز",
        },
        parking: {
          en: "Available",
          ar: "متوفر",
        },
        price_per_night: 42,
        rating: 4.3,
        reviews: 2410,
      },
      {
        id: 2,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729863/Accommodation_3_k7ycha.png",
        name: {
          en: "Stay Apartments Bolholt",
          ar: "شقق ستاي بولهولت",
        },
        category: {
          en: "Apartment",
          ar: "شقة",
        },
        check_in_out: "15:00 / 11:00",
        location: {
          en: "2.4 km from center",
          ar: "2.4 كم من المركز",
        },
        parking: {
          en: "Available",
          ar: "متوفر",
        },
        price_per_night: 123,
        rating: 4.2,
        reviews: 458,
      },
    ],
    transfers: [
      {
        id: 1,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742735075/21_oo6clb.png",
        name: {
          en: "Private Car",
          ar: "سيارة خاصة",
        },
        category: {
          en: "jeep",
          ar: "جيب",
        },
        duration: {
          en: "4 seats",
          ar: "4 مقاعد",
        },
        language: {
          en: "English",
          ar: "الإنجليزية",
        },
        price: 50,
        rating: 4.5,
        reviews: 120,
        difficulty: {
          en: "Easy",
          ar: "سهل",
        },
        capacity: 4,
      },
      {
        id: 2,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742735071/19_wtfslb.png",
        name: {
          en: "Family car",
          ar: "سيارة عائلية",
        },
        category: {
          en: "jeep",
          ar: "جيب",
        },
        duration: {
          en: "2 seats",
          ar: "مقعدان",
        },
        language: {
          en: "English",
          ar: "الإنجليزية",
        },
        price: 25,
        rating: 4.0,
        reviews: 350,
        difficulty: {
          en: "Easy",
          ar: "سهل",
        },
        capacity: 5,
      },
    ],
  },
  {
    day: 2,
    date: formattedDate("2025-06-20"),
    location: {
      en: "Akureyri",
      ar: "أكوريري",
    },
    description: {
      en: "Explore the northern capital of Iceland.",
      ar: "استكشف العاصمة الشمالية لآيسلندا.",
    },
    accommodation: [
      {
        id: 4,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729794/Accommodation_2_feidgt.png",
        name: {
          en: "Fosshotel Baron",
          ar: "فوسهوتيل بارون",
        },
        category: {
          en: "3 Stars Hotel",
          ar: "فندق 3 نجوم",
        },
        check_in_out: "15:00 / 11:00",
        location: {
          en: "1.2 km from center",
          ar: "1.2 كم من المركز",
        },
        parking: {
          en: "Available",
          ar: "متوفر",
        },
        price_per_night: 670,
        rating: 4.0,
        reviews: 1230,
      },
      {
        id: 3,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742730347/stay_apartment_bolhlt_ibcnlr.png",
        name: {
          en: "Stay Apartments Bolholt",
          ar: "شقق ستاي بولهولت",
        },
        category: {
          en: "Apartment",
          ar: "شقة",
        },
        check_in_out: "15:00 / 11:00",
        location: {
          en: "2.4 km from center",
          ar: "2.4 كم من المركز",
        },
        parking: {
          en: "Available",
          ar: "متوفر",
        },
        price_per_night: 222,
        rating: 4.2,
        reviews: 458,
      },
    ],
    transfers: [
      {
        id: 3,
        language: {
          en: "English",
          ar: "الإنجليزية",
        },
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729914/Domestic_Flight_wuqhnh.png",
        name: {
          en: "Domestic Flight",
          ar: "رحلة داخلية",
        },
        category: {
          en: "Flight",
          ar: "رحلة طيران",
        },
        duration: {
          en: "1 hour",
          ar: "ساعة واحدة",
        },
        price: 150,
        rating: 4.7,
        reviews: 890,
        difficulty: {
          en: "Easy",
          ar: "سهل",
        },
        capacity: 30,
      },
      {
        id: 4,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729917/Scenic_Bus_Ride_gyyuz3.png",
        name: {
          en: "Scenic Bus Ride",
          ar: "رحلة حافلة خلابة",
        },
        category: {
          en: "Bus",
          ar: "حافلة",
        },
        duration: {
          en: "5 hours",
          ar: "5 ساعات",
        },
        language: {
          en: "English",
          ar: "الإنجليزية",
        },
        price: 75,
        rating: 4.2,
        reviews: 560,
        difficulty: {
          en: "Easy",
          ar: "سهل",
        },
        capacity: 20,
      },
    ],
  },
  {
    day: 3,
      date: formattedDate("2025-06-21"),
    location: {
      en: "Akureyri",
      ar: "أكوريري",
    },
    description: {
      en: "Explore the northern capital of Iceland.",
      ar: "استكشف العاصمة الشمالية لآيسلندا.",
    },
    accommodation: [
      {
        id: 78,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729794/Accommodation_2_feidgt.png",
        name: {
          en: "Fosshotel Baron",
          ar: "فوسهوتيل بارون",
        },
        category: {
          en: "3 Stars Hotel",
          ar: "فندق 3 نجوم",
        },
        check_in_out: "15:00 / 11:00",
        location: {
          en: "1.2 km from center",
          ar: "1.2 كم من المركز",
        },
        parking: {
          en: "Available",
          ar: "متوفر",
        },
        price_per_night: 300,
        rating: 4.0,
        reviews: 1230,
      },
      {
        id: 3,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742730347/stay_apartment_bolhlt_ibcnlr.png",
        name: {
          en: "Stay Apartments Bolholt",
          ar: "شقق ستاي بولهولت",
        },
        category: {
          en: "Apartment",
          ar: "شقة",
        },
        check_in_out: "15:00 / 11:00",
        location: {
          en: "2.4 km from center",
          ar: "2.4 كم من المركز",
        },
        parking: {
          en: "Available",
          ar: "متوفر",
        },
        price_per_night: 222,
        rating: 4.2,
        reviews: 458,
      },
    ],
    transfers: [
      {
        id: 5,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742735075/21_oo6clb.png",
        name: {
          en: "Private Car Transfer",
          ar: "نقل بسيارة خاصة",
        },
        category: {
          en: "Private Transfer",
          ar: "نقل خاص",
        },
        duration: {
          en: "1 hour",
          ar: "ساعة واحدة",
        },
        language: {
          en: "English",
          ar: "الإنجليزية",
        },
        price: 100,
        rating: 4.6,
        reviews: 320,
        difficulty: {
          en: "Easy",
          ar: "سهل",
        },
        capacity: 4,
      },
      {
        id: 6,
        image:
          "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742735071/19_wtfslb.png",
        name: {
          en: "Bike Rental",
          ar: "تأجير دراجات",
        },
        category: {
          en: "Self-Transfer",
          ar: "نقل ذاتي",
        },
        duration: {
          en: "Flexible",
          ar: "مرن",
        },
        language: {
          en: "English",
          ar: "الإنجليزية",
        },
        price: 20,
        rating: 4.3,
        reviews: 210,
        difficulty: {
          en: "Easy",
          ar: "سهل",
        },
        capacity: 4,
      },
    ],
  },
];

export default days;
