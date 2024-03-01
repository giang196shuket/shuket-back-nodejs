const { getLimitQuery } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { getDataFieldFrom } = require("../../helper/queries");
const { responseSuccess, responseDataList, responseImageBannerCouponList } = require("../../helper/response");
const { generateBannerCodeForMart, removeTypeFileOfName, getSize } = require("../../helper/upload");
const imagesBannerCouponModel = require("../../model/images/bannerCoupon");
const { s3 } = require("../../service/uploadS3");
const moment = require("moment");

module.exports = {

  async getImages(req, res, next) {
    let { page, limit, orderBy,  status,  imageType,  imageCategory,  keywordType,  keywordValue } = req.body;

    console.log(page, limit)
    if(!page){
        page = 1
    }
    if(!limit){
      limit = 10
    }
    if(limit > 100){
      limit = 10
    }
    
    if(orderBy && (orderBy != 'newest' && orderBy != 'oldest')){
        //newest: sort by desc
        //oldest: sort by asc
        return null
    }

    if(imageType && (imageType != 'B' && imageType != 'C')){
        //B: BANNER
        //C: COUPON
        return null
    }
    let limitQuery = getLimitQuery(page, limit)
    const listData = await imagesBannerCouponModel.getImages(limitQuery, orderBy, status, imageType, imageCategory, keywordType, keywordValue)
    const cateData = await imagesBannerCouponModel.getCateListData()

    let jsonResponseData = []
    for await (const val of listData) {
        let typeImage = ""
        let typeImageEN = ""

        if(val.CI_TYPE == 'B'){
            //banner
            typeImage = "배너"
            typeImageEN = "Banner"
        }
        if(val.CI_TYPE == 'C'){
            //coupon
            typeImage = "쿠폰"
            typeImageEN = "Coupon"
        }
        jsonResponseData.push({
            typeImage : typeImage,
            typeImageEN : typeImageEN,
           ...responseImageBannerCouponList(val)
        })
    }
    const responseData = {
      ...responseDataList(page, limit, listData.total, jsonResponseData),
      cateImagesList: cateData
    }
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, responseData));
  },

  
  async addImages(req, res, next) {
    if (req.multerError) {
        return res
        .status(500)
        .json(responseErrorInput(req.multerError));
    }
    const {bnr_status, bnr_status_logic, image_cate, image_type, is_set_mart } = req.body
    const user = req.userInfo

    console.log(' req.body',  req.body)
    console.log(' req.files',  req.files)

    let autoSetMart = 0 
    let fieldName = ""
    let type = ""
    if(image_type == 'B'){
        fieldName = 'banner'
        type = "basic"
        if(is_set_mart && is_set_mart === 'A'){
            autoSetMart = 1
        }
    }
    if(image_type == 'C'){
        fieldName = 'coupon'
        type = "image"
    }
    const listMart = await getDataFieldFrom('M_MOA_CODE','TBL_MOA_MART_BASIC' )


      for  (const file of req.files) {
        const path = image_type === 'B' ? "mart/banner/basic/" : 'mart/coupon/'
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: path + file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
        await s3.upload(params).promise();
        s3.upload(params, async (error, data) => {
          if (error) {
            return res
              .status(500)
              .json(responseErrorInput( error));
          } else{
            console.log('data',data.Location)
            const resultInsert = await imagesBannerCouponModel.addImageBannerCoupon(image_type,image_cate,removeTypeFileOfName(file.originalname), data.Location,file.originalname,bnr_status, user.user_id)
            if(resultInsert && listMart.length > 0 && autoSetMart > 0){
                // tự động gán banner này cho tất cả mart nếu thỏa diều kiện
              const dimension = await getSize(file.buffer)
              await imagesBannerCouponModel.addImageBannerCouponForMart(listMart, image_cate,removeTypeFileOfName(file.originalname), data.Location, dimension.width, dimension.height,'A', bnr_status ,user.user_id )
                
            }
        }
        });
      }
  
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, messageSuccess.Success));
  },
  async getCatesImages(req, res, next) {
    const cateList = await imagesBannerCouponModel.getCateListData()
    const responseData = {
      cate_images_list: cateList
    }
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success,responseData));
  },
  async updateBannerStatusImgs(req, res, next) {
    let { code, status } = req.body;
    const time = moment().format("YYYY-MM-DD HH:mm:ss");
     await queriesHelper.updateTableWhere(
      "TBL_MOA_IMAGES_COMMON",
      ` CI_STATUS = '${status}', M_ID = '${req.userInfo.user_id}',
          M_TIME = '${time}'`,
      ` SEQ = '${code}' `
    );
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, messageSuccess.updateSuccess));
  },
};
