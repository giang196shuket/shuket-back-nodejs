const { LINK_NO_IMAGE } = require("../../helper/link");

async function getCommonDestJsonData(
  target,
  targetType,
  targetCode,
  name,
  martId
) {
  //defaul 4 cái là null
  if (target === "BN") {
    //nếu là banner
    let isShowEmpty = 0;
    if (targetCode) {
      dataCheck = await getTemplateNotUseApp(martId, targetCode);
      if (dataCheck.totalData === dataCheck.arrayTemplateHide.length) {
        isShowEmpty = 1;
      }
      const jsonData = {
        target: target,
        targetType: targetType,
        targetCode: encodeURIComponent(targetCode), // để mã hóa một chuỗi để sử dụng trong URL
        name: name,
        showSub: isShowEmpty,
      };
      return jsonData;
    } else {
      const jsonData = {
        target: target,
        targetType: targetType,
        targetCode: "",
        name: null,
        showSub: isShowEmpty,
      };
      return jsonData;
    }
  } else {
    const jsonData = {
      target: target,
      targetType: targetType,
      targetCode: encodeURIComponent(targetCode), //để mã hóa một chuỗi để sử dụng trong URL
      name: name,
    };

    return jsonData;
  }
}

function getCommonImageJsonData(
  imgPathType,
  imgPath,
  thmbPath,
  imgWidth,
  imgHeight,
) {
  if (!imgPath) {
    imgPath = LINK_NO_IMAGE;
    return imgPath;

  }
    return {
      urlType : imgPathType,
      url: imgPath,
      thumbNailUrl : thmbPath,
      width: imgWidth,
      height: imgHeight
    }

  
}

module.exports = { getCommonDestJsonData, getCommonImageJsonData };
