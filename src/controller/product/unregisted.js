const { messageSuccess, messageError } = require("../../helper/message");
const { responseSuccess, responseDataList, responseProductUnregisted, responseErrorInput } = require("../../helper/response");
const queriesHelper = require("../../helper/queries");
const productUnregistedModel = require("../../model/product/unregisted");
const { requsetSearchList } = require("../../helper/request");
const { getLimitQuery, generateTag, customArrayImageProduct, convertTagsStringToArray } = require("../../helper/funtion");
const { MartGroupDefault, bucketImage } = require("../../helper/const");
const { loadImageAwsProduct, loadImageAws, loadNoImage } = require("../../service/loadImage");
const moment = require("moment");
const he = require('he');

// const productDetalValidation = async (params) =>{
//   // lặp qua các propertie trong 1 object
//   for (let key in params) {
//       if(key === 'code'){
//         const row = await productUnregistedModel.selectProductsUnregisteredDetail(params)
//         return row
//       }else if (key  === 'seq'){
//         // 
//       }
//   }
// }


const  insertProductInfoMulti = async ( arrProduct ,user, dbConnect ,posRegcode, time, defaultMinStock,
  useMaxBRGN, defaultMaxBRGN, isMaxQuantity, isMinQuantity, minQuantity, maxQuantity ) => {


    let result = 0
    //prdImages, prdTags,  barcode, code, name, 
    for (const val of arrProduct) {
      // custom image for product mới
      const  prdImages = val.images.map((img)=> ({ sv_key : "sv1", items: [{key:"thumb", value: img.thumb}], 
      main: img.main, priority: img.priority}))
      
      //chuyen mang tags => chuoi tags
      const  prdTags = val.tags.reduce((accumulator, currentValue) => accumulator + "#" + currentValue, "");      
      let key = val.code + val.barcode
      // lấy data dữ liệu của product này từ pos để insert cho table shuket
      const rowProduct = await productUnregistedModel.selectProductsToInsert(dbConnect, posRegcode, key)
      console.log('rowProduct', rowProduct)
      // insert product đã đăng ký vào table TBL_MOA_PRD_MAIN
      result = await productUnregistedModel.insertProduct(rowProduct, user.u_martid, user.user_id,
      JSON.stringify(prdImages), prdTags, time, defaultMinStock, useMaxBRGN, defaultMaxBRGN, isMaxQuantity, isMinQuantity,
      minQuantity, maxQuantity)
    }
    return result
}

const  insertProductInfo = async (barcode, code, name, user, dbConnect ,posRegcode,  prdImages, prdTags, time, defaultMinStock,
  useMaxBRGN, defaultMaxBRGN, isMaxQuantity, isMinQuantity, minQuantity, maxQuantity ) => {
    let key = code + barcode

    // lấy data dữ liệu của product này từ pos để insert cho table shuket
    const rowProduct = await productUnregistedModel.selectProductsToInsert(dbConnect, posRegcode, key)
    console.log('rowProduct', rowProduct)
    let result = 0
    // insert product đã đăng ký vào table TBL_MOA_PRD_MAIN
    result = await productUnregistedModel.insertProduct(rowProduct, user.u_martid, user.user_id,
    JSON.stringify(prdImages), prdTags, time, defaultMinStock, useMaxBRGN, defaultMaxBRGN, isMaxQuantity, isMinQuantity,
    minQuantity, maxQuantity)
    return result
}


module.exports = {
  

  async registerProduct(req, res, next) {
    let user = req.userInfo
    let martCode = user.u_martid
    let dbConnect = req.dataConnect.M_DB_CONNECT
    let posRegcode = req.dataConnect.M_POS_REGCODE

    let { barcode, code, name, tags, images} = req.body

    const rowData = await queriesHelper.getRowDataWhere('TBL_MOA_MART_CONFIG' , ` M_MOA_CODE = '${user.u_martid}'`)
    // gán các giá trị stock, minmax cho product được thêm mới theo config của mart 
    let defaultMinStock = 5
    let defaultMaxBRGN = 5
    let useMaxBRGN = 'Y'
    let isMaxQuantity = 'N'
    let isMinQuantity = 'N'
    let minQuantity = 0
    let maxQuantity = 0
    if(rowData.MIN_STOCK_DEFAULT !== ""){
     defaultMinStock = parseInt(rowData.MIN_STOCK_DEFAULT)
    }
    if(!rowData.MAXQTY_BRGN_VALUE){
     defaultMaxBRGN = 5
    }else{
     defaultMaxBRGN = parseInt(rowData.MAXQTY_BRGN_VALUE)
    }
    if(!rowData.USE_MAXQTY_BRGN){
     useMaxBRGN = 'N'
    }else{
     useMaxBRGN = rowData.USE_MAXQTY_BRGN
    }
    if(rowData.USE_MAXQTY_PRODUCT === 'Y'){
     isMaxQuantity = 'Y'
     maxQuantity = parseInt(rowData.MAXQTY_PRODUCT_VALUE)
    }
    if(rowData.USE_MINQTY_PRODUCT === 'Y'){
     isMinQuantity = 'Y'
     minQuantity = parseInt(rowData.MINQTY_PRODUCT_VALUE)
    }

    const time = moment().format('YYYY-MM-DD HH:mm:ss')    

    // custom image for product mới
    const  prdImages = images.map((img)=> ({ sv_key : "sv1", items: [{key:"thumb", value: img.thumb}], 
    main: img.main, priority: img.priority}))
    
    //chuyen mang tags => chuoi tags
    const  prdTags = tags.reduce((accumulator, currentValue) => accumulator + "#" + currentValue, "");

    // insert product đã đăng ký vào table TBL_MOA_PRD_MAIN
    const result = await insertProductInfo( barcode, code, name,  user, dbConnect, posRegcode, prdImages, prdTags, time, defaultMinStock,
      useMaxBRGN, defaultMaxBRGN, isMaxQuantity, isMinQuantity, minQuantity, maxQuantity  )

    if(result === 0){
      //insert thất bại
      return res
      .status(200)
      .json(responseErrorInput(messageError.RegisterFailure));
     }else{
       //insert thành công
      // kiểm tra insert có product nào bị trùng trong table TBL_MOA_PRD_MAIN ko 
      const checkDupResult = await queriesHelper.getRowDataFieldWhereHavingGroupby('COUNT(CONCAT(P_CODE, P_BARCODE)) as G_CODE',
      'TBL_MOA_PRD_MAIN', `M_MOA_CODE= '${martCode}' AND P_STATUS != 'D'`,  'CONCAT(P_CODE, P_BARCODE)', 'COUNT(CONCAT(P_CODE, P_BARCODE)) > 1')
      if(checkDupResult){
         // trùng thì cập nhập các product trùng đó bằng cách set status thành delted
         await productUnregistedModel.updateProductDuplicate(martCode)
      }
    
      // name = he.decode(name)   //thư viện biến các ký tự đặt biệt trong tên là văn bản chứ ko muốn hiểu là phần tử HTML
      // let newParams = { barcode, code, name, posRegcode}
      // const rowDetail =  await productDetalValidation( newParams) // lấy data detail của product vừa đăng ký
      // newParams = { barcode, code, name, martCode}
      // const rowExists = await productUnregistedModel.selectPrdoductRegisteredByCode(newParams) //
      // if(rowExists){
      //   return res
      //   .status(200)
      //   .json(responseErrorInput(messageError.RegisterFailure));
      // }
      //productUnregistedModel.insertProduct() ??

      return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, messageSuccess.registerSuccess));
     }

     
    
  },
  async registerProductMulti(req, res, next) {
    let user = req.userInfo
    let martCode = user.u_martid
    let dbConnect = req.dataConnect.M_DB_CONNECT
    let posRegcode = req.dataConnect.M_POS_REGCODE

    let arrProduct  = req.body

    const rowData = await queriesHelper.getRowDataWhere('TBL_MOA_MART_CONFIG' , ` M_MOA_CODE = '${user.u_martid}'`)
    // gán các giá trị stock, minmax cho product được thêm mới theo config của mart 
    let defaultMinStock = 5
    let defaultMaxBRGN = 5
    let useMaxBRGN = 'Y'
    let isMaxQuantity = 'N'
    let isMinQuantity = 'N'
    let minQuantity = 0
    let maxQuantity = 0
    if(rowData.MIN_STOCK_DEFAULT !== ""){
     defaultMinStock = parseInt(rowData.MIN_STOCK_DEFAULT)
    }
    if(!rowData.MAXQTY_BRGN_VALUE){
     defaultMaxBRGN = 5
    }else{
     defaultMaxBRGN = parseInt(rowData.MAXQTY_BRGN_VALUE)
    }
    if(!rowData.USE_MAXQTY_BRGN){
     useMaxBRGN = 'N'
    }else{
     useMaxBRGN = rowData.USE_MAXQTY_BRGN
    }
    if(rowData.USE_MAXQTY_PRODUCT === 'Y'){
     isMaxQuantity = 'Y'
     maxQuantity = parseInt(rowData.MAXQTY_PRODUCT_VALUE)
    }
    if(rowData.USE_MINQTY_PRODUCT === 'Y'){
     isMinQuantity = 'Y'
     minQuantity = parseInt(rowData.MINQTY_PRODUCT_VALUE)
    }

    const time = moment().format('YYYY-MM-DD HH:mm:ss')    

    // insert product đã đăng ký vào table TBL_MOA_PRD_MAIN
    const result = await insertProductInfoMulti( arrProduct,  user, dbConnect, posRegcode, time, defaultMinStock,
      useMaxBRGN, defaultMaxBRGN, isMaxQuantity, isMinQuantity, minQuantity, maxQuantity  )

    if(result === 0){
      //insert thất bại
      return res
      .status(200)
      .json(responseErrorInput(messageError.RegisterFailure));
     }else{
       //insert thành công
      // kiểm tra insert có product nào bị trùng trong table TBL_MOA_PRD_MAIN ko 
      const checkDupResult = await queriesHelper.getRowDataFieldWhereHavingGroupby('COUNT(CONCAT(P_CODE, P_BARCODE)) as G_CODE',
      'TBL_MOA_PRD_MAIN', `M_MOA_CODE= '${martCode}' AND P_STATUS != 'D'`,  'CONCAT(P_CODE, P_BARCODE)', 'COUNT(CONCAT(P_CODE, P_BARCODE)) > 1')
      if(checkDupResult){
         // trùng thì cập nhập các product trùng đó bằng cách set status thành delted
         await productUnregistedModel.updateProductDuplicate(martCode)
      }

      return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, messageSuccess.registerSuccess));
     }

     
    
  },
  async searchProductUnregisteredList(req, res, next) {
    let params = requsetSearchList(req.body, ['optionSearchImage', 'categorySubCode', 'categoryCode'])
    const user = req.userInfo;

    const rowData = await queriesHelper.getRowDataWhere('TBL_MOA_MART_CONFIG', `M_MOA_CODE = '${user.u_martid}' `)
    let checkGroupImage = 'N'
    if(rowData.IS_GROUP_SYNC_IMAGES !== 'N'){
        checkGroupImage = 'Y'
    }

    const limitQuery = getLimitQuery(params.page, params.limit)
    //get list unregisted
    const result = await productUnregistedModel.selectProductsUnregisteredList(params, req.dataConnect.M_DB_CONNECT, req.dataConnect.M_POS_REGCODE, limitQuery)
    let list = []
    for (const row of result) {
        let isGroupImage = 'N'
        let arrImage = []
        //generate image for product
        if(checkGroupImage === 'Y'){
            if(row.P_IMG){
                arrImage = customArrayImageProduct(row.P_IMG)
            }
        }
       //generate tags for product
       let tags = ""
       if(row.P_CAT === row.P_CAT_SUB){
          tags = generateTag([row.P_CODE, row.BARCODE, row.P_NAME, row.P_CAT, row.P_UNIT, row.P_PROVIDER])
       }else{
         tags = generateTag([row.P_CODE, row.BARCODE, row.P_NAME, row.P_CAT, row.P_CAT_SUB, row.P_UNIT, row.P_PROVIDER])
       }
       list.push({
         images: arrImage ? arrImage :"",
         isGroupImage : isGroupImage,
         noImage : loadNoImage(),
         tags: convertTagsStringToArray(tags),
         ...responseProductUnregisted(row)
       })
    }

    const dataResponse = responseDataList(params.page, params.limit, result.length, list)
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
};
