// Script to create all users in Firebase at once
// Run this ONCE after setting up your Firebase config

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Import your Firebase config
// TODO: Update this path if config.js is not in firebase folder
const firebaseConfig = {
    apiKey: "AIzaSyD86c1ituSkkOGzJtEmdroy1IijSre1FMI",
    authDomain: "itufk-app.firebaseapp.com",
    projectId: "itufk-app",
    storageBucket: "itufk-app.firebasestorage.app",
    messagingSenderId: "1061601948439",
    appId: "1:1061601948439:web:ac16b2d556b8444338bd52",
    measurementId: "G-7PVZ2KEGTY"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// User data with passwords and hashes
const users = [
  { name: 'Afra', passwordHash: '1598276476', password: '671194' },
  { name: 'Ahmet', passwordHash: '1677850066', password: '906364' },
  { name: 'Aylin', passwordHash: '1506110625', password: '307935' },
  { name: 'Berkcan', passwordHash: '1537390187', password: '433829' },
  { name: 'Beyza', passwordHash: '1568785215', password: '563364' },
  { name: 'Burak', passwordHash: '1484002854', password: '279648' },
  { name: 'Ece Nil', passwordHash: '1535475871', password: '411025' },
  { name: 'Ecem', passwordHash: '1540339496', password: '469829' },
  { name: 'Gizem', passwordHash: '1563363071', password: '507308' },
  { name: 'Kuzey', passwordHash: '1625243098', password: '757795' },
  { name: 'Mehmet Alp', passwordHash: '1567805890', password: '551740' },
  { name: 'Meral', passwordHash: '1623217305', password: '731790' },
  { name: 'Mert', passwordHash: '1448730305', password: '103643' },
  { name: 'Poyraz', passwordHash: '1600220519', password: '694976' },
  { name: 'Talha', passwordHash: '1681397113', password: '941560' },
  { name: 'Tuğba', passwordHash: '1685150664', password: '983529' },
  { name: 'Zeynep', passwordHash: '1483789504', password: '272140' }
];

async function createAllUsers() {
  console.log('🚀 Starting user creation...\n');
  
  const createdAt = new Date().toISOString();
  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      const userData = {
        name: user.name,
        passwordHash: user.passwordHash,
        isAdmin: user.name === 'Mert', // Only Mert is admin
        profileImageUrl: '',
        createdAt: createdAt
      };

      const docRef = await addDoc(collection(db, 'users'), userData);
      
      console.log(`✅ ${user.name.padEnd(15)} - Created (Password: ${user.password})`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${user.name.padEnd(15)} - Error:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Summary:`);
  console.log(`   ✅ Successfully created: ${successCount} users`);
  console.log(`   ❌ Failed: ${errorCount} users`);
  console.log('='.repeat(60));
  console.log('\n💡 Next steps:');
  console.log('   1. Check Firebase Console to verify users were created');
  console.log('   2. Share passwords with each person (see password_list.txt)');
  console.log('   3. Delete this script for security (or keep it safe)');
  
  process.exit(0);
}

// Run the script
createAllUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

