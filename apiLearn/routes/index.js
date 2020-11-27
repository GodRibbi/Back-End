var express = require('express');
var router = express.Router();
var cate=require('../controllers/dataController')


/* GET home page. */
router.get('/',cate.getCate);
router.post('/getPostCate',cate.getPostCate);
router.post('/getGoods',cate.getGoods);
router.post('/getGoodsInfo',cate.getGoodsInfo);
router.post('/addShopCart',cate.addShopCart);
router.post('/getCartList',cate.getCartList);
router.post('/saveCartList',cate.saveCartList);
router.post('/deleteCartList',cate.deleteCartList);
router.post('/searchGoods',cate.searchGoods);
router.post('/getClassify',cate.getClassify);
router.post('/getSedClassify',cate.getSedClassify);
router.post('/searchClassify',cate.searchClassify);
router.post('/saveUsers',cate.saveUsers);
router.post('/checkUsers',cate.checkUsers);
router.post('/addAddress',cate.addAddress);
router.post('/getAddress',cate.getAddress);
router.post('/updateAddress',cate.updateAddress);
router.post('/deleteAddress',cate.deleteAddress);
router.post('/getGoodsType',cate.getGoodsType);
router.post('/addOrders',cate.addOrders);
router.post('/addOrdersGoods',cate.addOrdersGoods);
router.post('/getOrders',cate.getOrders);
router.post('/getOrdersGoods',cate.getOrdersGoods);
router.post('/getRecommend',cate.getRecommend);
router.post('/addPersonal',cate.addPersonal);
router.post('/getPersonal',cate.getPersonal);
router.post('/cancelOrders',cate.cancelOrders);
router.post('/cancelPersonal',cate.cancelPersonal);
router.post('/getAD',cate.getAD);
router.post('/getGoodsColors',cate.getGoodsColors);
router.post('/addSoloKing',cate.addSoloKing);
router.post('/checkSoloKing',cate.checkSoloKing);
router.post('/cancelSoloKing',cate.cancelSoloKing);

router.get('/checkPush',cate.checkPush);
router.post('/checkPush',cate.handleCustomerSevice);
module.exports = router;