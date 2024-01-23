const { LINK_NO_IMAGE } = require("./link");
const { messageError } = require("./message");

function stringLimitWords(string, wordLimit) {
  const words = string?.split(' ').slice(0, wordLimit);

  if (words?.length < wordLimit) {
    // otherwise
    return words?.join('/');
  } else {
    // add a ... at last article when more than limit word count
    words?.pop();
    return words?.join(' ') + '...';
  }
}

 function getLimitQuery(page, perPage)
{
  if(!page || page < 1){
    page =1
  }
  if(!perPage || perPage < 1 || perPage > 100){
    perPage =10
  }

  const start = (page - 1) * perPage

  return ` LIMIT ${start}, ${perPage}`
  
}
// tạo mảng number ngẫu nhiên từ 1 -> max length : mục dích thay for i => for of
function generateArray(maxLength) {
  return Array.from({length: maxLength}, (_, i) => i + 1)
}

function checkMethod(currentMethod, standalMethod, response){
  if(currentMethod !== standalMethod){
    return {code: 405, message:messageError.InvalidMethod} 
  }else{
    return true
  }
}

function generateTag(tages) {
  return tages.map((tag)=> '#'+tag).join('')
}



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


function arrayColumnAssign(data, columnName, indexName) {
  const result = {};

  data.forEach((item) => {
      const index = item[indexName];
      const value = item[columnName];
      // Kiểm tra nếu giá trị chỉ số và giá trị cột không rỗng
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
module.exports = {  stringLimitWords, getLimitQuery, generateArray, checkMethod, generateTag , arrayColumn, arrayColumnAssign};
