const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
const Event = require('../models/Event');
const News = require('../models/News');
const Facility = require('../models/Facility');
const LostFoundItem = require('../models/LostFoundItem');
const Complaint = require('../models/Complaint');
const ClubRecruitment = require('../models/ClubRecruitment');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

// Helper for relative dates
const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

// Dummy data
const dummyEvents = [
  {
    title: 'Annual Tech Fest',
    description: 'Join us for the biggest technology festival of the year! Featuring coding competitions, tech talks, workshops, and networking opportunities with industry leaders.',
    date: daysFromNow(20),
    location: 'Main Auditorium',
    status: 'Upcoming',
    registerUrl: 'https://forms.google.com/techfest2025',
    operatingHours: '9:00 AM - 6:00 PM',
    contactInfo: {
      name: 'Tech Fest Committee',
      email: 'techfest@mitadt.edu',
      phone: '+91 9876543210'
    },
    mapLocation: {
      building: 'Main Building',
      floor: 'Ground Floor',
      room: 'Auditorium A',
      coordinates: {
        lat: 18.493343843257275,
        lng: 74.02357135415613
      }
    },
    image: {
      url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop'
    }
  },
  {
    title: 'Cultural Night',
    description: 'Experience the vibrant culture of our campus with music, dance, drama, and food stalls. A night to remember with performances from various student clubs.',
    date: daysFromNow(10),
    location: 'Open Air Theatre',
    status: 'Upcoming',
    registerUrl: 'https://forms.google.com/culturalnight2025',
    operatingHours: '6:00 PM - 11:00 PM',
    contactInfo: {
      name: 'Cultural Committee',
      email: 'cultural@mitadt.edu',
      phone: '+91 9876543211'
    },
    mapLocation: {
      building: 'Open Air Theatre',
      floor: 'Ground',
      room: 'Main Stage',
      coordinates: {
        lat: 18.49262365645109,
        lng: 74.02565779888813
      }
    },
    image: {
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop'
    }
  },
  {
    title: 'Career Fair',
    description: 'Connect with top recruiters and explore career opportunities. Over 50 companies participating with on-the-spot interviews and job offers.',
    date: daysFromNow(35),
    location: 'Sports Complex',
    status: 'Upcoming',
    registerUrl: 'https://forms.google.com/careerfair2025',
    operatingHours: '9:00 AM - 5:00 PM',
    contactInfo: {
      name: 'Placement Cell',
      email: 'placement@mitadt.edu',
      phone: '+91 9876543212'
    },
    mapLocation: {
      building: 'Sports Complex',
      floor: 'Ground Floor',
      room: 'Main Hall',
      coordinates: {
        lat: 18.491807509791,
        lng: 74.0284366873852
      }
    },
    image: {
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
    }
  },
  {
    title: 'Hackathon',
    description: '48-hour coding marathon to build innovative solutions. Prizes worth ₹1,00,000. Open to all students. Food and refreshments provided.',
    date: daysFromNow(14),
    location: 'IT Building',
    status: 'Upcoming',
    registerUrl: 'https://forms.google.com/hackathon2025',
    operatingHours: '8:00 AM - 8:00 AM (48 hours)',
    contactInfo: {
      name: 'Hackathon Organizers',
      email: 'hackathon@mitadt.edu',
      phone: '+91 9876543213'
    },
    mapLocation: {
      building: 'IT Building',
      floor: '2nd Floor',
      room: 'Lab 201-205',
      coordinates: {
        lat: 18.493930153250627,
        lng: 74.01912736815999
      }
    },
    image: {
      url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop'
    }
  },
  {
    title: 'Sports Day',
    description: 'Annual inter-department sports competition. Events include cricket, football, basketball, athletics, and more. Cheer for your department!',
    date: daysFromNow(5),
    location: 'Cricket Ground & Sports Complex',
    status: 'Ongoing',
    registerUrl: 'https://forms.google.com/sportsday2025',
    operatingHours: '7:00 AM - 6:00 PM',
    contactInfo: {
      name: 'Sports Committee',
      email: 'sports@mitadt.edu',
      phone: '+91 9876543214'
    },
    mapLocation: {
      building: 'Sports Complex',
      floor: 'Ground',
      room: 'Main Field',
      coordinates: {
        lat: 18.490748499095503,
        lng: 74.02836838570158
      }
    },
    image: {
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop'
    }
  },
  {
    title: 'Alumni Meet',
    description: 'Reconnect with your batchmates and network with alumni from various industries. Panel discussions, workshops, and networking dinner.',
    date: daysAgo(30),
    location: 'World Peace Dome',
    status: 'Completed',
    registerUrl: '',
    operatingHours: '10:00 AM - 8:00 PM',
    contactInfo: {
      name: 'Alumni Relations',
      email: 'alumni@mitadt.edu',
      phone: '+91 9876543215'
    },
    mapLocation: {
      building: 'World Peace Dome',
      floor: 'Ground Floor',
      room: 'Main Hall',
      coordinates: {
        lat: 18.49262365645109,
        lng: 74.02565779888813
      }
    },
    image: {
      url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop'
    }
  },
  {
    title: 'Workshop on Machine Learning',
    description: 'Learn the fundamentals of machine learning with hands-on projects. Suitable for beginners. Certificate of participation will be provided.',
    date: daysFromNow(7),
    location: 'IT Building, Lab 201',
    status: 'Upcoming',
    registerUrl: 'https://forms.google.com/ml-workshop',
    operatingHours: '2:00 PM - 5:00 PM',
    contactInfo: {
      name: 'Workshop Coordinator',
      email: 'workshops@mitadt.edu',
      phone: '+91 9876543216'
    },
    mapLocation: {
      building: 'IT Building',
      floor: '2nd Floor',
      room: 'Lab 201',
      coordinates: {
        lat: 18.493930153250627,
        lng: 74.01912736815999
      }
    },
    image: {
      url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop'
    }
  },
  {
    title: 'Blood Donation Camp',
    description: 'Join us for a noble cause. Blood donation camp organized in collaboration with Red Cross. All donors will receive a certificate and refreshments.',
    date: daysFromNow(18),
    location: 'Medical Center',
    status: 'Upcoming',
    registerUrl: 'https://forms.google.com/blood-donation',
    operatingHours: '9:00 AM - 4:00 PM',
    contactInfo: {
      name: 'Medical Center',
      email: 'medical@mitadt.edu',
      phone: '+91 9876543217'
    },
    mapLocation: {
      building: 'Administration Building',
      floor: 'Ground Floor',
      room: 'Medical Center',
      coordinates: {
        lat: 18.490946453598095,
        lng: 74.02419055616282
      }
    },
    image: {
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop'
    }
  }
];

const dummyNews = [
  {
    title: 'New Research Lab Inaugurated',
    description: 'The university has inaugurated a state-of-the-art research laboratory equipped with the latest technology and equipment. The lab will support research in AI, robotics, and biotechnology.',
    date: daysAgo(10),
    category: 'Campus',
    images: [{
      url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop'
    }]
  },
  {
    title: 'Students Win National Coding Competition',
    description: 'Our students secured first place in the National Coding Championship. The team developed an innovative solution for sustainable energy management.',
    date: daysAgo(20),
    category: 'Achievements',
    images: [{
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'
    }]
  },
  {
    title: 'New Scholarship Program Announced',
    description: 'The university has announced a new merit-based scholarship program for deserving students. Applications are now open for the upcoming academic year.',
    date: daysAgo(5),
    category: 'Academic',
    images: [{
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop'
    }]
  },
  {
    title: 'Campus Wi-Fi Upgraded',
    description: 'The entire campus now has high-speed Wi-Fi connectivity. Students can enjoy seamless internet access in all buildings, libraries, and common areas.',
    date: daysAgo(15),
    category: 'Infrastructure',
    images: [{
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
    }]
  },
  {
    title: 'Guest Lecture by Industry Expert',
    description: 'Renowned tech entrepreneur will deliver a guest lecture on "Future of Technology" next week. All students are invited to attend.',
    date: daysAgo(3),
    category: 'Academic',
    images: [{
      url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop'
    }]
  },
  {
    title: 'Library Extended Hours',
    description: 'The central library will now remain open until 11 PM on weekdays to accommodate students preparing for exams. Additional study spaces have been added.',
    date: daysAgo(7),
    category: 'Campus',
    images: [{
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop'
    }]
  },
  {
    title: 'New Student Portal Launched',
    description: 'The new student portal is now live with enhanced features including online fee payment, course registration, and academic records access.',
    date: daysAgo(2),
    category: 'Infrastructure',
    images: [{
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    }]
  },
  {
    title: 'Inter-College Sports Tournament',
    description: 'Our teams have qualified for the inter-college sports tournament. Support our athletes as they compete for the championship title.',
    date: daysAgo(25),
    category: 'Achievements',
    images: [{
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop'
    }]
  },
  {
    title: 'Research Paper Published',
    description: 'Faculty members from the Computer Science department have published a groundbreaking research paper in a top-tier international journal.',
    date: daysAgo(12),
    category: 'Academic',
    images: [{
      url: 'https://images.unsplash.com/photo-1532619675605-1ede6c4ed2b4?w=800&h=600&fit=crop'
    }]
  }
];

const dummyFacilities = [
  {
    name: 'Central Library',
    description: 'A modern library with over 100,000 books, digital resources, quiet study areas, and group discussion rooms. Open 24/7 during exam season.',
    location: 'Main Building, 2nd Floor',
    type: 'Academic',
    icon: 'FiBookOpen',
    images: [{
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop'
    }]
  },
  {
    name: 'MANET Canteen',
    description: 'Spacious canteen serving delicious and affordable meals. Offers vegetarian and non-vegetarian options, snacks, and beverages throughout the day.',
    location: 'MANET Building, Ground Floor',
    type: 'Food',
    icon: 'FiCoffee',
    images: [{
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
    }]
  },
  {
    name: 'Tuck Shop',
    description: 'Quick bites, snacks, beverages, and stationery items. Perfect for a quick break between classes. Open from 8 AM to 8 PM.',
    location: 'Near IT Building',
    type: 'Food',
    icon: 'FiCoffee',
    images: [{
      url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop'
    }]
  },
  {
    name: 'Computer Labs',
    description: 'State-of-the-art computer laboratories with high-performance systems, latest software, and high-speed internet. Available for classes and project work.',
    location: 'IT Building, 1st & 2nd Floor',
    type: 'Academic',
    icon: 'FiBookOpen',
    images: [{
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop'
    }]
  },
  {
    name: 'Gymnasium',
    description: 'Fully equipped gym with modern fitness equipment, personal trainers, and separate sections for cardio and weight training. Open 6 AM - 10 PM.',
    location: 'Sports Complex',
    type: 'Service',
    icon: 'FiWifi',
    images: [{
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
    }]
  },
  {
    name: 'Student Hostels',
    description: 'Comfortable accommodation with modern amenities, Wi-Fi, mess facilities, and 24/7 security. Separate hostels for boys and girls.',
    location: 'Hostel Block',
    type: 'Accommodation',
    icon: 'FiHome',
    images: [{
      url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop'
    }]
  },
  {
    name: 'Medical Center',
    description: 'On-campus medical facility with qualified doctors and nurses. Provides first aid, basic medical care, and emergency services. Open 24/7.',
    location: 'Administration Building, Ground Floor',
    type: 'Service',
    icon: 'FiWifi',
    images: [{
      url: '/images/medical-facility.png'
    }]
  },
  {
    name: 'Auditorium',
    description: 'Spacious auditorium with modern sound and lighting systems. Hosts events, seminars, guest lectures, and cultural programs. Capacity: 500+ seats.',
    location: 'Main Building, Ground Floor',
    type: 'Academic',
    icon: 'FiBookOpen',
    images: [{
      url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop'
    }]
  }
];

// Seed function
const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await Event.deleteMany({});
    await News.deleteMany({});
    await Facility.deleteMany({});
    await LostFoundItem.deleteMany({});
    await Complaint.deleteMany({});
    await ClubRecruitment.deleteMany({});
    console.log('Existing data cleared.');

    // Get a user to associate with LostFound and Complaints
    let testUser = await User.findOne({ email: process.env.SEED_USER_EMAIL || null }).catch(() => null);
    if (!testUser) {
      // Try to find any existing user
      testUser = await User.findOne();
    }
    
    // If no user exists, create a test user
    if (!testUser) {
      console.log('No users found. Creating a test user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test123456', 10);
      testUser = await User.create({
        name: 'Test User',
        email: 'testuser@mitadt.edu',
        password: hashedPassword,
        phone: '+91 9876543210'
      });
      console.log('✓ Test user created');
    }

    // Seed Events
    console.log('Seeding Events...');
    const events = await Event.insertMany(dummyEvents);
    console.log(`✓ Seeded ${events.length} events`);

    // Seed News
    console.log('Seeding News...');
    const news = await News.insertMany(dummyNews);
    console.log(`✓ Seeded ${news.length} news items`);

    // Seed Facilities
    console.log('Seeding Facilities...');
    const facilities = await Facility.insertMany(dummyFacilities);
    console.log(`✓ Seeded ${facilities.length} facilities`);

    // Seed Lost & Found Items
    console.log('Seeding Lost & Found Items...');
    const dummyLostFound = [
      {
        user: testUser._id,
        type: 'lost',
        title: 'Lost: Black Laptop Bag',
        description: 'Lost a black laptop bag near the library. Contains laptop, charger, and some books. Please contact if found.',
        location: 'Central Library',
        date: daysAgo(5),
        contact: testUser.email,
        images: [{
          public_id: 'lostfound/laptop-bag',
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop'
        }],
        resolved: false
      },
      {
        user: testUser._id,
        type: 'found',
        title: 'Found: Blue Water Bottle',
        description: 'Found a blue water bottle in the canteen. Has a sticker with "MIT-ADT" on it. Please claim at the lost & found desk.',
        location: 'MANET Canteen',
        date: daysAgo(7),
        contact: testUser.email,
        images: [{
          public_id: 'lostfound/water-bottle',
          url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=600&fit=crop'
        }],
        resolved: false
      },
      {
        user: testUser._id,
        type: 'lost',
        title: 'Lost: Student ID Card',
        description: 'Lost my student ID card somewhere on campus. Please return if found.',
        location: 'Near IT Building',
        date: daysAgo(10),
        contact: testUser.email,
        images: [],
        resolved: true,
        resolvedAt: daysAgo(9)
      },
      {
        user: testUser._id,
        type: 'found',
        title: 'Found: Wallet with Cash',
        description: 'Found a wallet containing cash and cards near the sports complex. Please contact with identification to claim.',
        location: 'Sports Complex',
        date: daysAgo(3),
        contact: testUser.email,
        images: [{
          public_id: 'lostfound/wallet',
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop'
        }],
        resolved: false
      },
      {
        user: testUser._id,
        type: 'lost',
        title: 'Lost: AirPods Case',
        description: 'Lost a white AirPods case in the auditorium during the event. Please contact if found.',
        location: 'Main Auditorium',
        date: daysAgo(12),
        contact: testUser.email,
        images: [{
          public_id: 'lostfound/airpods',
          url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop'
        }],
        resolved: false
      },
      {
        user: testUser._id,
        type: 'found',
        title: 'Found: Calculator',
        description: 'Found a scientific calculator in the library. It has a sticker with "MIT-ADT" on it. Please claim at the front desk.',
        location: 'Central Library',
        date: daysAgo(4),
        contact: testUser.email,
        images: [{
          public_id: 'lostfound/calculator',
          url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&h=600&fit=crop'
        }],
        resolved: false
      },
      {
        user: testUser._id,
        type: 'lost',
        title: 'Lost: Textbooks',
        description: 'Lost two textbooks - "Data Structures" and "Algorithms" near the IT Building. Please return if found.',
        location: 'IT Building',
        date: daysAgo(8),
        contact: testUser.email,
        images: [{
          public_id: 'lostfound/books',
          url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=600&fit=crop'
        }],
        resolved: false
      },
      {
        user: testUser._id,
        type: 'found',
        title: 'Found: Keys',
        description: 'Found a set of keys with a keychain near the canteen. Please contact to identify and claim.',
        location: 'MANET Canteen',
        date: daysAgo(6),
        contact: testUser.email,
        images: [{
          public_id: 'lostfound/keys',
          url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop'
        }],
        resolved: false
      }
    ];
    const lostFoundItems = await LostFoundItem.insertMany(dummyLostFound);
    console.log(`✓ Seeded ${lostFoundItems.length} lost & found items`);

    // Seed Complaints
    console.log('Seeding Complaints...');
    const dummyComplaints = [
      {
        user: testUser._id,
        title: 'Wi-Fi Connection Issues in Library',
        description: 'Experiencing frequent Wi-Fi disconnections in the central library, especially in the study areas on the 2nd floor. This is affecting my research work.',
        category: 'IT',
        priority: 'High',
        department: 'IT Services',
        status: 'In Progress',
        statusHistory: [{
          status: 'Open',
          comment: 'Complaint registered',
          updatedBy: testUser._id,
          timestamp: daysAgo(7)
        }, {
          status: 'In Progress',
          comment: 'IT team is investigating the issue',
          updatedBy: testUser._id,
          timestamp: daysAgo(6)
        }]
      },
      {
        user: testUser._id,
        title: 'Broken Water Cooler',
        description: 'The water cooler near the IT Building entrance is not working. Students are unable to get drinking water.',
        category: 'Facilities',
        priority: 'Medium',
        department: 'Facilities Management',
        status: 'Open',
        statusHistory: [{
          status: 'Open',
          comment: 'Complaint registered',
          updatedBy: testUser._id,
          timestamp: daysAgo(5)
        }]
      },
      {
        user: testUser._id,
        title: 'Request for Additional Study Space',
        description: 'The library gets very crowded during exam season. Request to add more study tables and chairs.',
        category: 'Facilities',
        priority: 'Low',
        department: 'Facilities Management',
        status: 'Resolved',
        statusHistory: [{
          status: 'Open',
          comment: 'Complaint registered',
          updatedBy: testUser._id,
          timestamp: daysAgo(30)
        }, {
          status: 'In Progress',
          comment: 'Reviewing space availability',
          updatedBy: testUser._id,
          timestamp: daysAgo(25)
        }, {
          status: 'Resolved',
          comment: 'Additional study spaces have been added to the library',
          updatedBy: testUser._id,
          timestamp: daysAgo(10)
        }]
      },
      {
        user: testUser._id,
        title: 'Canteen Food Quality Issue',
        description: 'The food quality in MANET canteen has deteriorated. Request for better quality control and hygiene standards.',
        category: 'Facilities',
        priority: 'High',
        department: 'Facilities Management',
        status: 'In Progress',
        statusHistory: [{
          status: 'Open',
          comment: 'Complaint registered',
          updatedBy: testUser._id,
          timestamp: daysAgo(4)
        }, {
          status: 'In Progress',
          comment: 'Food quality inspection scheduled',
          updatedBy: testUser._id,
          timestamp: daysAgo(3)
        }]
      },
      {
        user: testUser._id,
        title: 'Security Concern - Unauthorized Access',
        description: 'Noticed unauthorized individuals entering the campus without proper identification. Request for stricter security measures.',
        category: 'Security',
        priority: 'Urgent',
        department: 'Security',
        status: 'In Progress',
        statusHistory: [{
          status: 'Open',
          comment: 'Complaint registered - High priority',
          updatedBy: testUser._id,
          timestamp: daysAgo(2)
        }, {
          status: 'In Progress',
          comment: 'Security team is reviewing access protocols',
          updatedBy: testUser._id,
          timestamp: daysAgo(1)
        }]
      },
      {
        user: testUser._id,
        title: 'Projector Not Working in Lab 205',
        description: 'The projector in Computer Lab 205 is not displaying properly. It affects our class presentations. Request for immediate repair.',
        category: 'IT',
        priority: 'High',
        department: 'IT Services',
        status: 'Open',
        statusHistory: [{
          status: 'Open',
          comment: 'Complaint registered',
          updatedBy: testUser._id,
          timestamp: daysAgo(1)
        }]
      },
      {
        user: testUser._id,
        title: 'Request for More Parking Space',
        description: 'The parking area is always full during peak hours. Request for additional parking space or better parking management system.',
        category: 'Facilities',
        priority: 'Medium',
        department: 'Facilities Management',
        status: 'Open',
        statusHistory: [{
          status: 'Open',
          comment: 'Complaint registered',
          updatedBy: testUser._id,
          timestamp: daysAgo(2)
        }]
      },
      {
        user: testUser._id,
        title: 'Grade Discrepancy in CS301',
        description: 'I believe there is an error in my final grade for CS301. Request for grade review and clarification.',
        category: 'Academic',
        priority: 'High',
        department: 'Academic Affairs',
        status: 'In Progress',
        statusHistory: [{
          status: 'Open',
          comment: 'Complaint registered',
          updatedBy: testUser._id,
          timestamp: daysAgo(3)
        }, {
          status: 'In Progress',
          comment: 'Academic office is reviewing the grade',
          updatedBy: testUser._id,
          timestamp: daysAgo(2)
        }]
      }
    ];
    const complaints = await Complaint.insertMany(dummyComplaints);
    console.log(`✓ Seeded ${complaints.length} complaints`);

    // Seed Club Recruitments
    console.log('Seeding Club Recruitments...');
    const dummyClubs = [
      {
        title: 'Join the Coding Club',
        description: 'Are you passionate about coding? Join our coding club and participate in hackathons, coding competitions, and tech workshops. Open to all skill levels!',
        clubName: 'Coding Club',
        startDate: daysAgo(2),
        endDate: daysFromNow(28),
        formUrl: 'https://forms.google.com/coding-club',
        status: 'Open',
        contactInfo: {
          name: 'Coding Club President',
          email: 'codingclub@mitadt.edu',
          phone: '+91 9876543220'
        },
        image: {
          url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop'
        }
      },
      {
        title: 'Drama Club Auditions',
        description: 'Calling all actors and theatre enthusiasts! Join our drama club and be part of exciting productions. Auditions are open for all students.',
        clubName: 'Drama Club',
        startDate: daysFromNow(3),
        endDate: daysFromNow(33),
        formUrl: 'https://forms.google.com/drama-club',
        status: 'Open',
        contactInfo: {
          name: 'Drama Club Coordinator',
          email: 'dramaclub@mitadt.edu',
          phone: '+91 9876543221'
        },
        image: {
          url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop'
        }
      },
      {
        title: 'Photography Club Recruitment',
        description: 'Love photography? Join our photography club to learn new techniques, participate in photo walks, and showcase your work in exhibitions.',
        clubName: 'Photography Club',
        startDate: daysAgo(5),
        endDate: daysFromNow(25),
        formUrl: 'https://forms.google.com/photography-club',
        status: 'Open',
        contactInfo: {
          name: 'Photography Club Head',
          email: 'photoclub@mitadt.edu',
          phone: '+91 9876543222'
        },
        image: {
          url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop'
        }
      },
      {
        title: 'Music Club Open House',
        description: 'Join our music club and be part of the campus band, choir, or start your own music group. Instruments and practice rooms available.',
        clubName: 'Music Club',
        startDate: daysFromNow(1),
        endDate: daysFromNow(31),
        formUrl: 'https://forms.google.com/music-club',
        status: 'Open',
        contactInfo: {
          name: 'Music Club Director',
          email: 'musicclub@mitadt.edu',
          phone: '+91 9876543223'
        },
        image: {
          url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop'
        }
      },
      {
        title: 'Sports Club Registration',
        description: 'Join various sports teams including cricket, football, basketball, and badminton. Represent the university in inter-college tournaments.',
        clubName: 'Sports Club',
        startDate: daysAgo(30),
        endDate: daysAgo(5),
        formUrl: 'https://forms.google.com/sports-club',
        status: 'Closed',
        contactInfo: {
          name: 'Sports Coordinator',
          email: 'sportsclub@mitadt.edu',
          phone: '+91 9876543224'
        },
        image: {
          url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop'
        }
      },
      {
        title: 'Debate Society Recruitment',
        description: 'Sharpen your public speaking and argumentation skills. Join the debate society and participate in inter-college debate competitions.',
        clubName: 'Debate Society',
        startDate: daysFromNow(5),
        endDate: daysFromNow(35),
        formUrl: 'https://forms.google.com/debate-society',
        status: 'Open',
        contactInfo: {
          name: 'Debate Society President',
          email: 'debate@mitadt.edu',
          phone: '+91 9876543225'
        },
        image: {
          url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop'
        }
      }
    ];
    const clubs = await ClubRecruitment.insertMany(dummyClubs);
    console.log(`✓ Seeded ${clubs.length} club recruitments`);

    // Seed Chats
    console.log('Seeding Chats...');
    await Chat.deleteMany({});

    // Create a few extra dummy users for realistic chat variety
    const bcrypt = require('bcryptjs');
    const hashedPw = await bcrypt.hash('Dummy@1234', 10);
    const dummyUserDefs = [
      { name: 'Priya Sharma',   email: 'priya.sharma@mitadt.edu',   password: hashedPw },
      { name: 'Rahul Mehta',    email: 'rahul.mehta@mitadt.edu',    password: hashedPw },
      { name: 'Ananya Joshi',   email: 'ananya.joshi@mitadt.edu',   password: hashedPw },
      { name: 'Karan Patel',    email: 'karan.patel@mitadt.edu',    password: hashedPw },
      { name: 'Sneha Kulkarni', email: 'sneha.kulkarni@mitadt.edu', password: hashedPw },
    ];

    const chatUsers = [];
    for (const def of dummyUserDefs) {
      let u = await User.findOne({ email: def.email });
      if (!u) u = await User.create(def);
      chatUsers.push(u);
    }
    // Include the main test user too
    const allChatUsers = [testUser, ...chatUsers];
    const u = (i) => allChatUsers[i % allChatUsers.length]._id;

    // Helper: timestamp spread over last 2 days
    const minsAgo = (m) => new Date(Date.now() - m * 60 * 1000);

    const dummyChats = [
      { sender: u(0), message: 'Hey everyone! 👋 Welcome to KampusKart chat!', timestamp: minsAgo(2880) },
      { sender: u(1), message: 'Hi! Finally a campus chat app. This is so useful 🙌', timestamp: minsAgo(2870) },
      { sender: u(2), message: 'Has anyone seen the Tech Fest schedule? When is the hackathon?', timestamp: minsAgo(2850) },
      { sender: u(3), message: 'Hackathon is in 14 days I think. Check the Events section!', timestamp: minsAgo(2840) },
      { sender: u(4), message: 'Just registered for it. The prizes are insane — ₹1 lakh total 🔥', timestamp: minsAgo(2820) },
      { sender: u(5), message: 'Anyone forming teams? I need 2 more members, I\'m a backend dev', timestamp: minsAgo(2800) },
      { sender: u(1), message: 'I\'m in! I do frontend. @Karan you should join too', timestamp: minsAgo(2780) },
      { sender: u(3), message: 'Sure, count me in. What\'s the theme this year?', timestamp: minsAgo(2760) },
      { sender: u(0), message: 'Open theme I heard. Build anything innovative.', timestamp: minsAgo(2740) },
      { sender: u(2), message: 'BTW the library Wi-Fi on 2nd floor is terrible today. Anyone else facing this?', timestamp: minsAgo(2700) },
      { sender: u(4), message: 'Yes! I filed a complaint on KampusKart. IT team said they\'re on it', timestamp: minsAgo(2690) },
      { sender: u(5), message: 'Good to know. I\'ll use the computer lab for now', timestamp: minsAgo(2670) },
      { sender: u(1), message: 'Canteen food was actually really good today ngl 😋', timestamp: minsAgo(2400) },
      { sender: u(3), message: 'What did they have?', timestamp: minsAgo(2395) },
      { sender: u(1), message: 'Pav bhaji and masala dosa. Both were fresh!', timestamp: minsAgo(2390) },
      { sender: u(0), message: 'Okay going to canteen rn 😂', timestamp: minsAgo(2385) },
      { sender: u(2), message: 'Don\'t forget the blood donation camp on the 18th. Please register!', timestamp: minsAgo(2200) },
      { sender: u(4), message: 'Already signed up. It\'s a great cause 🩸', timestamp: minsAgo(2190) },
      { sender: u(5), message: 'Same. The Medical Center team is really well organized', timestamp: minsAgo(2180) },
      { sender: u(3), message: 'Anyone have notes for CS301? I missed the last lecture', timestamp: minsAgo(1800) },
      { sender: u(1), message: 'I have them! Will share on the class group', timestamp: minsAgo(1795) },
      { sender: u(3), message: 'You\'re a lifesaver, thanks! 🙏', timestamp: minsAgo(1790) },
      { sender: u(0), message: 'Reminder: Cultural Night is in 10 days. Get your tickets from the student office!', timestamp: minsAgo(1440) },
      { sender: u(2), message: 'Is it free for students?', timestamp: minsAgo(1435) },
      { sender: u(0), message: 'Yes, free entry with student ID 🎉', timestamp: minsAgo(1430) },
      { sender: u(4), message: 'Our dance group is performing. Come support us! 💃', timestamp: minsAgo(1420) },
      { sender: u(5), message: 'Will definitely be there!', timestamp: minsAgo(1415) },
      { sender: u(1), message: 'Lost my student ID somewhere near IT building 😭 anyone found it?', timestamp: minsAgo(900) },
      { sender: u(3), message: 'Check the Lost & Found section on KampusKart, someone might have posted it', timestamp: minsAgo(895) },
      { sender: u(1), message: 'Oh nice, I didn\'t know that feature existed. Checking now!', timestamp: minsAgo(890) },
      { sender: u(2), message: 'The campus map feature is really helpful btw. Found the medical center easily', timestamp: minsAgo(600) },
      { sender: u(0), message: 'Agreed! The whole app is super useful. Shoutout to the devs 👏', timestamp: minsAgo(595) },
      { sender: u(4), message: 'ML Workshop tomorrow at 2 PM in Lab 201. Don\'t miss it!', timestamp: minsAgo(480) },
      { sender: u(5), message: 'Is it beginner friendly?', timestamp: minsAgo(475) },
      { sender: u(4), message: 'Yes, totally! No prior experience needed', timestamp: minsAgo(470) },
      { sender: u(3), message: 'Registered! See you all there 🤖', timestamp: minsAgo(465) },
      { sender: u(1), message: 'Someone found my ID and posted it on Lost & Found! KampusKart is amazing 🙌', timestamp: minsAgo(300) },
      { sender: u(2), message: 'That\'s awesome! Glad it worked out', timestamp: minsAgo(295) },
      { sender: u(0), message: 'Good morning everyone! Sports Day is ongoing today. Go cheer for your department! 🏆', timestamp: minsAgo(120) },
      { sender: u(5), message: 'CS department is crushing it in cricket rn 🏏', timestamp: minsAgo(60) },
    ];

    const chats = await Chat.insertMany(dummyChats);
    console.log(`✓ Seeded ${chats.length} chat messages`);

    console.log('\n✅ All dummy data seeded successfully!');
    console.log('\nSummary:');
    console.log(`- Events: ${events.length}`);
    console.log(`- News: ${news.length}`);
    console.log(`- Facilities: ${facilities.length}`);
    console.log(`- Lost & Found Items: ${lostFoundItems.length}`);
    console.log(`- Complaints: ${complaints.length}`);
    console.log(`- Club Recruitments: ${clubs.length}`);
    console.log(`- Chat Messages: ${chats.length}`);

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding data:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

// Run the seed function if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;

