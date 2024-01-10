const imageSize = require("image-size");


function getRandomNumber() {
    return Math.floor(Math.random() * 9000) + 1000;
  }

const getSize = async (buffer) => {
    return  imageSize(buffer)

};

const getNameMartLogo = () =>{
   return 'mr-logo-' + new Date().getTime().toString().slice(0, 10) + "-" + getRandomNumber()

}
module.exports = { getSize, getNameMartLogo };
