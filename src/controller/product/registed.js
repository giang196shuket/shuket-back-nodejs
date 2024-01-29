const logger = require("../../../config/logger");
const { messageError, messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const {
  responseSuccess,
  responseErrorData,
  responseDataList,
} = require("../../helper/response");
const moment = require("moment");
const productRegistedModel = require("../../model/product/registed");
const {
  generateTag,
  arrayColumn,
  arrayColumnAssign,
  customArrayImageProduct,
  customCategoryProduct,
} = require("../../helper/funtion");
const {
  loadImageAws,
  loadNoImage,
  loadImageAwsProduct,
} = require("../../service/loadImage");
const ip = require("ip");
const { bucketImage, typeLog } = require("../../helper/const");
const { requsetSearchListDate } = require("../../helper/request");

module.exports = {
  async searchProductRegisteredList(req, res, next) {
    const logBase = "controlller/product/register.searchProductRegisteredList";
    const user = req.userInfo;
    let willBeRun = 0;
    let timeSync = null;
    let checkUseStock = null;
    // lấy lần sync cuối cùng để kiểm tra update product list
    const dataUser = await queriesHelper.getRowDataWhere(
      "TBL_MOA_USERS_ADMIN",
      `U_MARTID = '${user.u_martid}' AND U_ID = '${user.user_id}'`
    );

    if (!dataUser?.U_LSYNCPRD) {
      willBeRun = 1;
    } else {
      const timeNow = moment();
      if (timeNow > moment(dataUser.U_LSYNCPRD).add("days", 1)) {
        willBeRun = 1;
        timeSync = moment(dataUser.U_LSYNCPRD).add("days", 1);
      }
    }
    //willBeRun == 1 => kiểm tra và sync product thành dữ liệu mới từ pos
    if (willBeRun == 1) {
      // cập nhập thời gian sync
      await queriesHelper.updateTableWhere(
        "TBL_MOA_USERS_ADMIN",
        `U_LSYNCPRD = '${moment().format("YYYY-MM-DD HH:mm:ss")}'`,
        `
       U_ID = '${user.user_id}' AND U_MARTID = '${user.u_martid}'`
      );
      const productsMainPos =
        await productRegistedModel.getProductRegister_Main_Pos(
          req.dataConnect.M_DB_CONNECT,
          user.u_martid
        );
      let dataUpdate = [];

      // tiến hành quá trình gán dữ liệu product mới từ pos cho dữ liệu  product hiện tại
      for (const item of productsMainPos) {
        let isFixImage = 0;
        let isPrice = 0;
        let isName = 0;
        let isUpdate = 0;
        let productImage = JSON.parse(item.P_IMG);
        let dataImage = [];
        if (Array.isArray(productImage) && productImage.length > 0) {
          for (const prdImg of productImage) {
            if (!prdImg.items) {
              isFixImage = 1;
              isUpdate = 1;
            } else {
              dataImage.push(prdImg);
            }
          }
        }
        if (item.PROD_PRICE != item.P_SALE_PRICE) {
          //NẾU PROD_PRICE OF TBL_MOA_PRD_MAIN KHÁC PRICE P_SALE_PRICE OF MART_ORDER_BRGN THÌ PHẢI SYNC PRICE
          isUpdate = 1;
          isPrice = 1;
        }
        if (item.udate_name == 1) {
          //PM.P_NAME KHÁC MOG.GOODS_NAME THÌ PHẢI SYNC NAME
          isUpdate = 1;
          isName = 1;
        }
        let pName = "";
        let pTag = "";
        let pPrice = 0;
        let pImage = [];

        if (isUpdate == 1) {
          if (isName == 1) {
            pName = item.G_NAME;
            pTag = generateTag([item.P_CODE, item.P_BARCODE, item.G_NAME]);
          } else {
            pName = item.G_NAME;
            pTag = generateTag([item.P_CODE, item.P_BARCODE, item.G_NAME]);
          }

          if (isPrice == 1) {
            pPrice = item.P_SALE_PRICE;
          } else {
            pPrice = item.P_SALE_PRICE;
          }

          if (isFixImage == 1) {
            pImage = JSON.stringify(dataImage);
          } else {
            pImage = item.P_IMG;
          }
          dataUpdate.push({
            SEQ: item.SEQ,
            P_NAME: pName,
            P_TAGS: pTag,
            P_IMG: pImage,
            P_SALE_PRICE: pPrice,
            M_TIME: moment().format("YYYY-MM-DD HH:mm:ss"),
            M_ID: "SYSTEM",
          });
        }
      }
      //kết thúc  quá trình gán dữ liệu product mới từ pos cho dữ liệu  product hiện tại
      logger.writeLog("info", `${logBase}: dataUpdate ==> ${dataUpdate}`);

      if (dataUpdate.length > 0) {
        // sync product
        await productRegistedModel.syncProduct(dataUpdate);
      } else {
        // cập nhập lại thời gian sync
        await queriesHelper.updateTableWhere(
          "TBL_MOA_USERS_ADMIN",
          `U_LSYNCPRD = '${moment().format("YYYY-MM-DD HH:mm:ss")}'`,
          `
          U_ID = '${user.user_id}' AND U_MARTID = '${user.u_martid}'`
        );
      }
    }

    let defaultStock = 5; // sẽ cảnh báo khi số lượng product bé hơn hoặc bằng 5
    checkUseStock = await queriesHelper.getRowDataWhere(
      "TBL_MOA_MART_CONFIG",
      `M_MOA_CODE = '${user.u_martid}'`
    );
    let initialStock = 0;
    let isUsingStock = 0;
    if (!checkUseStock.IS_STOCK) {
      initialStock = 0;
      isUsingStock = 0;
    } else {
      if (checkUseStock.IS_STOCK === "Y") {
        // DÙNG STOCK
        initialStock = 1;
        if (checkUseStock.IS_STOP_STOCK === "Y") {
          isUsingStock = 0;
          //DÙNG STOCK NHƯNG TẠM NGƯNG
        } else {
          //DÙNG STOCK
          isUsingStock = 1;
        }
      } else {
        //KO DÙNG STOCK
        initialStock = 0;
        isUsingStock = 0;
      }
      if (checkUseStock.MIN_STOCK_DEFAULT !== "") {
        defaultStock = parseInt(checkUseStock.MIN_STOCK_DEFAULT);
      }
    }
    let params = requsetSearchListDate(req.body, [
      "category_code",
      "category_sub_code",
      "option_check_stock",
      "stock_search_value",
      "sort_prd_stock",
      "product_no_image",
      "product_only_brgn",
      "is_delivery",
    ]);
    page = !params.page ? 1 : params.page;
    limit = !params.limit ? 1 : params.limit;
    const offset = params.page * params.limit - params.limit;
    // lấy list product hiện tại sau khi sync xong
    const dataListProduct = await productRegistedModel.selectProductsRegistered(
      checkUseStock,
      req.dataConnect,
      params.status,
      params,
      offset,
      params.limit
    );

    let isMerge = 0;
    let dataMergeStock = {};
    let dataMergeStockCtime = {};
    let dataMergeStockMtime = {};
    const listPCode = arrayColumn(dataListProduct.rows, "P_CODE");

    if (listPCode.length > 0 && initialStock == 1) {
      //trả ra product nào đang dùng stock
      const dataProductUseStock = await queriesHelper.getListDataFieldWhere(
        "GOODS_CODE AS P_CODE, STK_STOCK, C_TIME, M_TIME",
        "TBL_MOA_STOCK_TOGETHERS",
        ` M_MOA_CODE = '${user.u_martid}' AND GOODS_CODE IN (${listPCode})`
      );
      if (dataProductUseStock.length > 0) {
        isMerge = 1;
        dataMergeStock = arrayColumnAssign(
          dataProductUseStock,
          "STK_STOCK",
          "P_CODE"
        );
        dataMergeStockCtime = arrayColumnAssign(
          dataProductUseStock,
          "C_TIME",
          "P_CODE"
        );
        dataMergeStockMtime = arrayColumnAssign(
          dataProductUseStock,
          "M_TIME",
          "P_CODE"
        );
      }
    }

    let list = [];
    let i = 0;
    let proSettingsMaxMin = "N";
    let showSettingMaxMin = "N";
    for (const row of dataListProduct.rows) {
      let isProStock = 0;
      if (row.P_INV_TYPE > 0 || (!row.P_INV_TYPE && row.G_INV_TYPE > 0)) {
        // dùng stock
        isProStock = 1;
      }
      let priceType = "No";
      let priceUpdown = "No";
      let priceNumber = 0;
      let priceShow = 0;
      // bắt đầu tiến hành gán price mở rộng cho product
      if (row.PRICE_CUSTOM_STATUS === "A") {
        //dùng giá tiền mở rộng
        if (row.PRICE_TYPE) {
          //PRICE_TYPE : AM => AMOUNT, PC: PERCENT
          priceType = row.PRICE_TYPE;
        }
        if (row.PRICE_UP_DOWN) {
          priceUpdown = row.PRICE_UP_DOWN; //  tăng hoặc giảm giá
          if (row.PRICE_TYPE === "PC") {
            //PERCENT
            if (row.PRICE_UP_DOWN === "U") {
              // UP PRICE
              if (row.P_SALE_PRICE && row.P_SALE_PRICE > 0) {
                //P_SALE_PRICE: price đang sale
                // PRICE_NUMBER : giá trị mở rộng
                priceShow =
                  (parseInt(row.P_SALE_PRICE) / 100) *
                    parseInt(row.PRICE_NUMBER) +
                  parseInt(row.P_SALE_PRICE);
              } else {
                //P_LIST_PRICE : price mặc định
                priceShow =
                  (parseInt(row.P_LIST_PRICE) / 100) *
                    parseInt(row.PRICE_NUMBER) +
                  parseInt(row.P_LIST_PRICE);
              }
            }
            if (row.PRICE_UP_DOWN === "D") {
              // DOWN PRICE
              if (row.P_SALE_PRICE && row.P_SALE_PRICE > 0) {
                //P_SALE_PRICE: price đang sale
                // PRICE_NUMBER : giá trị mở rộng
                priceShow =
                  parseInt(row.P_SALE_PRICE) -
                  (parseInt(row.P_SALE_PRICE) / 100) *
                    parseInt(row.PRICE_NUMBER);
              } else {
                //P_LIST_PRICE : price mặc định
                priceShow =
                  parseInt(row.P_LIST_PRICE) -
                  (parseInt(row.P_LIST_PRICE) / 100) *
                    parseInt(row.PRICE_NUMBER);
              }
            }
          }
          if (row.PRICE_TYPE === "AM") {
            // AMOUNT
            if (row.PRICE_UP_DOWN === "U") {
              // UP PRICE
              if (row.P_SALE_PRICE && row.P_SALE_PRICE > 0) {
                //P_SALE_PRICE: price đang sale
                // PRICE_NUMBER : giá trị mở rộng
                priceShow =
                  parseInt(row.P_SALE_PRICE) + parseInt(row.PRICE_NUMBER);
              } else {
                //P_LIST_PRICE : price mặc định
                priceShow =
                  parseInt(row.P_LIST_PRICE) + parseInt(row.PRICE_NUMBER);
              }
            }
            if (row.PRICE_UP_DOWN === "D") {
              // DOWN PRICE
              if (row.P_SALE_PRICE && row.P_SALE_PRICE > 0) {
                //P_SALE_PRICE: price đang sale
                // PRICE_NUMBER : giá trị mở rộng
                priceShow =
                  parseInt(row.P_SALE_PRICE) - parseInt(row.PRICE_NUMBER);
              } else {
                //P_LIST_PRICE : price mặc định
                priceShow =
                  parseInt(row.P_LIST_PRICE) - parseInt(row.PRICE_NUMBER);
              }
            }
          }
        }
        if (row.PRICE_NUMBER) {
          priceNumber = parseInt(row.PRICE_NUMBER);
        }
      }
      //kết thúc tiến hành gán price mở rộng cho product

      //gán giá trị nếu product có dùng max và min quantity khi order

      if (row.P_USE_MAXQTY_PD == "Y" || row.P_USE_MINQTY_PD === "Y") {
        proSettingsMaxMin = "Y";
        showSettingMaxMin = "Y";
      }
      list[i] = {
        seq: row.SEQ,
        moa_code: row.M_MOA_CODE,
        pos_regcode: row.M_POS_REGCODE,
        code: row.P_CODE,
        name: row.P_NAME,
        category: customCategoryProduct(row.P_CAT,row.P_CAT_MID, row.P_CAT_SUB),
        unit: row.P_UNIT,
        barcode: row.P_BARCODE,
        status: row.P_STATUS,
        list_price: row.P_LIST_PRICE,
        provider: row.P_PROVIDER,
        sale_price: row.P_SALE_PRICE,
        sale_percent: Math.round((row.P_SALE_PRICE / row.P_LIST_PRICE) * 10),
        sale_title: row.P_SALE_TITLE,
        sale_src: row.SALE_SRC,
        min_stock: !row.P_MIN_STOCK ? 0 : row.P_MIN_STOCK,
        is_pro_stock: isProStock,
        price_type: priceType,
        price_updown: priceUpdown,
        price_number: priceNumber,
        price_show: Math.round(priceShow),
        is_show_price: row.PRICE_CUSTOM_STATUS,
        is_pro_maxqty: row.P_USE_MAXQTY_PD,
        pro_max_qty: !row.P_VALUE_MAXQTY_PD ? 0 : row.P_VALUE_MAXQTY_PD,
        pro_max_qty_default: !row.P_VALUE_MAXQTY_PD ? 0 : row.P_VALUE_MAXQTY_PD,
        is_pro_minqty: row.P_USE_MINQTY_PD,
        pro_min_qty: !row.P_VALUE_MINQTY_PD ? 0 : row.P_VALUE_MINQTY_PD,
        pro_min_qty_default: !row.P_VALUE_MINQTY_PD ? 0 : row.P_VALUE_MINQTY_PD,
        pro_show_settings_max_min: proSettingsMaxMin,
        use_time: row.USE_TIME,
        images: customArrayImageProduct(row.P_IMG),
        time_start: row.TIME_START
          ? moment(row.TIME_START).format("YYYY-MM-DD")
          : null,
        time_end: row.TIME_END
          ? moment(row.TIME_END).format("YYYY-MM-DD")
          : null,
        tags: row.P_TAGS,
        create_name: row.C_NAME,
        create_time: row.C_TIME,
        update_name: row.M_NAME,
        update_time: row.M_TIME,
      };

      // bắt đầu gán giá trị stock cho product
      if (dataMergeStock[row.P_CODE] && isMerge === 1) {
        list[i].value_stock = dataMergeStock[row.P_CODE];
        if (dataMergeStock[row.P_CODE] > row.P_MIN_STOCK) {
          //P_MIN_STOCK giá trị tối thiểu cảnh báo hết hàng
          // còn hàng
          list[i].is_out_stock = 0;
        } else {
          // hết hàng
          list[i].is_out_stock = 1;
        }
        if (dataMergeStock[row.P_CODE] === row.P_MIN_STOCK) {
          // hết hàng
          list[i].is_out_stock = 1;
        }
        if (dataMergeStockMtime[row.P_CODE] === "") {
          // thời gian sync stock
          const valueDate = dataMergeStockCtime[row.P_CODE];
          list[i].date_sync_stock = moment(valueDate).format("YYYY-MM-DD");
          list[i].time_sync_stock = moment(valueDate).format("HH:mm:ss");
        } else if (
          moment(dataMergeStockMtime[row.P_CODE]).isSameOrAfter(
            moment(dataMergeStockCtime[row.P_CODE])
          )
        ) {
          // thời gian sync stock
          const valueDate = dataMergeStockMtime[row.P_CODE];
          list[i].date_sync_stock = moment(valueDate).format("YYYY-MM-DD");
          list[i].time_sync_stock = moment(valueDate).format("HH:mm:ss");
        }
      } else {
        list[i].value_stock = 0;
        if (list[i].value_stock > row.P_MIN_STOCK) {
          list[i].is_out_stock = 0;
        } else {
          // hết hàng
          list[i].is_out_stock = 1;
        }
        if (list[i].value_stock === row.P_MIN_STOCK) {
          // hết hàng
          list[i].is_out_stock = 1;
        }
        list[i].date_sync_stock = "-/-";
        list[i].time_sync_stock = "-/-";
      }
      i++;
    }
    const checkUseMaxQty = await queriesHelper.getRowDataWhere(
      "TBL_MOA_MART_CONFIG",
      ` M_MOA_CODE = '${user.u_martid}'`
    );

    let dataResponse = {
      ...responseDataList(page, limit, dataListProduct.search_count, list),
      default_stock: defaultStock,
      is_using_maxqty: checkUseMaxQty.USE_MAXQTY_PRODUCT,
      default_minqty: !checkUseMaxQty.MINQTY_PRODUCT_VALUE
        ? 1
        : checkUseMaxQty.MINQTY_PRODUCT_VALUE,
      show_settings_max_min: showSettingMaxMin,
      is_using_stock: isUsingStock,
      inital_stock: initialStock,
      will_be_run: willBeRun,
      time_now: moment().format("YYYY-MM-DD hh:mm:ss"),
      time_sync: timeSync,
    };

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

  async updateStockItem(req, res, next) {
    const { min_stock, p_code, barcode } = req.body;
    const user = req.userInfo;
    const time = moment().format("YYYY-MM-DD HH:mm:ss");
    await queriesHelper.updateTableWhere(
      "TBL_MOA_PRD_MAIN",
      `P_MIN_STOCK = ${min_stock}, M_ID = '${user.user_id}', M_TIME = '${time}' `,
      `
    M_MOA_CODE = '${user.u_martid}' AND P_CODE = '${p_code}' AND P_BARCODE = '${barcode}'`
    );

    return res
      .status(200)
      .json(
        responseSuccess(200, messageSuccess.Success, messageSuccess.Success)
      );
  },
  async setMaxMinProduct(req, res, next) {
    let { seq, is_pro_maxqty, is_pro_minqty, pro_max_qty, pro_min_qty } =
      req.body;
    const user = req.userInfo;
    const time = moment().format("YYYY-MM-DD HH:mm:ss");

    if (is_pro_maxqty === "N") {
      pro_max_qty = null;
    }
    if (is_pro_minqty === "N") {
      pro_min_qty = null;
    }

    //update data quantity
    const resultUpdate = await queriesHelper.updateTableWhere(
      "TBL_MOA_PRD_MAIN",
      `
    P_USE_MAXQTY_PD = '${is_pro_maxqty}',
    P_VALUE_MAXQTY_PD = ${pro_max_qty},
    P_USE_MINQTY_PD = '${is_pro_minqty}',
    P_VALUE_MINQTY_PD = ${pro_min_qty},
    M_ID = '${user.user_id}', M_TIME = '${time}' `,
      `
    M_MOA_CODE = '${user.u_martid}' AND SEQ = '${seq}'`
    );

    if (resultUpdate > 0) {
      const dataRequest = JSON.stringify(req.body);
      //write log update  data quantity
      await queriesHelper.insertTableWhere(
        "TBL_MOA_MART_ACTIVITY_LOG",
        "M_MOA_CODE, HIS_IP, TYPE_LOG, DATA, C_TIME, C_ID",
        `'${user.u_martid}', '${ip.address()}', '${
          typeLog.SetCustomMaxMinQty
        }', '${dataRequest}', '${time}','${user.user_id}'`
      );
    }
    return res
      .status(200)
      .json(
        responseSuccess(200, messageSuccess.Success, messageSuccess.Success)
      );
  },
  async getProductCategory(req, res, next) {
    const {cateParent} = req.query 
    const data = await productRegistedModel.getProductCategory(cateParent, req.dataConnect.M_DB_CONNECT, req.dataConnect.M_POS_REGCODE);
    return res
      .status(200)
      .json(
        responseSuccess(200, messageSuccess.Success, data)
      );
  },
  async productStockStatus(req, res, next) {
    let { prd_seqs, prd_stock_status } = req.body;
    //prd_seqs : array seq

    let itemsSuccess = [];
    let itemsFail = [];
    const user = req.userInfo;
    const time = moment().format("YYYY-MM-DD HH:mm:ss");

    const rows = await productRegistedModel.selectProductByArraySeq(prd_seqs);
    for (const row of rows) {
      if (prd_stock_status === 0) {
        //OFF
        prd_stock_status = -1;
      }

      const resultUpdate = await queriesHelper.updateTableWhere(
        "TBL_MOA_PRD_MAIN",
        ` P_INV_TYPE = ${prd_stock_status} , 
      M_ID = '${user.user_id}', M_TIME = '${time}'`,
        ` SEQ = '${row.SEQ}'`
      );
      if (resultUpdate > 0) {
        itemsSuccess.push(row.SEQ);
      } else {
        itemsFail.push(row.SEQ);
      }
    }

    const dataResponse = {
      items_success: itemsSuccess,
      items_failure: itemsFail,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

  async viewDetailProduct(req, res, next) {
    const { prd_seq } = req.query;
    // get detail product
    const product = await productRegistedModel.viewDetailProduct(prd_seq);
    // Get cate for search by images
    const arrCate = await productRegistedModel.getArryCateOfImage(
      req.dataConnect.M_DB_CONNECT,
      req.dataConnect.M_POS_REGCODE
    );

    let dataCate = [
      {
        CTGRY_LARGE_NO: "",
        P_CAT: "모두", // thể loại tất cả => thêm sẵn
      },
    ];

    for (const cate of arrCate) {
      if (cate.P_CAT) {
        dataCate.push({
          CTGRY_LARGE_NO: cate.CTGRY_LARGE_NO,
          P_CAT: cate.P_CAT,
        });
      }
    }
    const productImage = JSON.parse(product.P_IMG);
    let arrImg = [];
    productImage.forEach((ele, index) => {
      arrImg.push({
        thumb: loadImageAwsProduct(ele)?.thumb,
        main: ele.main,
        priority: ele.priority,
        cur_items: ele,
        cur_image: ele.items[0].value,
      });
    });
    if (arrImg.length === 0) {
      arrImg.push({
        main: 1,
        thumb: loadNoImage(),
      });
    }
    console.log(product);
    let dataResponse = {
      row_detail: {
        seq: product.SEQ,
        moa_code: product.M_MOA_CODE,
        pos_regcode: product.M_POS_REGCODE,
        code: product.P_CODE,
        name: product.P_NAME,
        category: product.P_CATE ? product.P_CATE : arrCate[0].P_CAT,
        unit: product.P_UNIT,
        barcode: product.P_BARCODE,
        list_price: product.P_LIST_PRICE,
        provider: product.P_PROVIDER,
        sale_price: product.P_SALE_PRICE,
        sale_title: product.P_SALE_TITLE,
        tags: product.P_TAGS,
        cate_list: dataCate,
        images: arrImg,
      },
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  async searchProductImages(req, res, next) {
    const { img_barcode, img_cate, img_keyword, img_type, keyword } = req.body;
    // img_barcode : 1 | 0  img use barcode
    // img_cate : number cate code of image
    // img_type: all | main image | sub image
    // img_keyword: search by 'tags' | 'name'

    const user = req.userInfo;
    // Get images of mart
    const dataImages = await productRegistedModel.searchProductImages(
      keyword,
      img_barcode,
      img_type,
      img_keyword,
      img_cate,
      req.dataConnect.M_DB_CONNECT,
      req.dataConnect.M_POS_REGCODE
    );
    let listImages = [];
    for (const row of dataImages) {
      listImages.push({
        seq: row.SEQ,
        img_code: row.IM_CODE,
        img_name: row.IM_NAME,
        img_name_ext: row.IM_URI,
        img_type: row.IM_TYPE,
        img_url: row.IM_URI,
      });
    }
    const dataResponse = {
      list_images: listImages,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
 
};
