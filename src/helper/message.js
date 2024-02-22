 const messageSuccess = {
    Success : 'Your request is successful',
    updateSuccess: "Updated data",
}

 const messageError = {
   ScreenCodeNotExists: "The screen code not exists in the system",
   InvalidMethod:"Invalid http method", //405
   uploadFailed: "Upload failed",
   mimetypeNotValid: "File mimetype not valid",
   sendNotificationSucess : 'Send notification success',
   IdNotEmpty:'The id field can not empty',
   PwNotEmpty: 'The password field can not empty',
   TokenInvalid: "Invalid login token.",
   TokenEmpty : "The token field can not empty",
   TokenExpried:"Login token expired",
   ErrorServer: 'Error server',
   IdNotValid : 'The ID you entered is not valid',
   InvalidPassword:'Invalid password. Please try again',
   Suspened:'Sorry, Your account is suspened. Please contact our customer support team.'
}

module.exports = {messageSuccess, messageError} 