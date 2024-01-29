const arrayTypeSingle = ["SA", "SW", "SB"];
const arrayTypeAnotherApp = ["FA", "FW", "FB"];
const bannerDefault = "'mr-bannerapp-1591850238-7970.jpg'";
const bucketImage = {
  martlogo: "mart/logo",
  bannerapp: "mart/bannerapp",
  logoapp: "mart/logoapp",
  banner: "banner/basic",
  notice: "notice/cover",
  product: "product/cover",
};
const textDeFault = {
  intro1: "에 오신것을 환영합니다.\n",
  intro2: "에서 즐거운 쇼핑하세요.",
  orderDeliveryTime: "분 이내 배송",
  dayDelivery1:"배송일: ", // ngày giao hàng
  dayDelivery2: "배송일이: ",
  delayDelivery:"로 연기되었습니다", // hoãn
  timeDelivery:"배송시간: ", // thời gian giao hàng
};

const listTemplateCode = [
  "AP00000001",
  "AP00000004",
  "AP00000008",
  "AP00000009",
  "AP00000012",
  "AP00000018",
  "AP00000017",
];

//// Set mart will be hide option change status on order page key 18032021
const MART_HIDE_CHANGE_STATUS_ORDER = ["M000000221", "M000000234"];
const MART_USE_DELIVERY_PUSH = ["M000000221", "M000000234"];
const DELIVERY_PUSH_TYPE = 'TARGET_MART' // ALL_MART or TARGET_MART
const DELIVERY_FEE  = 'TARGET_MART' // ALL_MART or TARGET_MART
const MART_USE_DELIVERY_FEE = []

const martBGColorDefault = "#14b9cc";

const typeLog = {
  SetCustomMaxMinQty: "SET CUSTOM MAX MIN QTY",
};

const days = {
  'Mon': 1,
  'Tue': 2,
  'Wed': 3,
  'Thu': 4,
  'Fri': 5,
  'Sat': 6,
  'Sun': 7
};

module.exports = {
  arrayTypeSingle,
  arrayTypeAnotherApp,
  bannerDefault,
  bucketImage,
  textDeFault,
  listTemplateCode,
  martBGColorDefault,
  typeLog,
  days,
  MART_HIDE_CHANGE_STATUS_ORDER,
  MART_USE_DELIVERY_PUSH,
  DELIVERY_PUSH_TYPE,
  MART_USE_DELIVERY_FEE,
  DELIVERY_FEE
};
