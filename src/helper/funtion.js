const { loadImageAwsProduct, loadNoImage } = require("../service/loadImage");
const { bucketImage } = require("./const");
const { messageError } = require("./message");
const moment = require("moment");

//làm gọn text
function stringLimitWords(string, wordLimit) {
  //wordLimit số lượng từ tối đa của chuỗi trả ra
  const words = string?.split(" ").slice(0, wordLimit);
  if (words?.length < wordLimit) {
    return words?.join("/");
  } else {
    words?.pop();
    return words?.join(" ") + "...";
  }
}

//dùng cho làm gọn content notice
function limitcontent(content) {
  if (content.length > 0) {
    return content
      .substring(0, 70)
      .replace("<p>", "")
      .replace("</p>", "")
      .concat("...");
  } else {
    return "";
  }
}
//đếm số lượng 1 ký tự nào đó trong chuội
function countCharacter(inputString, character) {
  const slashesArray = inputString.split(character);
  
  const numberOfSlashes = slashesArray.length - 1;
  
  return numberOfSlashes;
}

//dùng cho query model offset
function getLimitQuery(page, limit) {
  if (!page || page < 1) {
    page = 1;
  }
  if (!limit || limit < 1 || limit > 100) {
    limit = 10;
  }

  const start = (page - 1) * limit;

  return ` LIMIT ${start}, ${limit}`;
}
//generate topic fcm khi tạo mart mới
function generateNewTopic(mart_code, mart_name){
   return [
    {
      NT_TPC_CODE : "TP" + mart_code.substr(-4) +"0000",
      NT_TPC_GRP : mart_name + " 전체",
      NT_TPC_NAME :  mart_code.substr(-4)+"0000",
      NT_TPC_STATUS: 'A',
      NT_TPC_TYPE: 'A'
    },
    {
      NT_TPC_CODE : "TP" + mart_code.substr(-4) +"0001",
      NT_TPC_GRP : mart_name + " 식자재",
      NT_TPC_NAME :  mart_code.substr(-4)+"0001",
      NT_TPC_STATUS: 'A',
      NT_TPC_TYPE: 'B'
    },
    {
      NT_TPC_CODE : "TP" + mart_code.substr(-4) +"0002",
      NT_TPC_GRP : mart_name + " 개별전송",
      NT_TPC_NAME :  "",
      NT_TPC_STATUS: 'A',
      NT_TPC_TYPE: 'D'
    }
   ]
}
//generate STT cho 1 list 
function assignSequentialNumbers(list) {
  let counter = 1;
  // Duyệt qua từng phần tử trong danh sách
  for (let i = 0; i < list.length; i++) {
      // Gán số thứ tự và tăng biến đếm
      list[i].seq = counter;
      counter++;
  }
  return list
}
//generate time của order pickup
function generateTimePickup(C_TIME, O_PICKUP_TIME, addDay) {
  if (addDay) {
    return (
      moment(C_TIME).add(1, "d").format("YYYY-MM-DD") +
      " " +
      O_PICKUP_TIME.substring(0, 2) +
      ":" +
      O_PICKUP_TIME.substring(2, 2) +
      "-" +
      O_PICKUP_TIME.substring(5, 2) +
      ":" +
      O_PICKUP_TIME.substring(7, 2) +
      " 사이"
    );
  } else {
    return (
      moment(C_TIME).format("YYYY-MM-DD") +
      " " +
      O_PICKUP_TIME.substring(0, 2) +
      ":" +
      O_PICKUP_TIME.substring(2, 2) +
      "-" +
      O_PICKUP_TIME.substring(5, 2) +
      ":" +
      O_PICKUP_TIME.substring(7, 2) +
      " 사이"
    );
  }
}
function convertArrayToStringForWhereIn(arr) {
  return arr.map(item => `'${item}'`).join(', ');
}

//dùng generate tag cho product // /tages :[]
function generateTag(tages) {
  return tages.map((tag) => "#" + tag).join("");
}
 //convert tag string => array
function convertTagsStringToArray(tages) {
  return tages.split("#").filter(Boolean);
}

//custom category của product
function customCategoryProduct(P_CAT, P_CAT_MID, P_CAT_SUB) {
  return (
    P_CAT +
    " " +
    (P_CAT_MID ? ` > ${P_CAT_MID}` : " ") +
    " " +
    (P_CAT_SUB ? ` > ${P_CAT_SUB}` : " ")
  );
}
// cấu trúc mảng image cho product
function customArrayImageProduct(P_IMG) {
  const productImages = JSON.parse(P_IMG);
  let arrImage = [];
  let j = 0;
  productImages.forEach((prdImage) => {
    arrImage[j] = loadImageAwsProduct(prdImage, bucketImage.product);
    if (prdImage.main == 1) {
      arrImage[j].main = 1; // ảnh phụ
    } else {
      arrImage[j].main = 0; //ảnh chính
    }
    j++;
  });
  if (arrImage.length === 0) {
    arrImage[0] = {
      thumb: loadNoImage(),
      main: 1,
    };
  }
  return arrImage;
}

// tạo mảng number ngẫu nhiên từ 1 -> max length : mục dích thay for i => for of
//EX [1,2,3,4,5,..]
function generateArray(maxLength) {
  return Array.from({ length: maxLength }, (_, i) => i + 1);
}

//tạo mảng mới là 1 mảng giá trị của tên phần tử mình cần tìm dựa vào ID
function arrayColumn(rows, columnName) {
  let result = [];

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][columnName] !== undefined) {
      result.push(rows[i][columnName]);
    }
  }
  return result;

  //EX:
  // rows = [
  //   'ID' : 1, 'P_CODE' : 'ABC'),
  //   'ID' : 2, 'P_CODE' : 'DEF'),
  //   'ID' : 3, 'P_CODE' : 'GHI'),
  // ]
  // RESULT: ['ABC', 'DEF', 'GHI'];
}
// tạo mart code mới khi tạo mart
function generateNextMoaCode(code) {
  const num = parseInt(code.replace('M', '')) + 1;
  let returnStr = 'M' + num.toString().padStart(8, '0');
  return returnStr;
}

//tạo ra object mới có giá trị của filed này ứng với field khác
function arrayColumnAssign(data, columnName, indexName) {
  const result = {};

  data.forEach((item) => {
    const index = item[indexName];
    const value = item[columnName];
    if (index !== undefined && value !== undefined) {
      result[index] = value;
    }
  });

  return result;

  //EX:
  // data = [{
  //   P_CODE: 268650080,
  //   STK_STOCK: 3,
  //   C_TIME: 2020-07-28 19:40:03
  //   }]
  //result: {268650080: 3}
}

//thay thế mọi ký tự đặc biệt  trong câu query sql
function escapeLikeStr(str) {
  return str.replace(/[\\%_]/g, '\\$&');
}

module.exports = {
  escapeLikeStr,
  convertTagsStringToArray,
  generateNextMoaCode,
  generateNewTopic,
  convertArrayToStringForWhereIn,
  countCharacter,
  stringLimitWords,
  getLimitQuery,
  generateArray,
  generateTag,
  arrayColumn,
  arrayColumnAssign,
  customArrayImageProduct,
  customCategoryProduct,
  limitcontent,
  generateTimePickup,
  assignSequentialNumbers
};
