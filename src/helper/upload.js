const imageSize = require("image-size");
const moment = require("moment");

function getRandomNumber() {
    return Math.floor(Math.random() * 9000) + 1000;
  }

const getSize = async (buffer) => {
    return  imageSize(buffer)

};

const getNameMartLogo = () =>{
   return 'mr-logo-' + new Date().getTime().toString().slice(0, 10) + "-" + getRandomNumber()
}
const removeTypeFileOfName = (imageName) =>{
  return imageName.substring(0, imageName.lastIndexOf('.'));
}
const generateBannerCodeForMart = () =>{
 return 'BN' + moment().format('YY')+ generateRandomString()
}
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 16; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}
module.exports = { getSize, getNameMartLogo, removeTypeFileOfName ,generateBannerCodeForMart};
