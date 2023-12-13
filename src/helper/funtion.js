const userModel = require("../model/user");
function BuildChild(data, currentChild) {
  console.log(currentChild)
  var Object = {};
  var name = {};

  Object.code = currentChild.U_CATE_CODE;
  Object.route = currentChild.URL;
  Object.sort2 = currentChild.SORT_ORDER;
  Object.chk_flag = true;
  name.vn = currentChild.U_CATE_NAME;
  name.en = currentChild.U_CATE_NAME_EN;
  name.kr = currentChild.U_CATE_NAME_KR;

  Object.name = name;

  Object.group_items = [];

  var child = data.filter((item) => item.U_CATE_PCD == Object.code);
  if (child.length > 0) {
    child.forEach(function (item) {
      Object.group_items.push(BuildChild(data, item));
    });
    Object.group_items.sort(function(a, b){return a.code - b.code});

  }
  return Object;
}
async function mergeRoleList(arr1, arr2, hasPer = true) {

  let arrMerge = [...arr1, ...arr2];

  // console.log('arrMerge', arrMerge)

  const result = 
    BuildChild( arrMerge, arrMerge.find((item) => item.U_CATE_CODE = 30000))
    // BuildChild( arrMerge, arrMerge[0])

  return result
}

module.exports = { mergeRoleList };
