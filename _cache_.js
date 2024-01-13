const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getCurrentNewYorkTimestamp } = require('./helpers/generalHelper');

///user info cache///////////////////////////////////////////////////////////////
const userMap = new Map();
const getUserInfo = async (token) => {
  try {
    const userInfo = userMap.get(token.uid);
    if (userInfo) {
      return userInfo;
    } else {
      const userInfoFromDb = (await prisma.user.upsert({
        where: { firebaseId: token.uid },
        update: { lastSeen: getCurrentNewYorkTimestamp() },
        create: {
          firebaseId: token.uid,
          email: token.email,
          lastSeen: getCurrentNewYorkTimestamp()
        },
        select: { id: true, lastSeen: true }
      }));
      if (userInfoFromDb) {
        userMap.set(token.uid, userInfoFromDb);
      } else {
        userMap.delete(token.uid);
      }
      return userInfoFromDb;
    }
  } catch (error) {
    console.log(error);
  }
}
const deleteUserInfo = (uid) => {
  userMap.delete(uid);

}
///user info cache///////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////
module.exports = { getUserInfo, deleteUserInfo };
