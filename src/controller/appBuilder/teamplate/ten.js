const { bucketImage } = require("../../../helper/const");
const { stringLimitWords } = require("../../../helper/funtion");
const queriesHelper = require("../../../helper/queries");
const templateViewTenModel = require("../../../model/appBuilder/teamplate/ten");
const { loadImageAws } = require("../../../service/loadImage");

module.exports = {
    async  composeTypeTenTemplateData(templateData, martId, dataConnect) {
        let countIndex = 0;
        let templateDataArr = [];
        for (const val of templateData?.tmpl_data) {
          const actualData = await templateViewTenModel.getTypeTenData(
            val.tmpl_dt_cd,
            val.tmpl_dt_dest_flg,
            martId,
            dataConnect.M_DB_CONNECT
          );
          if (actualData) {
            let destiTarget = "PCL"; //large
            let popupMid = 0;
            let popupMidData = [];
            if (actualData.T_CATE_TYPE === "S") {
              //small
              destiTarget = "PCS";
            } else {
              const dataMidCate = templateViewTenModel.getCateMid(
                actualData.P_CAT_CODE,
                martId,
                dataConnect.M_DB_CONNECT
              );
              if (dataMidCate.length > 0) {
                popupMid = 1;
                popupMidData = dataMidCate;
              }
            }
            if ((actualData.T_CATE_IMG_USE = "C" && actualData.T_CATE_IMG_CV)) {
              templateDataArr.push({
                contentsID: actualData.T_CATE_CODE,
                cateName: stringLimitWords(actualData.P_CAT, 4),
                imageUseFlg: "Y",
                imageUrl:   await loadImageAws(actualData.T_CATE_IMG_CV, bucketImage.banner)
              });
            } else if (
              (actualData.T_CATE_IMG_USE = "D" && actualData.T_CATE_IMG_DATA)
            ) {
              templateDataArr.push({
                contentsID: actualData.T_CATE_CODE,
                cateName: stringLimitWords(actualData.P_CAT, 2),
                imageUseFlg: "Y",
                imageUrl: JSON.parse(actualData.T_CATE_IMG_DATA)?.icon_img,
              });
            } else {
              templateDataArr.push({
                contentsID: actualData.T_CATE_CODE,
                cateName: stringLimitWords(actualData.P_CAT, 2),
                imageUseFlg: "N",
                imageUrl: 1,
              });
            }
            countIndex++;
          }
        }
        const typeDataArr = {
          typeCode: 10,
          contentsCount: countIndex,
          contentsTitle: "카테고리",
          contentsData: templateDataArr,
        };
        return typeDataArr;
      }
}