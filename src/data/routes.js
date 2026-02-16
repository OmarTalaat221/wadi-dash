// data/routes.js
import { PiBuildingApartment } from "react-icons/pi";
import { IoCarSportOutline, IoChatboxEllipsesOutline } from "react-icons/io5";
import { TbDiscount } from "react-icons/tb";

import Home from "../pages/home";
import Login from "../pages/login";
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
  FaBlog,
  FaCheck,
  FaClipboardCheck,
  FaHome,
  FaImages,
  FaNewspaper,
  FaQuestionCircle,
  FaRunning,
  FaUser,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import TermsAndConditions from "../pages/TermsAndConditions";
import Notifications from "../pages/Notifications";
import Community from "../pages/Community";
import Team from "../pages/Team";
import Gallery from "../pages/gallery";
import Newsletter from "../pages/newsletter";
import Faqs from "../pages/Faqs";
import Requests from "../pages/Requests";
import { FaMessage } from "react-icons/fa6";
import UserProblems from "../pages/UserProblems";
import { MdCategory, MdQuestionMark } from "react-icons/md";
import SiteInfo from "../pages/SiteInfo";
import Activities from "../pages/activities";
import CreateActivity from "../pages/activities/innerPages/create";
import UpdateActivity from "../pages/activities/innerPages/update";
import Blogs from "../pages/adminBlogs";
import OfferBanners from "../pages/OfferBanners";
import HomePageManagement from "../pages/HomePage/HomePage";
import BlogCategories from "../pages/BlogCategories/BlogCategories";
import GalleryCategories from "../pages/GalleryCategories";
import { AiOutlineProduct } from "react-icons/ai";
import AdminUsers from "../pages/AdminUsers/AdminUsers";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  OPERATION_MANAGER: "operation_manager",
  ACCOUNTANT: "accountant",
  CUSTOMER_SUPPORT: "customer_support",
  CONTENT_EDITOR: "content_editor",
};

// ALL ROLES (للصفحات اللي الكل يشوفها)
const ALL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.OPERATION_MANAGER,
  ROLES.ACCOUNTANT,
  ROLES.CUSTOMER_SUPPORT,
  ROLES.CONTENT_EDITOR,
];

// PUBLIC ROUTES
export const publicRoutes = [
  // Dashboard - الكل يشوفها
  {
    title: "Dashboard",
    icon: FaHome,
    hidden: false,
    route: "/",
    element: Home,
    roles: ALL_ROLES,
  },

  // Tours, Accommodation, Transfer, Activities
  // super_admin + operation_manager
  {
    title: "Tours",
    icon: AiOutlineProduct,
    hidden: false,
    route: "/tours",
    element: Tours,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
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
        title: "Orders",
        icon: "/edit.png",
        hidden: true,
        route: "orders/:product_id",
        element: Orders,
      },
    ],
  },
  {
    title: "Accommodation",
    icon: PiBuildingApartment,
    hidden: false,
    route: "/accommodation",
    element: Accommodation,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
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
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
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
    title: "Activities",
    icon: FaRunning,
    hidden: false,
    route: "/activities",
    element: Activities,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
    subLinks: [
      {
        title: "Create",
        icon: "/plus.png",
        hidden: false,
        route: "create",
        element: CreateActivity,
      },
      {
        title: "Update",
        icon: "/edit.png",
        hidden: true,
        route: "update/:product_id",
        element: UpdateActivity,
      },
    ],
  },

  // Admins - super_admin ONLY
  {
    title: "Admins",
    icon: FaUser,
    hidden: false,
    route: "/admins",
    element: AdminUsers,
    roles: [ROLES.SUPER_ADMIN],
  },

  // Requests - Accountant
  {
    title: "Requests",
    icon: FaClipboardCheck,
    hidden: false,
    route: "/requests",
    element: Requests,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER, ROLES.ACCOUNTANT],
  },

  // Content Editor - Blogs, Community, FAQs
  {
    title: "Blogs",
    icon: FaBlog,
    hidden: false,
    route: "/blogs",
    element: Blogs,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER, ROLES.CONTENT_EDITOR],
  },
  {
    title: "Blog Categories",
    icon: MdCategory,
    hidden: false,
    route: "/blog-categories",
    element: BlogCategories,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER, ROLES.CONTENT_EDITOR],
  },
  {
    title: "Community",
    icon: FaUsers,
    hidden: false,
    route: "/community",
    element: Community,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER, ROLES.CONTENT_EDITOR],
  },
  {
    title: "FAQs",
    icon: FaQuestionCircle,
    hidden: false,
    route: "/faqs",
    element: Faqs,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER, ROLES.CONTENT_EDITOR],
  },

  // Customer Support - Messages, Live Support
  {
    title: "Users Messages",
    icon: FaMessage,
    hidden: false,
    route: "/users-messages",
    element: UserProblems,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER, ROLES.CUSTOMER_SUPPORT],
  },
  {
    title: "Live Support",
    icon: IoChatboxEllipsesOutline,
    hidden: false,
    route: "/live-support",
    element: LiveSupport,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER, ROLES.CUSTOMER_SUPPORT],
  },

  // Operation Manager + Super Admin
  {
    title: "Gallery",
    icon: FaImages,
    hidden: false,
    route: "/gallery",
    element: Gallery,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
  },
  {
    title: "Gallery Categories",
    icon: FaImages,
    hidden: true,
    route: "/gallery/categories",
    element: GalleryCategories,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
  },
  {
    title: "Terms & Conditions",
    icon: FaCheck,
    hidden: false,
    route: "/terms-and-conditions",
    element: TermsAndConditions,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
  },
  {
    title: "Notifications",
    icon: FaBell,
    hidden: false,
    route: "/notifications",
    element: Notifications,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
  },
  {
    title: "Offer Banners",
    icon: TbDiscount,
    hidden: false,
    route: "/offer-banners",
    element: OfferBanners,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
  },
  {
    title: "Home Page",
    icon: FaHome,
    hidden: false,
    route: "/home-page",
    element: HomePageManagement,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
  },
  {
    title: "Team",
    icon: FaUserFriends,
    hidden: false,
    route: "/team",
    element: Team,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
  },
  {
    title: "Newsletter",
    icon: FaNewspaper,
    hidden: false,
    route: "/newsletter",
    element: Newsletter,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
  },
  {
    title: "Site Info",
    icon: MdQuestionMark,
    hidden: false,
    route: "/site-info",
    element: SiteInfo,
    roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION_MANAGER],
  },
];

export const authRoutes = [
  {
    title: "Login",
    icon: null,
    hidden: true,
    route: "/login",
    element: Login,
  },
];

export const getRoutesByRole = (userRole) => {
  return publicRoutes.filter((route) => {
    if (!route.roles || route.roles.length === 0) return true;
    return route.roles.includes(userRole);
  });
};

export const canAccessRoute = (userRole, routePath) => {
  const route = publicRoutes.find((r) => {
    if (r.route === routePath) return true;
    // Check sub routes
    if (r.subLinks) {
      return r.subLinks.some(
        (sub) =>
          `${r.route}/${sub.route}` === routePath ||
          routePath.startsWith(`${r.route}/`)
      );
    }
    return false;
  });

  if (!route) return false;
  if (!route.roles || route.roles.length === 0) return true;
  return route.roles.includes(userRole);
};
