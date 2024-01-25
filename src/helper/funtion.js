const { LINK_NO_IMAGE } = require("./link");
const { messageError } = require("./message");

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
function limitcontent (content) {
  if(content.length > 0){
    return content.substring(0, 70).replace("<p>","").replace("</p>","").concat("...")
  }else{
    return ""
  }
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

// tạo mảng number ngẫu nhiên từ 1 -> max length : mục dích thay for i => for of
//EX [1,2,3,4,5,..]
function generateArray(maxLength) {
  return Array.from({ length: maxLength }, (_, i) => i + 1);
}

//check method của router
function checkMethod(currentMethod, standalMethod, response) {
  if (currentMethod !== standalMethod) {
    return { code: 405, message: messageError.InvalidMethod };
  } else {
    return true;
  }
}


//dùng generate tag cho product
// /tages :[]
function generateTag(tages) {
  return tages.map((tag) => "#" + tag).join("");
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

module.exports = {
  stringLimitWords,
  getLimitQuery,
  generateArray,
  checkMethod,
  generateTag,
  arrayColumn,
  arrayColumnAssign,
  limitcontent
};
