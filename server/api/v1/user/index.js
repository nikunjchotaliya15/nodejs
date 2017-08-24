var express = require('express');
var controller = require('./user.controller');
var middleware = require('../../../middleware');

var router = express.Router();
module.exports = router;

router.post('/user-signup', middleware.logger, controller.signup);
router.post('/user-signin', middleware.logger, controller.signin);
router.post('/signout', middleware.checkAccessToken, middleware.logger, controller.signout);
router.post('/user-changepassword', middleware.checkAccessToken, middleware.logger, controller.changePassword);
router.post('/user-forgotpassword', middleware.logger, controller.forgotPassword);
router.get('/get-userlist/:user_type', middleware.checkAccessToken,middleware.userRightsByAPI,middleware.logger, controller.getUserList);
router.post('/user-sendotp', middleware.logger, controller.sendOTP);
router.post('/user-verifyotp', middleware.logger, controller.verifyOTP);
router.post('/addupdate-adminuser',middleware.checkAccessToken,middleware.userRightsByAPI,middleware.logger, controller.addUpdateAdmin);
router.get('/get-adminuser', middleware.checkAccessToken,middleware.userRightsByAPI,middleware.logger, controller.getAdmin);
router.get('/get-userrole/:role_id/:user_type_id',middleware.checkAccessToken,middleware.userRightsByAPI, middleware.logger, controller.getRole);
router.delete('/remove-adminuser/:user_id',middleware.checkAccessToken,middleware.userRightsByAPI, middleware.logger, controller.removeAdmin);
router.post('/user-signin-admin', middleware.logger, controller.signinAdmin);
router.get('/get-usertype', middleware.checkAccessToken,middleware.userRightsByAPI,middleware.logger, controller.getUserType);
