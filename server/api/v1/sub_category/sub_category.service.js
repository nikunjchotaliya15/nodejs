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
var addUpdateSubCategoryService = (request, cb) => {
  debug("sub_category.service -> updateSubCategoryService", request.body);
  if (request.body.sub_category_name === undefined ||  request.body.sub_category_name === "" || request.body.sub_category_id === undefined || request.body.sub_category_id === "") {
    cb({
      status: false,
      error: constant.requestMessages.ERR_INVALID_CATEGORY_ADD_REQUEST
    });
    return;
  }
  var sub_categoryID = request.body.sub_category_id;
  var userID = request.session.userInfo.userId;
  var categoryID = request.body.category_id;
  var sub_categoryName = request.body.sub_category_name;
  var description = request.body.description;
  var imageObj = "";
  var image = '';

  var fileObj = imageObj;
  if (fileObj != undefined && Object.keys(fileObj).length > 0) {

    otherService.imageUploadMoving(fileObj, constant.appConfig.MEDIA_MOVING_PATH.CATEGORY, function (result) {
      if (result.status === false) {
        cb(result);
        return;
      }
      image = result.data.file;
      addUpdateSubCategory(sub_categoryID, userID, categoryID, sub_categoryName, description, image, request, function (data) {
        cb(data);
        return;
      });
    });
  } else {
    addUpdateSubCategory(sub_categoryID, userID, categoryID, sub_categoryName, description, image, request, function (data) {
      cb(data);
      return;
    });
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
function addUpdateSubCategory(sub_categoryID, userID, categoryID, sub_categoryName, description, image, request, cb) {
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
  if (sub_categoryID <= 0) {
    debug("resulted final Add sub_category object -> ", fieldValueInsert);
    let sub_category_id = 0;
    async.series([
      function(cb) {
        sub_categoryDAL.checkSubCategoryIsExist(sub_categoryinfo.name, function (result) {
          if (result.status === true && result.content.length != 0) {
            cb(constant.categoryMessages.ERR_CATEGORY_EXIST,null);
            return;
          }
          cb();
        });
      },
      function(cb) {
        sub_categoryDAL.createSubCategory(fieldValueInsert, function (result) {
          if (result.status === false) {
            cb(result.error,null);
            return;
          }
          else {
            sub_category_id= result.content.insertId;
            cb();
          }
        });
      }],
    function(err,result) {
      if (err) {
        cb({status:false,err:err});
        return;
      }
      cb( { status: true,
         data: constant.categoryMessages.CATEGORY_ADD_SUCCESS,
         sub_category_id: sub_category_id });
         return;
    });
  }
  else {
    let modifiedObj = {
      field: "modified_date",
      fValue: d3.timeFormat(dbDateFormat)(new Date())
    }
    async.series ([
      function(cb) {
        sub_categoryDAL.checkSubCategoryIDValid(sub_categoryID, function (result) {
          if (result.status === false) {
            cb(result.error,null);
            return;
          }
          if (result.content.length === 0) {
            cb(constant.categoryMessages.ERR_REQUESTED_USER_NO_PERMISSION_OF_CATEGORY_UPDATE,null);
            return;
          }
          fieldValueInsert.push(modifiedObj);
          cb();
      });
    },
    function(cb) {
      debug("resulted final Update sub_category object -> ", fieldValueInsert);
      sub_categoryDAL.updateSubCategory(fieldValueInsert, sub_categoryID, function (result) {
        if (result.status === false) {
          cb(result.error,null);
        }
        else
          cb();
      });
    }
  ],
  function(err,result) {
    if (err) {
      }
    else {
      cb({ status: true,
      data: constant.categoryMessages.CATEGORY_UPDATE_SUCCESS })
    }
  })
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
var getSubCategoryService = (request, cb) => {
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
    } else {
      cb({
        status: false,
        error: constant.otherMessage.INVALID_ACTIVE_PARAM
      });
      return;
    }
  }

  sub_categoryDAL.getSubCategory(sub_categoryID, activeStatus, dbServerDateTime, limit, function (result) {
    if (result.status == false) {
      cb({
        status: false,
        error: constant.categoryMessages.ERR_NO_CATEGORY_FOUND
      });
      return;
    } else {
      var fullUrl = common.getGetMediaURL(request);
      result.content.forEach(function (sub_category) {


        if (sub_category.image_name != undefined && sub_category.image_name != "") {
          sub_category.image_name = common.getGetMediaURL(request) + constant.appConfig.MEDIA_UPLOAD_SUBFOLDERS_NAME.CATEGORY + "large/" + sub_category.image_name;
        } else {
          sub_category.image_name = common.getNoImageURL(request);
        }
      });
      cb({
        status: true,
        data: result.content
      });
    }
  });
};



/**
 * Created By: CBT
 * Updated By: CBT
 * [deleteCategoryService description]
 * @param  {[type]}   request [description]
 * @param  {Function} cb      [description]
 * @return {[type]}           [description]
 */
var deleteSubCategoryService = (request, cb) => {
  debug("SubCategory.service -> deleteSubCategoryService", request.params.sub_categoryID);

  if (request.params.sub_categoryID === undefined) {
    cb({
      status: false,
      error: constant.requestMessages.ERR_INVALID_CATEGORY_DELETE_REQUEST
    });
    return;
  } else {
    var sub_categoryID = request.params.sub_categoryID;
    // var userID = request.session.userInfo.userId;

    sub_categoryDAL.checkSubCategoryIDValid(sub_categoryID, (result) => {
      if (result.status === false) {
        cb(result);
        return;
      }
      if (result.content.length === 0) {
        cb({
          status: false,
          error: constant.categoryMessages.ERR_REQUESTED_USER_NO_PERMISSION_OF_CATEGORY_REMOVE
        });
        return;
      }

      sub_categoryDAL.removeSubCategory(sub_categoryID, (result) => {
        if (result.status === false) {
          cb(result);
          return
        }
        cb({
          status: true,
          data: constant.categoryMessages.MSG_CATEGORY_REMOVE_SUCCESSFULLY
        })
      });
    });
  }
};



module.exports = {
  addUpdateSubCategoryService: addUpdateSubCategoryService,
  getSubCategoryService: getSubCategoryService,
  deleteSubCategoryService: deleteSubCategoryService,
};
