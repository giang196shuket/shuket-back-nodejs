const { bucketImage } = require("../../../helper/const");
const templateViewOneModel = require("../../../model/appBuilder/teamplate/one");
const { loadImageAws } = require("../../../service/loadImage");

module.exports = {
  async composeTypeFiveteenTemplateData(templateData, martId) {
    let typeTitle = "";
    let templateDataArr = {
        img_banner: "https://s3.ap-northeast-2.amazonaws.com/moa.images/banner/basic/banner_template_coupon.png",
        img_width: "1080",
        img_height: "320",
    }
    if (templateData?.tmpl_data.title) {
      typeTitle = templateData?.tmpl_data.title;
    }else{
        typeTitle = "바코드"
    }

    let countIndex = 1
    for await(const val of templateData?.tmpl_data) {
        if ("tmpl_dt_cd" in val && val.tmpl_dt_cd) {
          const actualData = await templateViewOneModel.getTypeOneData(val.tmpl_dt_cd, martId)
          if(actualData){
            const wordValueBanner = '/banner/basic/'
            const resultCheckBanner = actualData.T_BNR_IMAGE.toLowerCase().indexOf(wordValueBanner.toLowerCase());
            if(resultCheckBanner != false){

                templateDataArr = {
                    img_banner : actualData.T_BNR_IMAGE,
                    img_width :  actualData.T_BNR_IMAGE_WD,
                    img_height : actualData.T_BNR_IMAGE_HT
                }
            }else{
                templateDataArr = {
                    img_banner :  await loadImageAws(actualData.T_BNR_IMAGE, bucketImage.banner),
                    img_width :  actualData.T_BNR_IMAGE_WD,
                    img_height :actualData.T_BNR_IMAGE_HT
                }
            }
          }
        }
    }
    return {
        typeCode: 15,
        contentsCount:countIndex,
        contentsTitle: typeTitle,
        contentsData: templateDataArr
    }
  },
};
