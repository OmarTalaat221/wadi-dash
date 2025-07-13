import React from "react";
import { FaShower, FaUser, FaWifi } from "react-icons/fa6";
import { IoMdResize } from "react-icons/io";

export const accom = [
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

    images: [
      "https://q-xx.bstatic.com/xdata/images/hotel/max1000/357218660.jpg?k=70155de9108b97718139497f6aa1d57f8b48b82a1561e64c45821224408e8ddf&o=",
      "https://q-xx.bstatic.com/xdata/images/hotel/max1000/357204688.jpg?k=b306cbb1c1f5d60ffd14d228bd78830dec7d994ff3f7f00534dc1df1fbb0a44e&o=",
      "https://q-xx.bstatic.com/xdata/images/hotel/max1000/357205192.jpg?k=3951517d65734b3e4dae0d1f0ccd504efdb4d221523469e586c84f2783b15f09&o=",
      "https://q-xx.bstatic.com/xdata/images/hotel/max1000/357209131.jpg?k=163703d1a72c26925ce0028d408436ccdd449aecab5fb0d8fa0d1bb94f73e2c0&o=",
    ],

    rooms: [
      {
        title: "Superior King Room",
        images: [
          "https://q-xx.bstatic.com/xdata/images/hotel/max2048/434762489.jpg?k=516bd261c27fa904a992b56d08ca227352f0780493a3de48a4171825390a564f&o=",
          "https://q-xx.bstatic.com/xdata/images/hotel/max2048/590933653.jpg?k=03cf6b6a2efe58674718737ac352f9db13a890fabd976ff9b7a746e3a0881bb9&o=",
          "https://q-xx.bstatic.com/xdata/images/hotel/max2048/434762500.jpg?k=c1c1b5640b150c7926b05266de21d57b79d7474c7000ad348b4de86cf3f3f053&o=",
        ],

        features: [
          {
            title: "Room size",
            value: "27 m2",
            icon: IoMdResize,
          },
          {
            title: "Persons",
            value: "2 Persons",
            icon: FaShower,
          },
          {
            title: "Bathroom",
            value: "Private",
            icon: FaUser,
          },
          {
            title: "Wifi",
            value: "Free",
            icon: FaWifi,
          },
        ],
      },
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
];
