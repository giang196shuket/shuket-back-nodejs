const queriesHelper = require("../../../helper/queries");
const templateViewEightModel = require("../../../model/appBuilder/teamplate/eight");
const { getCommonDestJsonData } = require("../common");
function getPrdImagesObjectByType(prdImages, type, cnt) {
    return {
      urlType: cnt,
      url: prdImages[0]?.items[0].value,
      thumbNailUrl: null,
      width: null,
      height: null,
    };
  }
  function getProductPrice(
    retailPrice,
    salePrice,
    saleTitle,
    priceType,
    priceUpDown,
    priceNumber,
    priceCustomStatus
  ) {
    let priceShow = 0;
    let result = {};
    if (priceType && priceCustomStatus && priceCustomStatus == "A") {
      if (priceUpDown) {
        if (priceType === "PC") {
          //PERCENT
          if (priceUpDown === "U") {
            //up
            if (salePrice && salePrice > 0) {
              priceShow = salePrice + parseInt((salePrice / 100) * priceNumber);
            } else {
              priceShow = retailPrice + parseInt((retailPrice / 100) * priceNumber);
            }
          }
          if (priceUpDown === "D") {
            //down
            if (salePrice && salePrice > 0) {
              priceShow = salePrice - parseInt((salePrice / 100) * priceNumber);
            } else {
              priceShow = retailPrice - parseInt((retailPrice / 100) * priceNumber);
            }
          }
        }
        if (priceType === "AM") {
          //AMOUNT
          if (priceUpDown === "U") {
            //up
            if (salePrice && salePrice > 0) {
              priceShow = salePrice + priceNumber;
            } else {
              priceShow = retailPrice + priceNumber;
            }
          }
          if (priceUpDown === "D") {
            //down
            if (salePrice && salePrice > 0) {
              priceShow = salePrice - priceNumber;
            } else {
              priceShow = retailPrice - priceNumber;
            }
          }
        }
      }
      result.prdPrice = priceShow;
      result.oldPrice = 0;
      result.percentDiscount = 0;
    } else {
      if (salePrice && retailPrice > salePrice) {
        result.prdPrice = salePrice;
        result.oldPrice = retailPrice;
        result.percentDiscount = Math.round(
          100 - (salePrice / retailPrice) * 100
        );
      } else {
        result.prdPrice = retailPrice;
        result.oldPrice = 0;
        result.percentDiscount = 0;
      }
    }
    return result;
  }
async function getCommonPrdJsonData(prdCode, prdName, prdBCode, martId, dataConnect) {
  
    const actualData = await templateViewEightModel.getProductTemplateData(
      prdCode,
      prdName,
      prdBCode,
      martId,
      dataConnect.M_POS_REGCODE,
      dataConnect.M_DB_CONNECT
    );
    if (!actualData) {
      return null;
    }
    const prdImages = JSON.parse(actualData.P_IMG);
    const prdImagePath = getPrdImagesObjectByType(prdImages, "thumb", 1);
    const prdPrice = getProductPrice(
      actualData.P_LIST_PRICE,
      actualData.P_SALE_PRICE,
      actualData.P_SALE_TITLE,
      actualData?.PRICE_TYPE,
      actualData?.PRICE_UP_DOWN,
      actualData?.PRICE_NUMBER,
      actualData?.PRICE_CUSTOM_STATUS
    );
    console.log('prdPrice', prdPrice)
    let productName = "";
    if (!actualData.P_NAME) {
      productName = "NON NAME PRD";
    } else {
      productName = actualData.P_NAME;
    }
    let outOfStock = 0;
    let isUsingStock = 0;
  
    const checkUsingStock = await queriesHelper.getRowDataWhere(
      "TBL_MOA_MART_CONFIG",
      `M_MOA_CODE = '${martId}'`
    );
    if (checkUsingStock.IS_STOCK) {
      if (checkUsingStock.IS_STOCK === "Y") {
        //dùng stock
        if (checkUsingStock.IS_STOP_STOCK === "Y") {
          isUsingStock = 0;
          //dùng stock nhưng tạm ngưng
        } else {
          //dùng stock
          isUsingStock = 1;
        }
      } else {
        //ko dùng stock
        isUsingStock = 0;
      }
    }
    if (isUsingStock === 1) {
      resultPCode = await templateViewEightModel.getProductStock(
        prdCode,
        prdBCode,
        martId,
        dataConnect.M_DB_CONNECT
      );
      if (!resultPCode.P_CODE) {
        outOfStock = 0;
      } else if (
        resultPCode.P_INV_TYPE > 0 ||
        (!resultPCode.P_INV_TYPE && resultPCode.G_INV_TYPE > 0)
      ) {
        if (resultPCode.STK_STOCK > resultPCode.P_MIN_STOCK) {
          // số hàng tồn kho lớn hơn số hàng tồn kho tối thiểu => còn hàng
          outOfStock = 0;
        } else {
          //hết hàng
          outOfStock = 1;
        }
      } else {
        //còn hàng
        outOfStock = 0;
      }
    } else {
      //ko dùng stock => luôn luôn còn hàng
      outOfStock = 0;
    }
    let isHide = 1;
    if (actualData.P_LIST_PRICE && actualData.P_LIST_PRICE > 0) {
      isHide = 0;
    }
    return {
      contentsID:
        actualData.P_CODE + "|" + actualData.P_NAME + "|" + actualData.P_BARCODE,
      productName: productName,
      productCode: actualData.P_CODE,
      productFullCode:
        actualData.P_CODE + "|" + actualData.P_NAME + "|" + actualData.P_BARCODE,
      productUnit:
        actualData.P_UNIT && actualData.P_UNIT !== "NULL"
          ? actualData.P_UNIT
          : "",
      retailPrice: parseInt(prdPrice.prdPrice),
      discount: prdPrice.percentDiscount,
      originalPrice: prdPrice.oldPrice,
      isoutStock: outOfStock,
      ishide: isHide,
      imageUrl: prdImagePath,
      destination: await getCommonDestJsonData(
        "PD",
        "DT",
        actualData.P_CODE + "|" + actualData.P_NAME + "|" + actualData.P_BARCODE,
        productName,
        martId
      ),
    };
  }
module.exports = {
    async  composeTypeEightTemplateData(templateData, martId, dataConnect) {
        const typeTitle = templateData.tmpl_data.title;
        let templateDataArr = [];
        let countIndex = 0;
        for await (const val of templateData?.tmpl_data.arr_product) {
          const result = await getCommonPrdJsonData(
            val.tmpl_dt_cd,
            val.tmpl_dt_tl,
            val.tmpl_dt_bcd,
            martId, dataConnect
          );
          if (result && result.ishide === 0) {
            templateDataArr.push(result);
            countIndex++;
          }
        }
        if (templateDataArr && templateDataArr.length > 0) {
          return {
            typeCode: 8,
            contentsCount: countIndex,
            contenstTitle: typeTitle,
            contentsData: templateDataArr,
          };
        } else {
          return {
            typeCode: 8,
            contentsCount: countIndex,
            contenstTitle: "",
            contentsData: templateDataArr,
          };
        }
      }
}