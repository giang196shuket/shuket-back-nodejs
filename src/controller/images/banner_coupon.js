const { getLimitQuery } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const { getDataFieldFrom } = require("../../helper/queries");
const { responseSuccess } = require("../../helper/response");
const { generateBannerCodeForMart, removeTypeFileOfName, getSize } = require("../../helper/upload");
const imagesBannerCouponModel = require("../../model/images/banner_coupon");
const { s3 } = require("../../service/uploadS3");


module.exports = {

  async getImages(req, res, next) {
    let { page, per_page, filter_order,  filter_status,  image_type,  image_cate,  key_type,  key_value } = req.body;

    console.log(page, per_page)
    if(!page){
        page = 1
    }
    if(!per_page){
        per_page = 10
    }
    if(per_page > 100){
        per_page = 10
    }
    
    if(filter_order && (filter_order != 'RD' && filter_order != 'RA')){
        //RD: sort by desc
        //RA: sort by asc
        return null
    }

    if(image_type && (image_type != 'B' && image_type != 'C')){
        //B: BANNER
        //C: COUPON
        return null
    }
    let limitQuery = getLimitQuery(page, per_page)
    const listData = await imagesBannerCouponModel.getImages(limitQuery, filter_order, filter_status, image_type, image_cate, key_type, key_value)
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
            bnr_code:  val.SEQ,
            bnr_name: val.CI_NAME,
            bnr_type : typeImage,
            bnr_type_en : typeImageEN,
            bnr_cate: val.C_KO,
            bnr_cate_en: val.C_ENG,
            bnr_image: val.CI_URI,
            bnr_file_nm: val.CI_FILE,
            bnr_use_flg: val.CI_STATUS,
            c_time: val.C_TIME,
            c_admin:val.C_ID,
            m_time: val.M_TIME,
            m_admin: val.M_ID,
            type: val.CI_TYPE,
            type_cate: val.CI_THEME,
            type_old: val.CI_TYPE,
            type_cate_old: val.CI_THEME,
            bnr_name_old: val.CI_NAME
        })
    }

    const responseData = {
        cur_page: page,
        cur_per_page: per_page,
        total_list_cnt: listData.length,
        list_data: jsonResponseData,
        cate_images_list: cateData
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
    console.log(req.body)
    const {bnr_status, bnr_status_logic, image_cate, image_type, is_set_mart } = req.body
    const user = req.userInfo
    console.log('user',  user)
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
  }
};
