const axios = require("axios");
const { LINK_KAKAO_XY, LINK_KAKAO_DETAIL } = require("../../helper/link");
const { messageError, messageSuccess } = require("../../helper/message");
const { responseSuccess, responseErrorData } = require("../../helper/response");
const { generateArray, getLimitQuery } = require("../../helper/funtion");
const addressModel = require("../../model/delivery/area");
const queriesHelper = require("../../helper/queries");
const moment = require("moment")

async function getAddresDetailChild (addr){

  return await axios
          .get(
            `${LINK_KAKAO_DETAIL}?x=${addr.x}&y=${addr.y}&input_coord=WGS84`,
            {
              headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` },
            }
          )
          .then((res) => {
              return res.data.documents.map((ad) => ({
              ADDRESS_X: addr.x,
              ADDRESS_Y: addr.y,
              PLACE_NAME: addr.place_name,
              PLACE_URL: addr.place_url,
              ADDRESS_NAME: ad.address.address_name,
              ADDRESS_NAME2: ad.road_address.address_name,
              BUILDING_NAME: ad.road_address.building_name,
              MAIN_BUILDING_NO: ad.road_address.main_building_no,
              PROVINCE: ad.road_address.region_1depth_name,
              CITY: ad.road_address.region_2depth_name,
              WARD: ad.road_address.region_3depth_name,
              ROAD_NAME: ad.road_address.road_name,
              SUB_BUILDING_NO: ad.road_address.sub_building_no,
              ZONE_NO: ad.road_address.zone_no,
              MAP_KAKAO_ID: addr.id,
              id: addr.id, // cho FE xài cái checkbox

            }))
          })
          .catch((error) => {
            console.error("Error making API child request:", error.message);
          })
      

}



async function fetchAddresDetailChild(listDataSub) {
  console.time('child')

  const promises = listDataSub.map((addr) => getAddresDetailChild(addr));
  const results = await axios.all(promises);
  console.timeEnd('child')

  return results;
}

async function getAddresDetail (addressName, totalPage, pageSize){
    let data = []
    const arrTotalPage = generateArray(totalPage)
    for await(const i of arrTotalPage) {
        data.push(await axios
          .get(
            `${LINK_KAKAO_XY}?query=${addressName}&page=${i}&size=${pageSize}`,
            {
              headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` },
            }
          )
          .then((res) => {
              return res.data.documents.map((ad) => ({
              x: ad.x,
              y: ad.y,
              place_name: ad.place_name,
              place_url: ad.place_url,
              id: ad.id,
            }))
          })
          .catch((error) => {
            console.error("Error making API sub request:", error.message);
          }))
      }
      return data.flat()
}
module.exports = {

  async checkAddress(req, res, next) {
    let totalPage = 0 
    const {address_name , pageNumber, pageSize} = req.body
    const main = await axios
      .get(`${LINK_KAKAO_XY}?query=${address_name}"&page=${pageNumber}&size=${pageSize}"`, {
        headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` },
      })
      .then(async (response) => {
        totalPage =response.data.meta.pageable_count

        console.time('sub')
        const listDataSub = await getAddresDetail(address_name, totalPage, pageSize)
        console.timeEnd('sub')

        return await fetchAddresDetailChild(listDataSub)

      })
      .catch((error) => {
        console.error("Error making API main request:", error.message);
      });

      const result = main.flat().filter((item) => item !== undefined)
      const responseData = {
        total_count : result.length,
        data_list_full :result
      }
      return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, responseData));
  
  },

  async getMartDeliveryAddressList(req, res, next){
    const { page , per_page, keyword_type, keyword_value} = req.query
    const limitQuery = getLimitQuery(page, per_page)
    const rowsList = await addressModel.getMartDeliveryAddressList(limitQuery, keyword_type, keyword_value, req.userInfo.u_martid )

    let normalDeliveryAmount = 2000
    let quickDeliveryAmount = 5000
    let normalDeliveryTime = 100
    let quickDeliveryTime = 60
    let optionUse = 1
    let useQuickDelivery = 0
    let list = []
    let i = 0
 
    const dataAmountTime = await addressModel.getAmountAndTimeDeliveryOfMart( req.userInfo.u_martid)
    if(dataAmountTime){
      if(dataAmountTime.DEFAULT_NORMAL_DELIVERY){
        normalDeliveryAmount = dataAmountTime.DEFAULT_NORMAL_DELIVERY
      }
      if(dataAmountTime.DEFAULT_QUICK_DELIVERY){
        quickDeliveryAmount = dataAmountTime.DEFAULT_QUICK_DELIVERY
      }
      if(dataAmountTime.IS_QUICK_DELIVERY === 'Y'){
        useQuickDelivery = 1
      }
    }

    for (const row of rowsList) {
      let dataDelivery = []
      if(row.type = "ADMIN"){
          //SD : NORMAL DELIVERY
         dataDelivery = [{
          code: 'SD',
          value_fee: parseInt(normalDeliveryAmount),
          name: "일반",
          class: "row2",
          color: "#34495e",
          value_fee_old: parseInt(normalDeliveryAmount),
          value_time: parseInt(normalDeliveryTime),
          option_use: optionUse
        },
        {
          code: 'QD',
          value_fee: parseInt(quickDeliveryAmount),
          name: "빠른",
          class: "row1",
          color: "#34495e",
          value_fee_old: parseInt(quickDeliveryAmount),
          value_time: parseInt(quickDeliveryTime),
          option_use: optionUse
        }]
     //QD : QUICK DELIVERY

      }else{
         if(row.time_reset){
            if(row.time_reset !== parseInt(dataAmountTime.TIME_SET_DEFAULT_DELIVERY)){
              dataDelivery = JSON.parse(row.delivery_fee)
              let iRun = 0
              dataDelivery.forEach(itemDelivery => {
                if(itemDelivery.code === 'SD' && itemDelivery.value_fee !== parseInt(dataAmountTime.DEFAULT_NORMAL_DELIVERY)){
                  //SD : NORMAL DELIVERY
                  dataDelivery[iRun].color = '#e43a45';
                  dataDelivery[iRun].value_fee_old = parseInt(itemDelivery.value_fee)
                }
                if(itemDelivery.code === 'QD' && itemDelivery.value_fee !== parseInt(dataAmountTime.DEFAULT_QUICK_DELIVERY)){
                  //QD : QUICK DELIVERY

                  dataDelivery[iRun].color = '#e43a45';
                  dataDelivery[iRun].value_fee_old = parseInt(itemDelivery.value_fee)
                }
                if(itemDelivery.code === 'SD'){
                  dataDelivery[iRun].name = '일반';
                }
                if(itemDelivery.code === 'QD'){
                  dataDelivery[iRun].name = '빠른';
                }
                dataDelivery[iRun].option_use = itemDelivery.option_use
                iRun++
              });
            }else{
              //SD : NORMAL DELIVERY

              dataDelivery = [{
                code: 'SD',
                value_fee: parseInt(row.DEFAULT_NORMAL_DELIVERY),
                name: "일반",
                class: "row2",
                color: "#34495e",
                value_fee_old: parseInt(row.DEFAULT_NORMAL_DELIVERY),
                value_time: parseInt(normalDeliveryTime),
                option_use: optionUse
              },
              {
                code: 'QD',
                value_fee: parseInt(row.DEFAULT_QUICK_DELIVERY),
                name: "빠른",
                class: "row1",
                color: "#34495e",
                value_fee_old: parseInt(row.DEFAULT_QUICK_DELIVERY),
                value_time: parseInt(quickDeliveryTime),
                option_use: optionUse
              }]
           //QD : QUICK DELIVERY

            }
         }
      }
      let dataDeliveryReturn = JSON.parse(row.delivery_fee)
      dataDeliveryReturn.forEach((itemReturn, key) => {
        dataDeliveryReturn[key].value_fee = parseInt(itemReturn.value_fee)
        dataDeliveryReturn[key].value_time = parseInt(itemReturn.value_time)
        if(itemReturn.code == 'QD'){
          if(useQuickDelivery === 1){
            dataDeliveryReturn[key].option_use = 1
          }else{
            dataDeliveryReturn[key].option_use = 0
          }
        }
      });
      list[i] = {
        id: i + 1,
        seq: row.seq,
        address_name: row.address_name,
        road_address_name: row.road_address_name,
        road_address_name: row.road_address_name,
        region_1depth_name: row.region_1depth_name,
        region_2depth_name: row.region_2depth_name,
        zone_no: row.zone_no,
        delivery_fee:dataDeliveryReturn,
        type: row.type,
        is_edit: 0,
        is_process_edit: 0
      }
      i++
    }

    const  dataResponse = {
      page_index : page,
      page_size: per_page,
      page_count: Math.ceil(rowsList.length / per_page),
      search_count : rowsList.length,
      address_list : list
    }
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success,dataResponse));
  },
  async addMutiAddress (req,res, next){
    const {list_data, list_data_full } = req.body
    //list_data tất cả addres đã chọn 
    //list_data_full danh sách tất cả address

    const listData = await addressModel.getListDeliveryFee()
    const dataAmountAndTime = await addressModel.getAmountAndTimeDeliveryOfMart(req.userInfo.u_martid)
    let useDeliveryFee = 1
    let usFreeDelivery = 1
    let freeDeliveryAmount = 50000
    let isQuickDelivery = 1
    let normalDeliveryAmount =3000
    let quickDeliveryAmount = 5000
    if(dataAmountAndTime){
      if(dataAmountAndTime.IS_QUICK_DELIVERY == 'N' || !dataAmountAndTime.IS_QUICK_DELIVERY){
        isQuickDelivery = 0
      }
      if(dataAmountAndTime.DEFAULT_NORMAL_DELIVERY){
        normalDeliveryAmount = dataAmountAndTime.DEFAULT_NORMAL_DELIVERY
      }
      if(dataAmountAndTime.DEFAULT_QUICK_DELIVERY){
        quickDeliveryAmount = dataAmountAndTime.DEFAULT_QUICK_DELIVERY
      }
    }
    let jsonData = []
    let i = 0
    listData.forEach(item => {
        let classes = "row1"
        let is_use =1
        if(i % 2 ==0){
          classes = "row2"
        }
        if(item.C_CODE == 'SD'){
           //SD : NORMAL DELIVERY
          price = normalDeliveryAmount
          is_use = 1
        }
        if(item.C_CODE == 'QD'){
           //QD : QUICK DELIVERY
          price = quickDeliveryAmount
          is_use = isQuickDelivery
        }
        jsonData.push({
          code: item.C_CODE,
          value_fee: price,
          value_time: parseInt(item.C_ENG),
          name: item.C_DESC,
          class: classes,
          option_use: is_use
       })
       i++
    });
    let insertDataAddress = []
    if(list_data.length !== list_data_full.length){
      //insert từng cái đã chọn 
      for (const itemData of list_data) {
      const isExistData = await addressModel.checkAddressExist(itemData, req.userInfo.u_martid)
      if(isExistData == 0){
        insertDataAddress.push({
          ADDRESS_NAME:  itemData.ADDRESS_NAME,
          ADDRESS_NAME2:  itemData.ADDRESS_NAME2,
          BUILDING_NAME:  itemData.BUILDING_NAME,
          MAIN_BUILDING_NO:  itemData.MAIN_BUILDING_NO,
          PROVINCE:  itemData.PROVINCE,
          CITY:  itemData.CITY,
          WARD:  itemData.WARD,
          ROAD_NAME:  itemData.ROAD_NAME,
          SUB_BUILDING_NO:  itemData.SUB_BUILDING_NO,
          ZONE_NO:  itemData.ZONE_NO,
          ADDRESS_X:  itemData.ADDRESS_X,
          ADDRESS_Y:  itemData.ADDRESS_Y,
          PLACE_URL:  itemData.PLACE_URL,
          MAP_KAKAO_ID:  itemData.MAP_KAKAO_ID,
          SETTING_FEE: JSON.stringify(jsonData),
          STATUS: 'A',
          C_TIME: moment().format('YYYY-MM-DD HH:mm:ss'),
          C_ID: 'SYSTEM',
          M_MOA_CODE: req.userInfo.u_martid
        })
      }
    }

    }else{
      for (const itemData of list_data_full) {
          
        const isExistData = await addressModel.checkAddressExist(itemData, req.userInfo.u_martid)
        if(isExistData == 0){
          insertDataAddress.push({
            ADDRESS_NAME:  itemData.ADDRESS_NAME,
            ADDRESS_NAME2:  itemData.ADDRESS_NAME2,
            BUILDING_NAME:  itemData.BUILDING_NAME,
            MAIN_BUILDING_NO:  itemData.MAIN_BUILDING_NO,
            PROVINCE:  itemData.PROVINCE,
            CITY:  itemData.CITY,
            WARD:  itemData.WARD,
            ROAD_NAME:  itemData.ROAD_NAME,
            SUB_BUILDING_NO:  itemData.SUB_BUILDING_NO,
            ZONE_NO:  itemData.ZONE_NO,
            ADDRESS_X:  itemData.ADDRESS_X,
            ADDRESS_Y:  itemData.ADDRESS_Y,
            PLACE_URL:  itemData.PLACE_URL,
            MAP_KAKAO_ID:  itemData.MAP_KAKAO_ID,
            SETTING_FEE: JSON.stringify(jsonData),
            STATUS: 'A',
            C_TIME: moment().format('YYYY-MM-DD HH:mm:ss'),
            C_ID: 'SYSTEM',
            M_MOA_CODE: req.userInfo.u_martid
          })
        }
      }
      //nếu tất cả list cùng set   //insert tất cả

    }
    if(insertDataAddress.length > 0) {
      const result = await addressModel.insertAddress(insertDataAddress)
      if(result){
        return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, result));
      }else{
        return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, 0));
      }
    }else{
      return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, 0));
    }
  }
};