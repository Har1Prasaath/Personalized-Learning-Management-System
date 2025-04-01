// backend/Scripts/initializeAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createAdminUser() {
  const adminEmail = 'hariprasaath005@gmail.com'; // Change this
  const user = await admin.auth().getUserByEmail(adminEmail);
  
  await db.collection('users').doc(user.uid).set({
    email: adminEmail,
    role: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  
  console.log('Admin user created successfully');
}

createAdminUser().catch(console.error);