const { bucketImage } = require("../../../helper/const");
const templateViewSeventModel = require("../../../model/appBuilder/teamplate/seven");
const { loadImageAws } = require("../../../service/loadImage");
const { getCommonDestJsonData, getCommonImageJsonData } = require("../common");

module.exports = {
    async composeTypeSevenTemplateData(templateData, martId, dbConnect) {
      let countIndex = 0 
      let templateDataArray = []
      for (const val of templateData?.tmpl_data) {
        if ("tmpl_dt_cd" in val && val.tmpl_dt_cd) {
         const actualData = await templateViewSeventModel.getTypeSevenData(val.tmpl_dt_cd, val.tmpl_dt_dest_flg, martId, dbConnect );
         //tmpl_dt_cd: screenCode,  tmpl_dt_dest_flg: categoryType
         if(actualData){
            let destinateTarget  = 'PCL' //LARGE
            if(actualData.T_CATE_TYPE === 'S'){
                destinateTarget = 'PCS' //SUB
            }

            if(actualData.T_CATE_IMG_USE === 'C' && actualData.T_CATE_IMG_CV){
                templateDataArray.push({
                    contentsID: actualData.T_CATE_CODE,
                    cateName: actualData.P_CAT,
                    imageUseFlg: 'Y',
                    imageUrl : getCommonImageJsonData(1, await loadImageAws(actualData.T_CATE_IMG_CV, bucketImage.banner, null, actualData.T_CATE_IMG_WD, actualData.T_CATE_IMG_HT)),
                    haveImage : 1,
                    colorCate : countIndex % 2 ? "#ffd961" : "#f79366"
                })
            }else{
                templateDataArray.push({
                    contentsID: actualData.T_CATE_CODE,
                    cateName: actualData.P_CAT,
                    imageUseFlg: 'N',
                    imageUrl : null,
                    haveImage : 0,
                    colorCate : countIndex % 2 ? "#ffd961" : "#f79366"
                })
            }
            countIndex++
         }
        }
        
      }
      return {
        typeCode: 7,
        contentsCount : countIndex,
        constentsTitle : '카테고리',
        contentsData: templateDataArray
      }
    }
}