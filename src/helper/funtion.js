const { LINK_NO_IMAGE } = require("./link");

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

module.exports = {  stringLimitWords, getLimitQuery };
