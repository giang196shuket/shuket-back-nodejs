const userModel = require("../model/user");
function BuildChild(data, currentChild) {
  var Object = {};
  Object.SEQ = currentChild.SEQ;
  Object.NAME = currentChild.NAME;
  Object.PARENT_SEQ = currentChild.PARENT_SEQ;
  Object.TYPE = currentChild.TYPE;
  Object.KEY_S3 = currentChild.KEY_S3;
  Object.children = [];

  var child = data.filter((item) => item.PARENT_SEQ == Object.SEQ);
  if (child.length > 0) {
    child.forEach(function (item) {
      Object.children.push(BuildChild(data, item));
    });
  }
  return Object;
}
async function mergeRoleList(arr1, arr2, hasPer = true) {
  console.log('arr1', arr1)
  console.log('arr2', arr2)

  const result = JSON.stringify(
    BuildChild(
      data,
      data.find((item) => item.SEQ == folderId)
    )
  );
}

module.exports = { mergeRoleList };
