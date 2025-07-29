export const posts = [
  {
    id: 1,
    pageName: "Mohammed El-sayed",
    isSponsored: true,
    status: "pending", // Added status field
    profileImage:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=face",
    content:
      "Breaking: OpenAI announces new breakthrough in artificial intelligence",
    description: "What a great day to be alive",
    hashtags: ["#AI", "#technology", "#innovation"],
    postImage:
      "https://images.unsplash.com/photo-1511444083353-8fec127fa73b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHZpc2l0aW5nfGVufDB8fDB8fHww",
    websiteName: "techcrunch.com",
    websiteTagline: "The latest technology news and information on startups",
    likes: 1247,
    comments: 89,
    shares: 156,
    likedBy: [
      {
        name: "Sarah Johnson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "Mike Chen",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "Emma Wilson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      },
    ],
    commentsData: [
      {
        id: 1,
        user: {
          name: "Alex Rodriguez",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        },
        text: "This is absolutely incredible! The future is here 🚀",
        likes: 23,
        time: "2h",
      },
      {
        id: 2,
        user: {
          name: "Lisa Park",
          avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
        },
        text: "Can't wait to see how this impacts software development",
        likes: 15,
        time: "1h",
      },
      {
        id: 3,
        user: {
          name: "David Kim",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
        },
        text: "Finally! This is what we've been waiting for",
        likes: 8,
        time: "45m",
      },
    ],
    sharedBy: [
      { name: "Tech Weekly", followers: "125K followers" },
      { name: "AI Enthusiasts", followers: "89K followers" },
      { name: "Innovation Hub", followers: "67K followers" },
    ],
  },
  {
    id: 2,
    pageName: "National Geographic",
    isSponsored: false,
    status: "accepted", // Added status field
    profileImage:
      "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=100&h=100&fit=crop",
    content: "Discover the hidden wonders of the Amazon rainforest",
    description:
      "Scientists have discovered new species deep in the Amazon that could hold the key to understanding biodiversity and climate change.",
    hashtags: ["#nature", "#amazon", "#wildlife"],
    postImage:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=300&fit=crop",
    websiteName: "nationalgeographic.com",
    websiteTagline: "Inspiring people to care about the planet",
    likes: 3421,
    comments: 234,
    shares: 892,
    likedBy: [
      {
        name: "Sarah Johnson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "Mike Chen",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "Emma Wilson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      },
    ],
    commentsData: [
      {
        id: 1,
        user: {
          name: "Alex Rodriguez",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        },
        text: "This is absolutely incredible! The future is here 🚀",
        likes: 23,
        time: "2h",
      },
      {
        id: 2,
        user: {
          name: "Lisa Park",
          avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
        },
        text: "Can't wait to see how this impacts software development",
        likes: 15,
        time: "1h",
      },
      {
        id: 3,
        user: {
          name: "David Kim",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
        },
        text: "Finally! This is what we've been waiting for",
        likes: 8,
        time: "45m",
      },
    ],
    sharedBy: [
      { name: "Tech Weekly", followers: "125K followers" },
      { name: "AI Enthusiasts", followers: "89K followers" },
      { name: "Innovation Hub", followers: "67K followers" },
    ],
  },
  {
    id: 3,
    pageName: "Mohammed El-sayed",
    isSponsored: true,
    status: "rejected", // Added status field
    profileImage:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop",
    content: "The ultimate comfort food recipe that will change your life!",
    description:
      "To be honest, I'm very excited about this new place, I'm sure it will be a great success",
    hashtags: ["#recipe", "#pasta", "#cooking"],
    postImage:
      "https://images.unsplash.com/photo-1625470496630-9db4b1add7b3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8dmlzaXRpbmd8ZW58MHx8MHx8fDA%3D",
    websiteName: "tasty.co",
    websiteTagline: "Food videos and recipes for every occasion",
    likes: 2156,
    comments: 167,
    shares: 445,
    likedBy: [
      {
        name: "Sarah Johnson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "Mike Chen",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "Emma Wilson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      },
    ],
    commentsData: [
      {
        id: 1,
        user: {
          name: "Alex Rodriguez",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        },
        text: "This is absolutely incredible! The future is here 🚀",
        likes: 23,
        time: "2h",
      },
      {
        id: 2,
        user: {
          name: "Lisa Park",
          avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
        },
        text: "Can't wait to see how this impacts software development",
        likes: 15,
        time: "1h",
      },
      {
        id: 3,
        user: {
          name: "David Kim",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
        },
        text: "Finally! This is what we've been waiting for",
        likes: 8,
        time: "45m",
      },
    ],
    sharedBy: [
      { name: "Tech Weekly", followers: "125K followers" },
      { name: "AI Enthusiasts", followers: "89K followers" },
      { name: "Innovation Hub", followers: "67K followers" },
    ],
  },
  {
    id: 4,
    pageName: "NASA",
    isSponsored: false,
    status: "accepted", // Added status field
    profileImage:
      "https://images.unsplash.com/photo-1446776656982-73cd2c4a6119?w=100&h=100&fit=crop",
    content: "Stunning new images from the James Webb Space Telescope",
    description:
      "These infrared images reveal star formation in unprecedented detail, showing us the universe as we've never seen it before.",
    hashtags: ["#space", "#astronomy", "#JWST"],
    postImage:
      "https://plus.unsplash.com/premium_photo-1707563216156-e33bf94d36c8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c3RhcnN8ZW58MHx8MHx8fDA%3D",
    websiteName: "nasa.gov",
    websiteTagline: "Exploring the universe and our home planet",
    likes: 5234,
    comments: 432,
    shares: 1203,
    likedBy: [
      {
        name: "Sarah Johnson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "Mike Chen",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "Emma Wilson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      },
    ],
    commentsData: [
      {
        id: 1,
        user: {
          name: "Alex Rodriguez",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        },
        text: "This is absolutely incredible! The future is here 🚀",
        likes: 23,
        time: "2h",
      },
      {
        id: 2,
        user: {
          name: "Lisa Park",
          avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
        },
        text: "Can't wait to see how this impacts software development",
        likes: 15,
        time: "1h",
      },
      {
        id: 3,
        user: {
          name: "David Kim",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
        },
        text: "Finally! This is what we've been waiting for",
        likes: 8,
        time: "45m",
      },
    ],
    sharedBy: [
      { name: "Tech Weekly", followers: "125K followers" },
      { name: "AI Enthusiasts", followers: "89K followers" },
      { name: "Innovation Hub", followers: "67K followers" },
    ],
  },
  {
    id: 5,
    pageName: "Travel + Leisure",
    isSponsored: true,
    status: "pending", // Added status field
    profileImage:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop",
    content: "10 hidden gems in Europe you need to visit this summer",
    description:
      "Escape the crowds and discover these breathtaking destinations that offer authentic culture, stunning landscapes, and unforgettable experiences.",
    hashtags: ["#travel", "#europe", "#wanderlust"],
    postImage:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=300&fit=crop",
    websiteName: "travelandleisure.com",
    websiteTagline: "Inspiring travel experiences around the world",
    likes: 1876,
    comments: 298,
    shares: 567,
    likedBy: [
      {
        name: "Sarah Johnson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "Mike Chen",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      },
      {
        name: "Emma Wilson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      },
    ],
    commentsData: [
      {
        id: 1,
        user: {
          name: "Alex Rodriguez",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        },
        text: "This is absolutely incredible! The future is here 🚀",
        likes: 23,
        time: "2h",
      },
      {
        id: 2,
        user: {
          name: "Lisa Park",
          avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
        },
        text: "Can't wait to see how this impacts software development",
        likes: 15,
        time: "1h",
      },
      {
        id: 3,
        user: {
          name: "David Kim",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
        },
        text: "Finally! This is what we've been waiting for",
        likes: 8,
        time: "45m",
      },
    ],
    sharedBy: [
      { name: "Tech Weekly", followers: "125K followers" },
      { name: "AI Enthusiasts", followers: "89K followers" },
      { name: "Innovation Hub", followers: "67K followers" },
    ],
  },
];
