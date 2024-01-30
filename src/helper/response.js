const { assignSequentialNumbers } = require("./funtion")

const responseSuccess = (code, message, data) => {
    return {
        status:'success',
        code: code,
        message: message,
        data: data
    }

}

const responseErrorInput = (errors) =>{
    return {
        status:'failure',
        errors: errors
    }

}

const responseErrorData = (code, filed ,message) =>{
    return {
        status:'failure',
        errors: [
            {
                code: code,
                field: filed,
                error: message
            }
        ]
    }

}
const responseDataList = (page, limit, total, list) =>{
   return {
    page : page,
    limit : limit,
    total : total,
    list: assignSequentialNumbers(list)
   }
}
module.exports = {responseSuccess, responseErrorInput, responseErrorData, responseDataList} 