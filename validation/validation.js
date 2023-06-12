

const nameValidation = function (val) {
    let regx = /^[a-zA-Z]+([\s][a-zA-Z]+)*$/;
    return regx.test(val);
  }
  
  
  
  //=======================================VALIDATING EMPTY STRING============================================//
  
  const stringValidation = function (name) {
    if (typeof name == "undefined" || typeof name == null) return false;
    if (typeof name == "string" && name.trim().length == 0) return false;
  
    return true;
  };
  
  
  //====================================VALIDATING EMAIL==================================================//
  
  const emailValidation = function (value) {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(value);
  };
  
  //====================================VALIDATING PASSWORD==================================================//
  
  const passwordValidation = function (value) {
    let regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9!@#$%^&*]{6,15})$/
    return regex.test(value)
  }
  
  //================================VALIDATING EMPTY OBJECT=================================================//
  
  const requestValidation = function (value) {
    return Object.keys(value).length !== 0
  };
  
  
  //====================================VALIDATING PHONE NUMBER==================================================//
  
  
  const phoneNumberValidation = function (val) {
    let regx = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/
    return regx.test(val);
  }
  
  
  
  
  
  
  
  
  module.exports = {
    nameValidation,
    stringValidation,
    emailValidation,
    passwordValidation,
    requestValidation,
    phoneNumberValidation
  };