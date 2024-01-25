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
const textDF = {
  intro1: "에 오신것을 환영합니다.\n",
  intro2: "에서 즐거운 쇼핑하세요.",
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

const martBGColorDefault = "#14b9cc";

const typeLog = {
  SetCustomMaxMinQty: "SET CUSTOM MAX MIN QTY",
};

module.exports = {
  arrayTypeSingle,
  arrayTypeAnotherApp,
  bannerDefault,
  bucketImage,
  textDF,
  listTemplateCode,
  martBGColorDefault,
  typeLog,
  MART_HIDE_CHANGE_STATUS_ORDER,
  MART_USE_DELIVERY_PUSH,
  DELIVERY_PUSH_TYPE
};
