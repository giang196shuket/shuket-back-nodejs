const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");

module.exports = class orderModel {

  static async getOrderAmountByTime(limitQuery, martid, { 
    page, 
    limit, 
    keywordType, 
    keywordValue, 
    orderBy, 
    status,
    dateStart,
    dateEnd,
    methodPayment,
    orderStatus,
    typeOrder
  }) {
    let logBase = `models/orderModel.getOrderAmountByTime: `;
      try {
        let where = ''
        if(methodPayment === "COD"){
          // thanh toán khi nhân hàng
          where += ` AND PM.O_PAY_TYPE = 3 AND PM.O_PAY_METHOD = '${methodPayment}' `
        }else if (methodPayment === "CCOD"){
          // thanh toán bằng thẻ khi nhận hàng
          where += ` AND PM.O_PAY_TYPE = 4 AND PM.O_PAY_METHOD = '${methodPayment}' `
        }else{
          // thanh toán trước bằng thẻ
          where += ` AND PM.O_PAY_TYPE = 2 AND PM.O_PAY_METHOD = '${methodPayment}' `
        }
        //70: Order Completed
        //82: Delivery completed
        where += ` AND OD.O_STATUS IN  (70, 82)`
        if(typeOrder === 'delivery'){
          //delivery
          where += ` AND OD.O_DELIVERY_TYPE = 'D' `
        }else if(typeOrder === 'pickup'){
          //pickup
          where += ` AND OD.O_DELIVERY_TYPE = 'P' `
        }else if(typeOrder === 'weburl'){
          //weburl
          where += ` AND OD.O_WEBURL = 1 `
        }
        if(keywordType === 'code'){
          where +=  ` AND OD.O_CODE = '${keywordValue}' `
        }else if(keywordType === 'username'){
          // người order
          where += ` AND MM.U_NAME LIKE '%${keywordValue}%' `
        }else if(keywordType === 'userid'){
          where += ` AND MM.U_ID LIKE '%${keywordValue}%' `
        }
        if(dateStart && dateEnd){
          where += ` AND DATE_FORMAT(OD.C_TIME, '%Y-%m-%d') BETWEEN '${dateStart}' AND '${dateEnd}' `
        }
        const  sql = `SELECT SUM(SUB.O_PAY_AMOUNT) AS TOTAL_AMOUNT FROM
        (SELECT
        OD.M_MOA_CODE, OD.O_WEBURL, OD.U_ADDR_RECI, OD.O_CODE, OD.O_STATUS, OD.O_COUPON, OD.O_PLATFM,
        OD.O_POINT, OD.U_CODE, OD.C_TIME, MM.U_NAME, PM.O_PAY_AMOUNT, PM.O_PAY_TYPE, OD.U_ADDR_STATE,
        OD.U_ADDR_CITY, OD.U_ADDR_RA, OD.U_ADDR_DETAIL,OD.O_DELIVERY_TYPE,OD.O_PICKUP_TIME,OD.O_PICKUP_DATE,
        OD.DELIVERY_DATA,OD.IS_DELIVERY,OD.DELIVERY_INFO,
        CASE PM.O_PAY_TYPE
            WHEN 3 THEN '현장현금결제'
            WHEN 4 THEN '현장카드결제'
        END PAY_METHOD,
        CASE PM.O_PAY_METHOD
            WHEN 'BANK' THEN '계좌 이체'
            WHEN 'CARD' THEN '카드결제'
            WHEN 'KKP' THEN '카카오페이'
            WHEN 'NP' THEN '네이버페이'
            WHEN 'LP' THEN '리브페이'
            WHEN 'SKP' THEN '간편결제 (슈켓 PAY)'
            WHEN 'VBANK' THEN '가상계좌(무통장입금)'
        END PAY_METHOD_CARD_KO,
        CASE OD.O_STATUS
            WHEN 60 THEN '주문확인중'
            WHEN 61 THEN '주문취소'
            WHEN 64 THEN '주문(결제)진행중'
            WHEN 70 THEN '주문완료'
            WHEN 71 THEN if(PM.O_PAY_METHOD!='VBANK','카드결제중','입금확인중')
            WHEN 72 THEN '주문접수'
            WHEN 80 THEN '배송준비중'
            WHEN 81 THEN '배송중'
            WHEN 82 THEN '배송완료'
            WHEN 83 THEN '배송취소'
            WHEN 90 THEN '픽업준비중'
            WHEN 91 THEN '픽업준비완료'
            WHEN 92 THEN '픽업완료'
            WHEN 93 THEN '픽업취소'
            WHEN 30 THEN '주문확인중'
            WHEN 31 THEN '주문확인중'
            WHEN 32 THEN '주문확인중'
            WHEN 33 THEN '주문확인중'
            WHEN 40 THEN '주문확인중'
            WHEN 41 THEN '주문확인중'
            WHEN 42 THEN '주문확인중'
            WHEN 43 THEN '주문확인중'
        END ORDERS_GRP,
        CASE
  WHEN OD.M_MOA_CODE ='M000000571' THEN ifnull((SELECT O_PRD_PRICE FROM TBL_MOA_ORD_DETAIL 
    WHERE P_CODE='18756' AND P_BARCODE='22000910' AND M_MOA_CODE ='M000000571' AND O_CODE = OD.O_CODE LIMIT 1),0)
            WHEN OD.M_MOA_CODE ='M000000635' THEN ifnull((SELECT O_PRD_PRICE FROM TBL_MOA_ORD_DETAIL 
              WHERE P_CODE='187564' AND P_BARCODE='22000911' AND M_MOA_CODE ='M000000635' AND O_CODE = OD.O_CODE  LIMIT 1),0)
            WHEN OD.M_MOA_CODE NOT IN ('M000000571','M000000635') THEN OD.O_SHIP
        END AS OSHIP,
        (
            SELECT IFNULL(SUM(SUB_OT.O_PRD_PRICE * SUB_OT.O_QTY), 0) AS ORDERS_TOTAL_SALES
            FROM TBL_MOA_ORD_DETAIL AS SUB_OT
            WHERE SUB_OT.O_CODE = OD.O_CODE
            AND SUB_OT.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_OT.O_CANCEL_STATUS='C'  
             LIMIT 1
        ) AS ORDERS_SALE_PRICE,
        (
            SELECT IFNULL(COUNT(SUB_OT1.SEQ), 0) AS CNT
            FROM TBL_MOA_ORD_DETAIL AS SUB_OT1
            WHERE SUB_OT1.O_CODE = OD.O_CODE
            AND SUB_OT1.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_OT1.O_CANCEL_STATUS='C' 
             LIMIT 1
        ) AS OD_GOODS_CNT,
        (
            SELECT SUB_PD2.P_NAME
            FROM TBL_MOA_ORD_DETAIL AS SUB_OT2
            JOIN TBL_MOA_PRD_MAIN AS SUB_PD2 ON SUB_OT2.P_CODE = SUB_PD2.P_CODE 
            AND SUB_OT2.P_NAME = SUB_PD2.P_NAME AND SUB_OT2.P_BARCODE = SUB_PD2.P_BARCODE
            WHERE SUB_OT2.O_CODE = OD.O_CODE
            AND SUB_OT2.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_PD2.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_OT2.O_CANCEL_STATUS='C' 
            LIMIT 1
        ) AS OD_GOODS_NAME,
        (
            SELECT SUB_OC.O_CANCEL_CMNT
            FROM TBL_MOA_ORD_MAIN_CANCEL AS SUB_OC
            WHERE SUB_OC.O_CODE = OD.O_CODE
            AND SUB_OC.M_MOA_CODE = OD.M_MOA_CODE
            LIMIT 1
        )
        AS OD_CANCEL_CMNT,
        (
            SELECT SUB_RE.O_RFEX_CMNT
            FROM TBL_MOA_ORD_MAIN_RFEX AS SUB_RE
            WHERE SUB_RE.O_CODE = OD.O_CODE
            AND SUB_RE.M_MOA_CODE = OD.M_MOA_CODE
            ORDER BY SUB_RE.SEQ DESC
            LIMIT 1
        ) AS OD_RFEX_CMNT,
        OD.IS_PRINT,
        PM.O_PAY_AMOUNT_HIS,
        (
            SELECT IFNULL(NOTI_YN,'N')
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS NOTI_YN,
        (
            SELECT IFNULL(OB_TIME_SET,'N')
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS OB_TIME_SET,
        (
            SELECT IFNULL(OB_DEL_TIME,'30')
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS OB_DEL_TIME,
        (
            SELECT OB_TIME_CREATE
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS OB_TIME_CREATE,
        (SELECT PN.NICE_CARDNAME
  FROM TBL_MOA_PAYMT_NICE_LOG AS PN
  WHERE PN.O_CODE = OD.O_CODE  AND PN.M_MOA_CODE = '${martid}'
            ORDER BY PN.SEQ
  LIMIT 1
        ) AS NICE_CARDNAME,
        CONCAT(OD.U_ADDR_STATE,' ',OD.U_ADDR_CITY) AS GROUP_ADDRESS, OD.U_POST_CODE,OD.IS_CHECK,OD.BUNDLE_ORDER
    FROM TBL_MOA_ORD_MAIN AS OD
        JOIN TBL_MOA_PAYMT_MAIN AS PM ON OD.O_CODE = PM.O_CODE
        LEFT JOIN TBL_MOA_APP_USERS AS MM ON OD.U_CODE = MM.U_CODE
    WHERE OD.M_MOA_CODE = '${martid}'
    AND PM.M_MOA_CODE = '${martid}'
   ${where}) AS SUB`;
    
      logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getOrderListData(limitQuery, martid, { 
    page, 
    limit, 
    keywordType, 
    keywordValue, 
    orderBy, 
    status,
    dateStart,
    dateEnd,
    methodPayment,
    orderStatus,
    typeOrder
  }) {
    let logBase = `models/orderModel.getOrderListData: `;
      try {
        let where = ''
        if(methodPayment === "COD"){
          // thanh toán khi nhân hàng
          where += ` AND PM.O_PAY_TYPE = 3 AND PM.O_PAY_METHOD = '${methodPayment}' `
        }else if (methodPayment === "CCOD"){
          // thanh toán bằng thẻ khi nhận hàng
          where += ` AND PM.O_PAY_TYPE = 4 AND PM.O_PAY_METHOD = '${methodPayment}' `
        }else if(methodPayment && methodPayment !== "COD" && methodPayment !== "CCOD"){
          // thanh toán trước bằng thẻ
          where += ` AND PM.O_PAY_TYPE = 2 AND PM.O_PAY_METHOD = '${methodPayment}' `
        }
        //70: Order Completed
        //82: Delivery completed
        where += ` AND OD.O_STATUS IN  (70, 82)`
        if(typeOrder === 'delivery'){
          //delivery
          where += ` AND OD.O_DELIVERY_TYPE = 'D' `
        }else if(typeOrder === 'pickup'){
          //pickup
          where += ` AND OD.O_DELIVERY_TYPE = 'P' `
        }else if(typeOrder === 'weburl'){
          //weburl
          where += ` AND OD.O_WEBURL = 1 `
        }
        if(orderStatus){
          //số mã code trạng thái của order
          where += ` AND OD.O_STATUS = '${orderStatus}' `
        }
        if(keywordType === 'code'){
          where +=  ` AND OD.O_CODE = '${keywordValue}' `
        }else if(keywordType === 'username'){
          // người order
          where += ` AND MM.U_NAME LIKE '%${keywordValue}%' `
        }else if(keywordType === 'userid'){
          where += ` AND MM.U_ID LIKE '%${keywordValue}%' `
        }
        if(dateStart && dateEnd){
          where += ` AND DATE_FORMAT(OD.C_TIME, '%Y-%m-%d') BETWEEN '${dateStart}' AND '${dateEnd}' `
        }
        const sql = `SELECT
        OD.M_MOA_CODE, OD.O_WEBURL, OD.U_ADDR_RECI, OD.O_CODE, OD.O_STATUS, OD.O_COUPON, OD.O_PLATFM,
        OD.O_POINT, OD.U_CODE, OD.C_TIME, MM.U_NAME, PM.O_PAY_AMOUNT, PM.O_PAY_TYPE, OD.U_ADDR_STATE,
        OD.U_ADDR_CITY, OD.U_ADDR_RA, OD.U_ADDR_DETAIL,OD.O_DELIVERY_TYPE,OD.O_PICKUP_TIME,OD.O_PICKUP_DATE,
        OD.DELIVERY_DATA,OD.IS_DELIVERY,OD.DELIVERY_INFO,
        PM.O_PAY_METHOD,
        CASE PM.O_PAY_TYPE
            WHEN 3 THEN '현장현금결제'
            WHEN 4 THEN '현장카드결제'
        END PAY_METHOD,
        CASE PM.O_PAY_METHOD
            WHEN 'BANK' THEN '계좌 이체'
            WHEN 'CARD' THEN '카드결제'
            WHEN 'KKP' THEN '카카오페이'
            WHEN 'NP' THEN '네이버페이'
            WHEN 'LP' THEN '리브페이'
            WHEN 'SKP' THEN '간편결제 (슈켓 PAY)'
            WHEN 'VBANK' THEN '가상계좌(무통장입금)'
        END PAY_METHOD_CARD_KO,
        CASE OD.O_STATUS
            WHEN 60 THEN '주문확인중'
            WHEN 61 THEN '주문취소'
            WHEN 64 THEN '주문(결제)진행중'
            WHEN 70 THEN '주문완료'
            WHEN 71 THEN if(PM.O_PAY_METHOD!='VBANK','카드결제중','입금확인중')
            WHEN 72 THEN '주문접수'
            WHEN 80 THEN '배송준비중'
            WHEN 81 THEN '배송중'
            WHEN 82 THEN '배송완료'
            WHEN 83 THEN '배송취소'
            WHEN 90 THEN '픽업준비중'
            WHEN 91 THEN '픽업준비완료'
            WHEN 92 THEN '픽업완료'
            WHEN 93 THEN '픽업취소'
            WHEN 30 THEN '주문확인중'
            WHEN 31 THEN '주문확인중'
            WHEN 32 THEN '주문확인중'
            WHEN 33 THEN '주문확인중'
            WHEN 40 THEN '주문확인중'
            WHEN 41 THEN '주문확인중'
            WHEN 42 THEN '주문확인중'
            WHEN 43 THEN '주문확인중'
        END ORDERS_GRP,
        CASE
  WHEN OD.M_MOA_CODE ='M000000571' THEN ifnull((SELECT O_PRD_PRICE 
   FROM TBL_MOA_ORD_DETAIL WHERE P_CODE='18756' AND P_BARCODE='22000910' 
   AND M_MOA_CODE ='M000000571' AND O_CODE = OD.O_CODE LIMIT 1),0)
            WHEN OD.M_MOA_CODE ='M000000635' THEN ifnull((SELECT O_PRD_PRICE FROM TBL_MOA_ORD_DETAIL 
             WHERE P_CODE='187564' AND P_BARCODE='22000911' AND M_MOA_CODE ='M000000635' AND O_CODE = OD.O_CODE  LIMIT 1),0)
            WHEN OD.M_MOA_CODE NOT IN ('M000000571','M000000635') THEN ifnull((SELECT O_PRD_PRICE 
             FROM TBL_MOA_ORD_DETAIL WHERE IS_DELIVERY=1 AND M_MOA_CODE ='${martid}' AND O_CODE = OD.O_CODE  LIMIT 1),OD.O_SHIP)
        END AS OSHIP,
        (SELECT IS_DELIVERY FROM TBL_MOA_ORD_DETAIL WHERE IS_DELIVERY=1 AND M_MOA_CODE ='M000000408'
         AND O_CODE = OD.O_CODE  LIMIT 1) AS PRODUCT_DELIVERY,
        (
            SELECT IFNULL(SUM(SUB_OT.O_PRD_PRICE * SUB_OT.O_QTY), 0) AS ORDERS_TOTAL_SALES
            FROM TBL_MOA_ORD_DETAIL AS SUB_OT
            WHERE SUB_OT.O_CODE = OD.O_CODE
            AND SUB_OT.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_OT.O_CANCEL_STATUS='C'  
             LIMIT 1
        ) AS ORDERS_SALE_PRICE,
        (
            SELECT IFNULL(COUNT(SUB_OT1.SEQ), 0) AS CNT
            FROM TBL_MOA_ORD_DETAIL AS SUB_OT1
            WHERE SUB_OT1.O_CODE = OD.O_CODE
            AND SUB_OT1.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_OT1.O_CANCEL_STATUS='C' 
             LIMIT 1
        ) AS OD_GOODS_CNT,
        (
            SELECT SUB_PD2.P_NAME
            FROM TBL_MOA_ORD_DETAIL AS SUB_OT2
            JOIN TBL_MOA_PRD_MAIN AS SUB_PD2 ON SUB_OT2.P_CODE = SUB_PD2.P_CODE 
            AND SUB_OT2.P_NAME = SUB_PD2.P_NAME AND SUB_OT2.P_BARCODE = SUB_PD2.P_BARCODE
            WHERE SUB_OT2.O_CODE = OD.O_CODE
            AND SUB_OT2.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_PD2.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_OT2.O_CANCEL_STATUS='C' 
            LIMIT 1
        ) AS OD_GOODS_NAME,
        (
            SELECT SUB_OC.O_CANCEL_CMNT
            FROM TBL_MOA_ORD_MAIN_CANCEL AS SUB_OC
            WHERE SUB_OC.O_CODE = OD.O_CODE
            AND SUB_OC.M_MOA_CODE = OD.M_MOA_CODE
            LIMIT 1
        )
        AS OD_CANCEL_CMNT,
        (
            SELECT SUB_RE.O_RFEX_CMNT
            FROM TBL_MOA_ORD_MAIN_RFEX AS SUB_RE
            WHERE SUB_RE.O_CODE = OD.O_CODE
            AND SUB_RE.M_MOA_CODE = OD.M_MOA_CODE
            ORDER BY SUB_RE.SEQ DESC
            LIMIT 1
        ) AS OD_RFEX_CMNT,
        OD.IS_PRINT,
        PM.O_PAY_AMOUNT_HIS,
        (
            SELECT IFNULL(NOTI_YN,'N')
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS NOTI_YN,
        (
            SELECT IFNULL(OB_TIME_SET,'N')
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS OB_TIME_SET,
        (
            SELECT IFNULL(OB_DEL_TIME,'30')
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS OB_DEL_TIME,
        (
            SELECT OB_TIME_CREATE
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS OB_TIME_CREATE,
        (SELECT PN.NICE_CARDNAME
  FROM TBL_MOA_PAYMT_NICE_LOG AS PN
  WHERE PN.O_CODE = OD.O_CODE  AND PN.M_MOA_CODE = '${martid}'
            ORDER BY PN.SEQ
  LIMIT 1
        ) AS NICE_CARDNAME,
        (SELECT PN.NICE_EASYBANKNAME
  FROM TBL_MOA_PAYMT_NICE_LOG AS PN
  WHERE PN.O_CODE = OD.O_CODE  AND PN.M_MOA_CODE = '${martid}'
            ORDER BY PN.SEQ
  LIMIT 1
        ) AS NICE_EASYBANKNAME,
        CONCAT(OD.U_ADDR_STATE,' ',OD.U_ADDR_CITY) AS GROUP_ADDRESS, OD.U_POST_CODE,OD.IS_CHECK,OD.BUNDLE_ORDER,
        (
            SELECT IFNULL(DL_TYPE, '') AS DELIVERY_TYPE
            FROM TBL_MOA_ORD_DELIVERY
            WHERE O_CODE = OD.O_CODE
            AND M_MOA_CODE = OD.M_MOA_CODE
            LIMIT 1) AS DELIVERY_TYPE,
            (
            SELECT IFNULL(DL_DATE, '') AS DELIVERY_DATE
            FROM TBL_MOA_ORD_DELIVERY
            WHERE O_CODE = OD.O_CODE
            AND M_MOA_CODE = OD.M_MOA_CODE
            LIMIT 1) AS DELIVERY_DATE
    FROM TBL_MOA_ORD_MAIN AS OD
        JOIN TBL_MOA_PAYMT_MAIN AS PM ON OD.O_CODE = PM.O_CODE
        LEFT JOIN TBL_MOA_APP_USERS AS MM ON OD.U_CODE = MM.U_CODE
    WHERE OD.M_MOA_CODE = '${martid}'
    AND PM.M_MOA_CODE = '${martid}'
    ${where}  ORDER BY OD.SEQ DESC ${limitQuery}`
        const  sqlCount = `SELECT COUNT(SUB.O_CODE) AS CNT FROM
        (SELECT
        OD.M_MOA_CODE, OD.O_WEBURL, OD.U_ADDR_RECI, OD.O_CODE, OD.O_STATUS, OD.O_COUPON, OD.O_PLATFM,
        OD.O_POINT, OD.U_CODE, OD.C_TIME, MM.U_NAME, PM.O_PAY_AMOUNT, PM.O_PAY_TYPE, OD.U_ADDR_STATE,
        OD.U_ADDR_CITY, OD.U_ADDR_RA, OD.U_ADDR_DETAIL,OD.O_DELIVERY_TYPE,OD.O_PICKUP_TIME,OD.O_PICKUP_DATE,
        OD.DELIVERY_DATA,OD.IS_DELIVERY,OD.DELIVERY_INFO,
        PM.O_PAY_METHOD,
        CASE PM.O_PAY_TYPE
            WHEN 3 THEN '현장현금결제'
            WHEN 4 THEN '현장카드결제'
        END PAY_METHOD,
        CASE PM.O_PAY_METHOD
            WHEN 'BANK' THEN '계좌 이체'
            WHEN 'CARD' THEN '카드결제'
            WHEN 'KKP' THEN '카카오페이'
            WHEN 'NP' THEN '네이버페이'
            WHEN 'LP' THEN '리브페이'
            WHEN 'SKP' THEN '간편결제 (슈켓 PAY)'
            WHEN 'VBANK' THEN '가상계좌(무통장입금)'
        END PAY_METHOD_CARD_KO,
        CASE OD.O_STATUS
            WHEN 60 THEN '주문확인중'
            WHEN 61 THEN '주문취소'
            WHEN 64 THEN '주문(결제)진행중'
            WHEN 70 THEN '주문완료'
            WHEN 71 THEN if(PM.O_PAY_METHOD!='VBANK','카드결제중','입금확인중')
            WHEN 72 THEN '주문접수'
            WHEN 80 THEN '배송준비중'
            WHEN 81 THEN '배송중'
            WHEN 82 THEN '배송완료'
            WHEN 83 THEN '배송취소'
            WHEN 90 THEN '픽업준비중'
            WHEN 91 THEN '픽업준비완료'
            WHEN 92 THEN '픽업완료'
            WHEN 93 THEN '픽업취소'
            WHEN 30 THEN '주문확인중'
            WHEN 31 THEN '주문확인중'
            WHEN 32 THEN '주문확인중'
            WHEN 33 THEN '주문확인중'
            WHEN 40 THEN '주문확인중'
            WHEN 41 THEN '주문확인중'
            WHEN 42 THEN '주문확인중'
            WHEN 43 THEN '주문확인중'
        END ORDERS_GRP,
        CASE
  WHEN OD.M_MOA_CODE ='M000000571' THEN ifnull((SELECT O_PRD_PRICE 
    FROM TBL_MOA_ORD_DETAIL WHERE P_CODE='18756' AND P_BARCODE='22000910' 
    AND M_MOA_CODE ='M000000571' AND O_CODE = OD.O_CODE LIMIT 1),0)
            WHEN OD.M_MOA_CODE ='M000000635' THEN ifnull((SELECT O_PRD_PRICE 
              FROM TBL_MOA_ORD_DETAIL WHERE P_CODE='187564' AND P_BARCODE='22000911' 
              AND M_MOA_CODE ='M000000635' AND O_CODE = OD.O_CODE  LIMIT 1),0)
            WHEN OD.M_MOA_CODE NOT IN ('M000000571','M000000635') THEN OD.O_SHIP
        END AS OSHIP,
        (
            SELECT IFNULL(SUM(SUB_OT.O_PRD_PRICE * SUB_OT.O_QTY), 0) AS ORDERS_TOTAL_SALES
            FROM TBL_MOA_ORD_DETAIL AS SUB_OT
            WHERE SUB_OT.O_CODE = OD.O_CODE
            AND SUB_OT.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_OT.O_CANCEL_STATUS='C'  
             LIMIT 1
        ) AS ORDERS_SALE_PRICE,
        (
            SELECT IFNULL(COUNT(SUB_OT1.SEQ), 0) AS CNT
            FROM TBL_MOA_ORD_DETAIL AS SUB_OT1
            WHERE SUB_OT1.O_CODE = OD.O_CODE
            AND SUB_OT1.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_OT1.O_CANCEL_STATUS='C' 
             LIMIT 1
        ) AS OD_GOODS_CNT,
        (
            SELECT SUB_PD2.P_NAME
            FROM TBL_MOA_ORD_DETAIL AS SUB_OT2
            JOIN TBL_MOA_PRD_MAIN AS SUB_PD2 ON SUB_OT2.P_CODE = SUB_PD2.P_CODE AND SUB_OT2.P_NAME = SUB_PD2.P_NAME AND SUB_OT2.P_BARCODE = SUB_PD2.P_BARCODE
            WHERE SUB_OT2.O_CODE = OD.O_CODE
            AND SUB_OT2.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_PD2.M_MOA_CODE = OD.M_MOA_CODE
            AND SUB_OT2.O_CANCEL_STATUS='C' 
            LIMIT 1
        ) AS OD_GOODS_NAME,
        (
            SELECT SUB_OC.O_CANCEL_CMNT
            FROM TBL_MOA_ORD_MAIN_CANCEL AS SUB_OC
            WHERE SUB_OC.O_CODE = OD.O_CODE
            AND SUB_OC.M_MOA_CODE = OD.M_MOA_CODE
            LIMIT 1
        )
        AS OD_CANCEL_CMNT,
        (
            SELECT SUB_RE.O_RFEX_CMNT
            FROM TBL_MOA_ORD_MAIN_RFEX AS SUB_RE
            WHERE SUB_RE.O_CODE = OD.O_CODE
            AND SUB_RE.M_MOA_CODE = OD.M_MOA_CODE
            ORDER BY SUB_RE.SEQ DESC
            LIMIT 1
        ) AS OD_RFEX_CMNT,
        OD.IS_PRINT,
        PM.O_PAY_AMOUNT_HIS,
        (
            SELECT IFNULL(NOTI_YN,'N')
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS NOTI_YN,
        (
            SELECT IFNULL(OB_TIME_SET,'N')
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS OB_TIME_SET,
        (
            SELECT IFNULL(OB_DEL_TIME,'30')
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS OB_DEL_TIME,
        (
            SELECT OB_TIME_CREATE
            FROM TBL_MOA_ORD_BOARD
            WHERE O_CODE = PM.O_CODE AND U_CODE = MM.U_CODE
            ORDER BY SEQ DESC
            LIMIT 1
        ) AS OB_TIME_CREATE,
        (SELECT PN.NICE_CARDNAME
  FROM TBL_MOA_PAYMT_NICE_LOG AS PN
  WHERE PN.O_CODE = OD.O_CODE  AND PN.M_MOA_CODE = '${martid}'
            ORDER BY PN.SEQ
  LIMIT 1
        ) AS NICE_CARDNAME,
        CONCAT(OD.U_ADDR_STATE,' ',OD.U_ADDR_CITY) AS GROUP_ADDRESS, OD.U_POST_CODE,OD.IS_CHECK,OD.BUNDLE_ORDER
    FROM TBL_MOA_ORD_MAIN AS OD
        JOIN TBL_MOA_PAYMT_MAIN AS PM ON OD.O_CODE = PM.O_CODE
        LEFT JOIN TBL_MOA_APP_USERS AS MM ON OD.U_CODE = MM.U_CODE
    WHERE OD.M_MOA_CODE = '${martid}'
    AND PM.M_MOA_CODE = '${martid}'
    ${where}) AS SUB`;

      
    
      logger.writeLog("info", `${logBase} : ${sql}`);
      const [total] = await pool.mysqlPool.query(sqlCount);
      const [list] = await pool.mysqlPool.query(sql);

      return {list: list, total: total[0].CNT}
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getOrderDetailData(orderCode, martid, dataConnect) {
    let logBase = `models/orderModel.getOrderDetailData: `;
      try {
        let where = ''
        
        const sql = `SELECT SUB.* FROM (SELECT
          OT.SEQ, OD.O_CODE, OT.O_PRD_PRICE, PD.P_IMG, PD.P_CODE, OT.P_NAME, OT.O_QTY, PD.P_BARCODE, 
          OT.P_LIST_PRICE, OT.P_SALE_PRICE  , OT.P_PRD_UNIT as P_UNIT,
          CPOM.OL_CPN_CODE, CPOM.OL_CPN_TYPE, CPOM.OL_CPN_DIS_AMOUNT,
          OT.IS_DELIVERY,
          MOG.INV_TYPE AS G_INV_TYPE,
          PD.P_INV_TYPE AS P_INV_TYPE,
          (
              SELECT TBLSTOCK.STK_STOCK
              FROM TBL_MOA_STOCK_TOGETHERS AS TBLSTOCK
              WHERE TBLSTOCK.GOODS_CODE = PD.P_CODE
              AND TBLSTOCK.M_MOA_CODE = PD.M_MOA_CODE
              LIMIT 1
          ) AS STK_STOCK,
          (
              SELECT
                  CPM.CPN_SEQNO
              FROM TBL_MOA_CPN_POS_MEM AS CPM
              WHERE CPM.U_CODE = OD.U_CODE
              AND CPM.M_MOA_CODE = OD.M_MOA_CODE
              AND CPM.PS_CPN_SERIAL = CPOM.OL_CPN_CODE
          ) AS CPN_SEQNO,
         (
              SELECT MCL.CTGRY_NAME
              FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY MCL
              WHERE (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO) = MCL.CTGRY_LARGE_NO
              AND PD.M_POS_REGCODE = MCL.MART_SEQNO
              AND MCL.CTGRY_MEDIUM_NO = 0
                  AND MCL.CTGRY_SMALL_NO = 0
                  AND MCL.CTGRY_STATE = 1
              LIMIT 1
          ) AS P_CAT,
          (
                  SELECT MCL.CTGRY_NAME
                  FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY MCL
                  WHERE (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                    WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO)  = MCL.CTGRY_LARGE_NO
                  AND PD.M_POS_REGCODE = MCL.MART_SEQNO
                  AND MCL.CTGRY_MEDIUM_NO = (SELECT CTGRY_MEDIUM_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                    WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO)
                      AND MCL.CTGRY_SMALL_NO = 0
                      AND MCL.CTGRY_STATE = 1
              LIMIT 1
              ) AS P_CAT_MID,
          (SELECT MC.CTGRY_NAME FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
            WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS P_CAT_SUB,
          (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
            WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_LARGE_NO,
          (SELECT CTGRY_MEDIUM_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
            WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_MEDIUM_NO,
          (SELECT MC.CTGRY_SEQNO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
            WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS SEQ_P_CAT_SUB
FROM TBL_MOA_ORD_MAIN AS OD
          JOIN TBL_MOA_ORD_DETAIL AS OT ON OD.O_CODE = OT.O_CODE AND OT.M_MOA_CODE = OD.M_MOA_CODE
          JOIN TBL_MOA_PRD_MAIN AS PD ON OT.P_CODE = PD.P_CODE AND OT.P_BARCODE = PD.P_BARCODE
          LEFT JOIN TBL_MOA_CPN_ONLINE_MEM AS CPOM ON
          (
              OD.O_CODE = CPOM.O_CODE
              AND OD.U_CODE = CPOM.U_CODE
              AND OD.M_MOA_CODE = CPOM.M_MOA_CODE
              AND OT.P_CODE = CPOM.P_CODE
              AND OT.P_BARCODE = CPOM.P_BARCODE
              AND CPOM.OL_CPN_MAKER = 'M'
              AND CPOM.OL_CPN_TYPE = '1'
          )
          JOIN ${dataConnect.M_DB_CONNECT}.MART_ORDER_GOODS AS MOG
          ON
          (
              MOG.MART_SEQNO = PD.M_POS_REGCODE
              AND MOG.GOODS_CODE = PD.P_CODE
              AND MOG.BRCD = PD.P_BARCODE
          )
      WHERE OD.O_CODE = ${orderCode}
      AND OD.M_MOA_CODE = ${martid}
      AND OT.M_MOA_CODE = ${martid}
      AND PD.M_MOA_CODE = ${martid}
      AND PD.P_STATUS != 'D'
      AND OT.O_CANCEL_STATUS = 'C'
      Group by OT.SEQ) AS SUB
      ORDER BY SUB.P_CAT,SUB.P_CAT_MID,SUB.P_CAT_SUB`;

      logger.writeLog("info", `${logBase} : ${sql}`);
      const [list] = await pool.mysqlPool.query(sql);

      return list
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }

  static async getListPayment() {
    let logBase = `models/orderModel.getListPayment`;
      try {
        const  sql = `SELECT
        C_CODE as code, C_KO as nameKO, C_ENG as nameENG
    FROM TBL_MOA_CODE_COMMON
    WHERE C_GRP = 'OP'
    ORDER BY C_ORDER ASC`;
    
      // logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getListStatusOrder() {
    let logBase = `models/orderModel.getListStatusOrder`;
      try {
        const  sql = `SELECT
        C_CODE as code, C_KO as nameKO, C_ENG as nameENG
    FROM TBL_MOA_CODE_COMMON
    WHERE C_GRP = 'OS' AND C_CODE>=80 AND C_CODE<=93 AND C_USE='Y' AND C_CODE NOT IN ('83','93')
    ORDER BY C_ORDER ASC`;
    
      // logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }

  static async getListDeliveryTime() {
    let logBase = `models/orderModel.getListDeliveryTime`;
      try {
        const  sql = `SELECT
        C_CODE as code, C_KO as nameKO, C_ENG as nameENG
    FROM TBL_MOA_CODE_COMMON
    WHERE C_GRP = 'DT'
    ORDER BY C_ORDER ASC`;
    
      // logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
};
