const { configAws } = require("../../config/image_aws");

module.exports = {
  async loadImageAws(images, config_name, image_key = "", no_image = true) {
    if (!images || !config_name) return "";

    const configs = configAws.upload;

    const result = `${configs.s3_domain}/${configs.s3_bucket}/${config_name}/${images}`;

    return result;
  },
   loadImageAwsProduct(images, config_name, image_key = "", no_image = true) {

    return {thumb: images.items[0].value }
  },
  loadNoImage() {
    const configs = configAws.upload;
    return `${configs.s3_domain}/${configs.s3_bucket}/no-image.jpg`;
  },
};
