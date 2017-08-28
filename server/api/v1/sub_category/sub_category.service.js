var debug = require('debug')('server:api:v1:sub_category:service');
var uuid = require('uuid');
var common = require('../common');
var constant = require('../constant');
var sub_categoryDAL = require('./sub_category.DAL');
var dbDateFormat = constant.appConfig.DB_DATE_FORMAT;
var d3 = require("d3");
var otherService = require('../other/other.service');
var otherDAL = require('../other/other.DAL');
var async = require('async');
var async_series = require('async');

// var storeService = require('../store/store.service');

/**
 * Created By: CBT
 * Updated By: CBT
 * [addUpdateCategoryService description]
 * @param {[type]}   request [description]
 * @param {Function} cb      [description]
 */
var addUpdateSubCategoryService = async (request,response) => {

  var isValidObject = common.validateObject([request.body]);
  debug("category.service -> updateCategoryService", request.body);
  var isValid = common.validateParams([request.body.sub_category_id,request.body.category_id,request.body.sub_category_name,request.body.description]);
  if(!isValidObject){
    return common.sendResponse(response,constant.requestMessages.ERR_INVALID_CATEGORY_ADD_REQUEST,false);
  }
  else if(!isValid){
    return common.sendResponse(response,constant.requestMessages.ERR_INVALID_CATEGORY_ADD_REQUEST,false);
  }

  var sub_categoryID = request.body.sub_category_id;
  var userID = request.session.userInfo.userId;
  var categoryID = request.body.category_id;
  var sub_categoryName = request.body.sub_category_name;
  var description = request.body.description;
  var imageObj = "";
  var image = '';

  var fileObj = imageObj;
  try {
    if (fileObj != undefined && Object.keys(fileObj).length > 0) {
      var result = otherService.imageUploadMoving(fileObj, constant.appConfig.MEDIA_MOVING_PATH.CATEGORY);
      image = result.data.file;
    }
    await addUpdateSubCategory(sub_categoryID, userID, categoryID, sub_categoryName, description, image, request,response);
  }
  catch(ex) {
    return common.sendResponse(response,constant.userMessages.MSG_ERROR_IN_QUERY,false);
  }
};

/**
 * Created By: CBT
 * Updated By: CBT
 * [addUpdateCategory description]
 * @param {[type]}   categoryID       [description]
 * @param {[type]}   userID           [description]
 * @param {[type]}   categoryName     [description]
 * @param {[type]}   description      [description]
 * @param {[type]}   image            [description]
 * @param {[type]}   request          [description]
 * @param {Function} cb               [description]
 */

async function addUpdateSubCategory(sub_categoryID, userID, categoryID, sub_categoryName, description, image, request, response) {
  var fullUrl = common.getGetMediaURL(request);
  var sub_categoryinfo = {};
  sub_categoryinfo.created_by = userID;
  sub_categoryinfo.name = sub_categoryName;
  sub_categoryinfo.description = description;
  sub_categoryinfo.fk_categoryID = categoryID;


  if (image != '')
    sub_categoryinfo.image = image; //   categoryinfo.imageName = fullUrl + image;
  else
    sub_categoryinfo.image = '';

  var sub_categoryKeys = Object.keys(sub_categoryinfo);
  var fieldValueInsert = [];
  sub_categoryKeys.forEach(function (sub_categoryKey) {
    if (sub_categoryinfo[sub_categoryKey] !== undefined) {
      var fieldValueObj = {};
      fieldValueObj = {
        field: sub_categoryKey,
        fValue: sub_categoryinfo[sub_categoryKey]
      }
      fieldValueInsert.push(fieldValueObj);
    }
  });
  try {
    if (sub_categoryID <= 0) {
      debug("resulted final Add sub_category object -> ", fieldValueInsert);

      let result = await sub_categoryDAL.checkSubCategoryIsExist(sub_categoryinfo.name);
      if (result.status === true && result.content.length != 0) {
        return common.sendResponse(response, constant.categoryMessages.ERR_CATEGORY_EXIST,false);
      }
      if (result.status == true && result.content.length === 0) {
        let result = await sub_categoryDAL.createSubCategory(fieldValueInsert);
        console.log("================== ADD ==============================");
        return common.sendResponse(response, constant.categoryMessages.CATEGORY_ADD_SUCCESS,true);
      }
    }
    else {
      let modifiedObj = {
        field: "modified_date",
        fValue: d3.timeFormat(dbDateFormat)(new Date())
      }
      let result = await sub_categoryDAL.checkSubCategoryIDValid(sub_categoryID);
      if (result.content.length === 0) {
        return common.sendResponse(response, constant.categoryMessages.ERR_REQUESTED_USER_NO_PERMISSION_OF_CATEGORY_UPDATE,false);
      }
      fieldValueInsert.push(modifiedObj);
      debug("resulted final Update sub_category object -> ", fieldValueInsert);
      let res_update  = await sub_categoryDAL.updateSubCategory(fieldValueInsert, sub_categoryID);
      return common.sendResponse(response, constant.categoryMessages.CATEGORY_UPDATE_SUCCESS,true);
    }
  }
  catch(ex) {
    throw ex;
  }
}
/**
 * Created By: CBT
 * Updated By: CBT
 * [getCategoryService description]
 * @param  {[type]}   request [description]
 * @param  {Function} cb      [description]
 * @return {[type]}           [description]
 */
var getSubCategoryService = async function (request,response) {
  debug("SubCategory.service -> getSubCategoryService");

  var getPaginationObject = common.getPaginationObject(request);
  var dbServerDateTime = getPaginationObject.dbServerDateTime;
  var limit = getPaginationObject.limit;
  var pageNo = getPaginationObject.pageNo;
  var serverDateTime = getPaginationObject.serverDateTime
  var sub_categoryID = request.params.sub_categoryID;

  var activeStatus = 1;
  if (request.params.activeStatus != undefined && request.params.activeStatus != "") {
    if (constant.appConfig.VALID_ACTIVE_STATUS_PARAM.indexOf(request.params.activeStatus) > -1) {
      activeStatus = request.params.activeStatus;
    }
    else {
      return common.sendResponse(response, constant.categoryMessages.INVALID_ACTIVE_PARAM,false);
    }
  }

  try {
    let result =  await sub_categoryDAL.getSubCategory(sub_categoryID, activeStatus, dbServerDateTime, limit);
    console.log("==================== SUB CATEGORY ==========================");
    console.log(result);

    var fullUrl = common.getGetMediaURL(request);
    result.content.forEach(function (sub_category) {
      if (sub_category.image_name != undefined && sub_category.image_name != "") {
        sub_category.image_name = common.getGetMediaURL(request) + constant.appConfig.MEDIA_UPLOAD_SUBFOLDERS_NAME.CATEGORY + "large/" + sub_category.image_name;
      }
      else {
        sub_category.image_name = common.getNoImageURL(request);
      }
    });
    return common.sendResponse(response, result.content,true);
  }
  catch(ex) {
    debug(ex);
    return common.sendResponse(response, constant.categoryMessages.ERR_NO_CATEGORY_FOUND,false);
  }
};


/**
 * Created By: CBT
 * Updated By: CBT
 * [deleteCategoryService description]
 * @param  {[type]}   request [description]
 * @param  {Function} cb      [description]
 * @return {[type]}           [description]
 */
var deleteSubCategoryService = async (request,response) => {
  debug("SubCategory.service -> deleteSubCategoryService", request.params.sub_categoryID);

  let isValid = common.validateParams([request.params.sub_categoryID]);
  if(!isValid){
      return common.sendResponse(response,constant.categoryMessages.ERR_INVALID_CATEGORY_DELETE_REQUEST,false);
  }
  else {
    try {
      var sub_categoryID = request.params.sub_categoryID;

      let result = await sub_categoryDAL.checkSubCategoryIDValid(sub_categoryID);
      if (result.content.length === 0) {
            return common.sendResponse(response,constant.categoryMessages.ERR_REQUESTED_USER_NO_PERMISSION_OF_CATEGORY_REMOVE,false);
      }
      let res_remove = await sub_categoryDAL.removeSubCategory(sub_categoryID);
      return common.sendResponse(response,constant.categoryMessages.MSG_CATEGORY_REMOVE_SUCCESSFULLY,true);
    }
    catch(ex) {
      return common.sendResponse(response,constant.userMessages.MSG_ERROR_IN_QUERY,false);
    }
  }
};

module.exports = {
  addUpdateSubCategoryService: addUpdateSubCategoryService,
  getSubCategoryService: getSubCategoryService,
  deleteSubCategoryService: deleteSubCategoryService,
};
