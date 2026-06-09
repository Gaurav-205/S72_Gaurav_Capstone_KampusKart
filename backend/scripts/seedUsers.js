const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kampuskart';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for user seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const firstNamesMale = [
  'Aarav',
  'Kabir',
  'Vivaan',
  'Aditya',
  'Vihaan',
  'Arjun',
  'Sai',
  'Reyansh',
  'Aaryan',
  'Krishna',
  'Ishan',
  'Shaurya',
  'Atharv',
  'Aayush',
  'Rudra',
  'Dev',
  'Kian',
  'Rohit',
  'Rahul',
  'Abhishek',
  'Gaurav',
  'Yash',
  'Aryan',
  'Manish',
  'Akash',
  'Sanjay',
  'Vijay',
  'Ramesh',
  'Suresh',
  'Alok',
  'Amit',
  'Ankit',
  'Deepak',
  'Nitin',
  'Sameer',
  'Sandeep',
  'Sunil',
  'Anil',
  'Ajay',
  'Kunal',
  'Rakesh',
  'Vikram',
  'Harish',
  'Kartik',
  'Praveen',
  'Saurabh',
  'Vivek',
  'Anand',
  'Rohan',
  'Chetan',
  'Dinesh',
  'Madhav',
  'Pranav',
  'Rishabh',
  'Siddharth',
  'Varun',
  'Tushar',
  'Mayank',
  'Harsh',
  'Mohit',
  'Nikhil',
  'Piyush',
  'Shreyas',
  'Utkarsh',
  'Vaibhav',
  'Ayush',
  'Sandeep',
  'Jiten',
  'Girish',
  'Kamal',
  'Manpreet',
  'Gurdev',
  'Inder',
  'Ranjeet',
  'Sarabjit',
  'Jaswinder',
];

const firstNamesFemale = [
  'Aadhya',
  'Diya',
  'Ananya',
  'Kiara',
  'Navya',
  'Saanvi',
  'Zara',
  'Pari',
  'Ishanvi',
  'Aaradhya',
  'Aanya',
  'Ahana',
  'Riya',
  'Sneha',
  'Priya',
  'Puja',
  'Kavita',
  'Sunita',
  'Geeta',
  'Anita',
  'Preeti',
  'Neha',
  'Shilpa',
  'Divya',
  'Meera',
  'Radha',
  'Shruti',
  'Swati',
  'Jyoti',
  'Kiran',
  'Mansi',
  'Poonam',
  'Ritu',
  'Sakshi',
  'Shalini',
  'Sonali',
  'Tanvi',
  'Payal',
  'Komal',
  'Kajol',
  'Karishma',
  'Kareena',
  'Deepika',
  'Priyanka',
  'Anushka',
  'Alia',
  'Katrina',
  'Shraddha',
  'Sonam',
  'Ishita',
  'Kriti',
  'Nisha',
  'Riddhi',
  'Siddhi',
  'Kavya',
  'Aditi',
  'Prisha',
  'Rhea',
  'Asha',
  'Megha',
  'Pooja',
  'Garima',
  'Sweta',
  'Bhavna',
  'Rashmi',
  'Kiran',
  'Sheela',
  'Kusum',
  'Lata',
];

const lastNames = [
  'Sharma',
  'Patel',
  'Verma',
  'Gupta',
  'Singh',
  'Kumar',
  'Joshi',
  'Mehta',
  'Shah',
  'Reddy',
  'Nair',
  'Pillai',
  'Iyer',
  'Iyengar',
  'Rao',
  'Kulkarni',
  'Deshpande',
  'Patil',
  'More',
  'Shinde',
  'Yadav',
  'Choudhary',
  'Prasad',
  'Sen',
  'Bose',
  'Chatterjee',
  'Mukherjee',
  'Banerjee',
  'Das',
  'Ghose',
  'Roy',
  'Dutta',
  'Menon',
  'Gowda',
  'Bhat',
  'Shenoy',
  'Prabhu',
  'Kamath',
  'Pai',
  'Hegde',
  'Mishra',
  'Trivedi',
  'Pandey',
  'Dixit',
  'Chawla',
  'Kapoor',
  'Malhotra',
  'Sari',
  'Gill',
  'Dhillon',
  'Bansal',
  'Agarwal',
  'Goel',
  'Mahajan',
  'Sethi',
  'Anand',
  'Bhardwaj',
  'Dubey',
  'Tripathi',
  'Pande',
  'Chakraborty',
  'Jha',
  'Thakur',
  'Naidu',
  'Shetty',
  'Pawar',
];

const majors = [
  'Computer Science',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Communication',
  'Electrical Engineering',
  'Business Administration',
  'Finance',
  'Marketing',
  'Product Design',
  'Communication Design',
  'Fine Arts',
  'Animation',
  'Aerospace Engineering',
];

const programs = ['B.Tech', 'M.Tech', 'MBA', 'BBA', 'B.Des', 'M.Des', 'BFA', 'B.Sc', 'M.Sc'];

const yearsOfStudy = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// Profile picture templates
const maleAvatars = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop',
];

const femaleAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateUsers = async (count = 300) => {
  const users = [];
  const emailsUsed = new Set();

  // Retrieve existing users to avoid email conflicts
  const existingUsers = await User.find({}, 'email');
  existingUsers.forEach((u) => emailsUsed.add(u.email.toLowerCase()));

  console.log(`Retrieved ${emailsUsed.size} existing emails to avoid duplicates.`);

  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = isMale
      ? getRandomElement(firstNamesMale)
      : getRandomElement(firstNamesFemale);
    const lastName = getRandomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;

    // Generate clean email
    let baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    let email = `${baseEmail}@mitadt.edu`;
    let suffix = 1;

    // De-duplicate email
    while (emailsUsed.has(email)) {
      email = `${baseEmail}${suffix}@mitadt.edu`;
      suffix++;
    }
    emailsUsed.add(email);

    // Random Indian Phone number (+91 followed by 9, 8, or 7 then 9 digits)
    const phonePrefix = getRandomElement(['9', '8', '7']);
    let phoneSuffix = '';
    for (let d = 0; d < 9; d++) {
      phoneSuffix += Math.floor(Math.random() * 10);
    }
    const phone = `+91 ${phonePrefix}${phoneSuffix}`;

    // Profile picture
    const avatarUrl = isMale ? getRandomElement(maleAvatars) : getRandomElement(femaleAvatars);

    // Random birthdate between 1999 and 2006
    const birthYear = 1999 + Math.floor(Math.random() * 8);
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = 1 + Math.floor(Math.random() * 28);
    const dateOfBirth = new Date(birthYear, birthMonth, birthDay);

    users.push({
      name: fullName,
      email: email,
      password: 'Student@1234', // Model pre-save hook will hash this plain text
      phone: phone,
      gender: isMale ? 'Male' : 'Female',
      major: getRandomElement(majors),
      program: getRandomElement(programs),
      yearOfStudy: getRandomElement(yearsOfStudy),
      dateOfBirth: dateOfBirth,
      profilePicture: {
        url: avatarUrl,
        public_id: `avatars/seeded_${i}`,
      },
    });
  }

  return users;
};

const seedUsers = async () => {
  try {
    await connectDB();

    console.log('Generating 300 Indian student records...');
    const dummyUsers = await generateUsers(300);

    console.log(`Generated ${dummyUsers.length} valid profiles. Saving to database...`);

    // Insert users. We run it in chunks or loop to trigger the mongoose pre-save hook (which handles hashing).
    let seededCount = 0;
    const batchSize = 50;

    for (let i = 0; i < dummyUsers.length; i += batchSize) {
      const batch = dummyUsers.slice(i, i + batchSize);
      // User.create accepts an array of documents and returns them, executing hook per doc.
      const savedDocs = await User.create(batch);
      seededCount += savedDocs.length;
      console.log(`✓ Seeded progress: ${seededCount}/${dummyUsers.length} students...`);
    }

    console.log(`\n✅ Successfully seeded ${seededCount} Indian student users into the database!`);
    console.log('All student passwords are set to "Student@1234"');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
