

// page , 
// limit, 
// keywordType, 
// keywordValue, 
// orderBy, 
// status,
// dateStart,
// dateEnd
const requsetSearchListDate = (req, extra) => {
    let params = {
        page : req?.page, 
        limit: req?.limit, 
        keywordType: req?.keywordType, 
        keywordValue : req?.keywordValue, 
        orderBy: req?.orderBy, 
        status: req?.status,
        dateStart: req?.dateStart,
        dateEnd: req?.dateEnd
    }
    extra.forEach(ele => {
        const fieldName = ele
        const fieldValue = req[ele]
        params[fieldName] = fieldValue
    });
    console.log('params:',params)
    return params
    
}

const requsetSearchList = (req, extra) => { 
    let params = {
        page : req?.page, 
        limit: req?.limit, 
        keywordType: req?.keywordType, 
        keywordValue : req?.keywordValue, 
        orderBy: req?.orderBy, 
        status: req?.status,
    }
    extra.forEach(ele => {
        const fieldName = ele
        const fieldValue = req[ele]
        params[fieldName] = fieldValue
    });
    console.log('params:',params)
    return params
}

//check method của router
function checkMethod(currentMethod, standalMethod) {
    if (currentMethod !== standalMethod) {
      return { code: 405, message: messageError.InvalidMethod };
    } else {
      return true;
    }
  }
  

module.exports = { requsetSearchList, requsetSearchListDate, checkMethod} 