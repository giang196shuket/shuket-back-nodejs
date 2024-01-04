const { configAws } = require("../../config/image_aws");

module.exports = {
  async loadImageAws(images, config_name, image_key = "", no_image = true) {
    if (!images || !config_name) return "";

    const configs = configAws.upload;


    const result = `${configs.s3_domain}/${configs.s3_bucket}/${config_name}/${images}`;
 
    return result;
  },
};
