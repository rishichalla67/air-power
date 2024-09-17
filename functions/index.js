const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.createUser = functions.https.onCall(function(data, context) {
  // Check if the request is made by an admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create new users.');
  }

  const { email, password, userData } = data;

  return admin.auth().createUser({
    email: email,
    password: password,
  })
  .then(function(userRecord) {
    // Store additional user data in Firestore
    return admin.firestore().collection('users').doc(userRecord.uid).set(userData)
      .then(function() {
        // Send welcome email (implement this part)
        // return sendWelcomeEmail(email, password);
        return { success: true, uid: userRecord.uid };
      });
  })
  .catch(function(error) {
    console.error('Error creating new user:', error);
    throw new functions.https.HttpsError('internal', 'Error creating new user');
  });
});
