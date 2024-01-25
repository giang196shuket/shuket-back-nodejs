const moment = require("moment");
const templateViewTwoModel = require("../../../model/appBuilder/teamplate/two");
const { loadImageAws } = require("../../../service/loadImage");
const { LINK_EVENT_IMAGE } = require("../../../helper/link");
const { getCommonImageJsonData } = require("../common");
const { bucketImage } = require("../../../helper/const");

module.exports = {
   async composeTypeTwoTemplateData (templateData, martId){
     const today = moment().format('YYYY-MM-DD HH:mm:ss')
     let typeTitle = ""
     let templateDataArr = []
     let iRun = 0
     let activeClass = ""
     if(templateData.tmpl_type === 'BG'){
        //blog
        typeTitle = '블로그'
        for await (const val of templateData?.tmpl_data) {
            if ("tmpl_dt_cd" in val && val.tmpl_dt_cd) {
                if(iRun === 0){
                    activeClass = 'active'
                }else{
                    activeClass =''
                }
                const actualData = await templateViewTwoModel.getBlogDetailData(val.tmpl_dt_cd, martId)
                if(actualData){
                    const description = actualData.B_CONT
                    templateDataArr.push({
                        contentsID : actualData.B_CODE,
                        contentsTitle: moment(actualData.C_TIME).format('DD-MM-YYYY'),
                        contentsDescription: description,
                        imageUrl: getCommonImageJsonData(1, loadImageAws(actualData.B_IMG_CV,bucketImage.notice),null, null , null),
                        index_position: iRun,
                        class : activeClass
                    })
                }
            }
            iRun++ 
        }
      
     }else if (templateData.tmpl_type ==='EV'){
        //event
         typeTitle = '이벤트'
        let activeClass = ''
        for await (const val of templateData?.tmpl_data) {
            if ("tmpl_dt_cd" in val && val.tmpl_dt_cd) {
                if(iRun === 0){
                    activeClass = 'active'
                }else{
                    activeClass =''
                }
                const actualData = await templateViewTwoModel.getEventDetailData(val.tmpl_dt_cd, martId)
                if(actualData){
                    const description = actualData.E_DESC
                    templateDataArr.push({
                        contentsID : actualData.E_CODE,
                        contentsTitle: actualData.E_TITLE,
                        contentsDescription: description,
                        imageUrl: LINK_EVENT_IMAGE + actualData.E_IMG_CV,
                        index_position: iRun,
                        class : activeClass
                    })
                }
            }
            iRun++ 
        }

     }
     return {
        typeCode: 2,
        contentsTitle : typeTitle,
        contentsData: templateDataArr,
        data_count: templateDataArr.length
     }
   }
}