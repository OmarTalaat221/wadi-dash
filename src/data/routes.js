import { PiBuildingApartment } from "react-icons/pi";
import {
  IoCarSportOutline,
  IoChatbox,
  IoChatboxEllipsesOutline,
} from "react-icons/io5";
import Banners from "../pages/banners";
import Home from "../pages/home";
import Login from "../pages/login";

import WebsiteInformation from "../pages/website-information";
import Tours from "../pages/tours";
import CreateTour from "../pages/tours/innerPages/create";
import UpdateTour from "../pages/tours/innerPages/update";
import Accommodation from "../pages/Accommodation";
import CreateAccom from "../pages/Accommodation/innerPages/create";
import UpdateAccom from "../pages/Accommodation/innerPages/update";
import Reviews from "../pages/tours/innerPages/reviews";
import Transfer from "../pages/Transfer";
import UpdateTransfer from "../pages/Transfer/innerPages/update";
import CreateTransfer from "../pages/Transfer/innerPages/create";
import Orders from "../pages/tours/innerPages/orders";
import LiveSupport from "../pages/LiveSupport";
import {
  FaBell,
  FaCheck,
  FaImages,
  FaNewspaper,
  FaQuestionCircle,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import TermsAndConditions from "../pages/TermsAndConditions";
import Notifications from "../pages/Notifications";
import Community from "../pages/Community";
import UsersRequests from "../pages/UsersRequests";
import Team from "../pages/Team";
import Gallery from "../pages/gallery";
import Newsletter from "../pages/newsletter";
import Faqs from "../pages/Faqs";

export const publicRoutes = [
  {
    title: "Dashboard",
    icon: "/space_dashboard.svg",
    hidden: false,
    route: "*",
    element: Home,
  },
  {
    title: "Tours",
    icon: "/Product.svg",
    hidden: false,
    route: "/tours",
    element: Tours,
    subLinks: [
      {
        title: "Create",
        icon: "/plus.png",
        hidden: false,
        route: "create",
        element: CreateTour,
      },
      {
        title: "Reviews",
        icon: "/edit.png",
        hidden: true,
        route: "reviews/:product_id",
        element: Reviews,
      },
      {
        title: "Update",
        icon: "/edit.png",
        hidden: true,
        route: "update/:product_id",
        element: UpdateTour,
      },
      {
        title: "  ",
        icon: "/edit.png",
        hidden: true,
        route: "orders/:product_id",
        element: Orders,
      },
    ],
  },
  // {
  //   title: "Banners",
  //   icon: "/Banners.jpg",
  //   hidden: false,
  //   route: "/Banners",
  //   element: Banners,
  // },
  {
    title: "Accommodation",
    icon: PiBuildingApartment,
    hidden: false,
    route: "/accommodation",
    element: Accommodation,
    subLinks: [
      {
        title: "Create",
        icon: "/plus.png",
        hidden: false,
        route: "create",
        element: CreateAccom,
      },
      {
        title: "Update",
        icon: "/edit.png",
        hidden: true,
        route: "update/:product_id",
        element: UpdateAccom,
      },
    ],
  },
  {
    title: "Transfer",
    icon: IoCarSportOutline,
    hidden: false,
    route: "/transfer",
    element: Transfer,
    subLinks: [
      {
        title: "Create",
        icon: "/plus.png",
        hidden: false,
        route: "create",
        element: CreateTransfer,
      },
      {
        title: "Update",
        icon: "/edit.png",
        hidden: true,
        route: "update/:product_id",
        element: UpdateTransfer,
      },
    ],
  },

  {
    title: "Gallery",
    icon: FaImages,
    hidden: false,
    route: "/gallery",
    element: Gallery,
  },

  {
    title: "FAQs",
    icon: FaQuestionCircle,
    hidden: false,
    route: "/faqs",
    element: Faqs,
  },

  {
    title: "Live Support",
    icon: IoChatboxEllipsesOutline,
    hidden: false,
    route: "/live-support",
    element: LiveSupport,
  },
  {
    title: "Terms & Conditions",
    icon: FaCheck,
    hidden: false,
    route: "/terms-and-conditions",
    element: TermsAndConditions,
  },
  {
    title: "Notifications",
    icon: FaBell,
    hidden: false,
    route: "/notifications",
    element: Notifications,
  },

  {
    title: "Community",
    icon: FaUsers,
    hidden: false,
    route: "/community",
    element: Community,
  },

  {
    title: "Users Requests",
    icon: FaUsers,
    hidden: false,
    route: "/users-requests",
    element: UsersRequests,
  },

  {
    title: "Team",
    icon: FaUserFriends,
    hidden: false,
    route: "/team",
    element: Team,
  },

  {
    title: "Newsletter",
    icon: FaNewspaper,
    hidden: false,
    route: "/newsletter",
    element: Newsletter,
  },

  // {
  //   title: "Website Information",
  //   icon: "/WebsiteInformation.png",
  //   hidden: false,
  //   route: "/WebsiteInformation",
  //   element: WebsiteInformation,
  // },
  // {
  //   title: "Contact Messages",
  //   icon: "/ContactMessages.jpg",
  //   hidden: false,
  //   route: "/ContactMessages",
  //   element: ContactMessages,
  // },
  // {
  //   title: "Apartment",
  //   icon: "/Apartment.jpg",
  //   hidden: false,
  //   route: "/Apartment",
  //   element: Apartment,
  // },
  // {
  //   title: "TeamMembers",
  //   icon: "/TeamMembers.png",
  //   hidden: false,
  //   route: "/TeamMembers",
  //   element: TeamMembers,
  // },
];

export const authRoutes = [
  {
    title: "Login",
    icon: "",
    hidden: true,
    route: "*",
    element: Login,
  },
];
