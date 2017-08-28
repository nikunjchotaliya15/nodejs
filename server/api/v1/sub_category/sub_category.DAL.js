var debug = require('debug')('server:api:v1:sub_category:DAL');
var d3 = require("d3");
var DateLibrary = require('date-management');
var common = require('../common');
var constant = require('../constant');
var query = require('./sub_category.query');
var dbDateFormat = constant.appConfig.DB_DATE_FORMAT;

/**
 * Created By: CBT
 * Updated By: CBT
 * [createCategory description]
 * @param  {[type]}   fieldValue [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
var createSubCategory = async (fieldValue) => {
  debug("sub_category.DAL -> createSubCategory");
  var createSubCategory = common.cloneObject(query.createSubCategory);
  createSubCategory.insert = fieldValue;
  return await common.executeQuery(createSubCategory);
};

/**
 * Created By: CBT
 * Updated By: CBT
 * [updateSubCategory description]
 * @param  {[type]}   fieldValue [description]
 * @param  {[type]}   categoryID [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
var updateSubCategory = async (fieldValue, sub_categoryID) => {
  debug("sub_category.DAL -> updateSubCategory");
  var updateSubCategory = common.cloneObject(query.updateSubCategory);
  updateSubCategory.update = fieldValue;
  updateSubCategory.filter.value = sub_categoryID;
  return await common.executeQuery(updateSubCategory);
};

/**
 * Created By: CBT
 * Updated By: CBT
 * [getSubCategory description]
 * @param  {[type]}   dbServerDateTime [description]
 * @param  {[type]}   limit            [description]
 * @param  {Function} cb               [description]
 * @return {[type]}                    [description]
 */
var getSubCategory = async (sub_categoryID, isActive, dbServerDateTime, limit) => {
  debug("sub_category.DAL -> getSubCategory");
  var getSubCategoryQuery = common.cloneObject(query.getSubCategoryQuery);
  var sub_categoryFilter = {
    and: []
  }

  if (sub_categoryID > -1) {
    sub_categoryFilter.and.push({
      field: 'pk_subcategoryID',
      encloseField: false,
      operator: 'EQ',
      value: sub_categoryID
    });
  }

  // if (isActive > -1) {
  //   sub_categoryFilter.and.push({
  //     field: 'isActive',
  //     operator: 'EQ',
  //     value: isActive
  //   });
  // }

  if (sub_categoryID <= 0)
    delete getSubCategoryQuery.filter;
  else
    getSubCategoryQuery.filter = sub_categoryFilter;


  // if (sub_categoryID < 0 && isActive < 0) {
  //   delete getSubCategoryQuery.filter;
  // } else {
  //   getSubCategoryQuery.filter = sub_categoryFilter;
  // }

  // getCategoryQuery.limit = limit;
  return await common.executeQuery(getSubCategoryQuery);
};




/**
 * Created By: CBT
 * Updated By: CBT
 * [checkCategoryIDValid description]
 * @param  {[type]}   categoryID [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
var checkSubCategoryIDValid = async (sub_categoryID) => {
  debug("sub_category.DAL -> checkSubCategoryIDValid");
  var checkSubCateGoryValid = common.cloneObject(query.checkSubCateGoryValidQuery);
  checkSubCateGoryValid.filter = {
    and: [{
      field: 'pk_subcategoryID',
      operator: 'EQ',
      value: sub_categoryID
    }]
  }
  return await common.executeQuery(checkSubCateGoryValid);
};

/**
 * Created By: CBT
 * Updated By: CBT
 * [removeCategory description]
 * @param  {[type]}   categoryId [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
var removeSubCategory = async (sub_categoryId) => {
  debug("sub_category.DAL -> removeSubCategory");
  var removeSubCategoryQuery = common.cloneObject(query.removeSubCategoryQuery);
  removeSubCategoryQuery.filter.value = sub_categoryId;
  return await common.executeQuery(removeSubCategoryQuery);
};

/**
 * Created By: CBT
 * Updated By: CBT
 * [checkCategoryIsExist description]
 * @param  {[type]}   categoryName [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
var checkSubCategoryIsExist = async (sub_category_name) => {
  debug("sub_category.DAL -> checkDeleteSubCategoryIDValid");
  var checkSubCateGoryValid = common.cloneObject(query.checkSubCateGoryValidQuery);
  checkSubCateGoryValid.filter = {
    and: [{
      field: 'name',
      operator: 'EQ',
      value: sub_category_name
    }]
  }
  return await common.executeQuery(checkSubCateGoryValid);
};

module.exports = {
  createSubCategory: createSubCategory,
  updateSubCategory: updateSubCategory,
  getSubCategory: getSubCategory,
  checkSubCategoryIDValid: checkSubCategoryIDValid,
  removeSubCategory: removeSubCategory,
  checkSubCategoryIsExist: checkSubCategoryIsExist,
};
