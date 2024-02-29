const { configAws } = require("../../config/image_aws");
const axios = require("axios");
const isImageURL = require("image-url-validator").default;

module.exports = {
  async loadImageAws(images, config_name, code) {
    if (!images || !config_name) return "";

    const configs = configAws.upload;

    let imageURL = `${configs.s3_domain}/${configs.s3_bucket}/${config_name}/${images}`;

    async function checkImageURL(url) {
      const isValidImage = await isImageURL(url);
      if (isValidImage) {
        // console.log("URL hình ảnh hợp lệ và tồn tại.");
        return true;
      } else {
        // console.log("URL không phải là hình ảnh hợp lệ.");
        return false;
      }
    }

    const result = await checkImageURL(imageURL);
    if (result) {
      return { logo :imageURL, code : code };
    } else {
      return  { logo :`${configs.s3_domain_nodejs}/${config_name}/${images}`, code : code };
    }
  },
  
  loadImageAwsProduct(images, config_name, image_key = "", no_image = true) {
    return { thumb: images.items[0].value };
  },
  loadNoImage() {
    const configs = configAws.upload;
    return `${configs.s3_domain}/${configs.s3_bucket}/no-image.jpg`;
  },
};
