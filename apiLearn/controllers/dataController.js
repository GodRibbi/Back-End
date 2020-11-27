var dbConfig = require('../util/dvconfig');
const WXDecryptContact = require('../controllers/WXDecryptContact');
const uuid = require('node-uuid');
const moment = require('moment');
const crypto = require('crypto');
const axios = require('axios');
const { compile } = require('morgan');
//const xml2json=require('xml2json');
const pushToken = 'zrqhappy';
moment.locale('zh-cn');

getCate = (req, res) => {
    var sql = "select * from post";
    var sqlArr = [];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取指定分类的文章列表
getPostCate = (req, res) => {
    let { id } = req.query;
    var sql = 'select * from post where cate_id=?';
    var sqlArr = [id];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获得商品
getGoods = (req, res) => {
    let pageNo = parseFloat(req.body.pageNo);
    let pageSize = parseFloat(req.body.pageSize);
    let pageNum = pageSize * pageNo;
    if (pageNo == 1) {
        var sql = 'select * from goods limit ?';
        var sqlArr = [pageNum];
    }
    else {
        var sql = 'select * from goods limit ?,?';
        var sqlArr = [pageNum - pageSize, parseFloat(pageSize)];
    }
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获得商品详情页
getGoodsInfo = (req, res) => {
    var info = new Object();
    let { id } = req.body;
    var sql = 'select * from goods where id=?';
    var sqlArr = [id];
    var callBack = (err, data) => {
        if (err) {
            console.log('链接出错')
        }
        else {
            info = data[0];
            //info 对象。。。
            var sql =
                'select image from detailimage where goodsid= ?';
            var sqlArr = [id];

            var callBack = (err, data) => {
                if (err) {
                    console.log('链接出错')
                }
                else {
                    var image = {
                        detailimage: []
                    }
                    var length = Object.keys(data).length;
                    for (let index = 0; index < length; index++) {
                        image.detailimage[index] = data[index].image;
                    }
                    info = Object.assign(info, image);

                    var sql =
                        'select image from swiperimage where goodsid= ?';
                    var sqlArr = [id];
                    var callBack = (err, data) => {
                        if (err) {
                            console.log('链接出错')
                        }
                        else {
                            var image = {
                                swiperimage: []
                            }
                            var length = Object.keys(data).length;
                            for (let index = 0; index < length; index++) {
                                image.swiperimage[index] = data[index].image;
                            }
                            info = Object.assign(info, image);
                            res.send({
                                'success': true,
                                'data': info
                            })

                        }
                    }
                    dbConfig.sqlConnect(sql, sqlArr, callBack);
                }
            }
            dbConfig.sqlConnect(sql, sqlArr, callBack);
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//添加购物车
addShopCart = (req, res) => {
    let userid = req.body.userId;
    let typetext = req.body.typetext;
    let goodsid = parseFloat(req.body.goodsId);
    let num = parseFloat(req.body.num);
    let typeindex = parseFloat(req.body.typeindex);
    let cost = parseFloat(req.body.cost);
    let upnum;
    var sql = 'select num from shopcart where typeindex=? AND userid=? AND goodsid=?';
    var sqlArr = [typeindex, userid, goodsid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            if (Object.keys(data).length === 0) {
                var sql = 'INSERT INTO shopcart (typetext, cost,typeindex,userid,goodsid,num) VALUES (?,?,?,?,?,?)';
                var sqlArr = [typetext, cost, typeindex, userid, goodsid, num];
                var callBack = (err, data) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        res.send({
                            'success': true,
                        })
                    }
                }
                dbConfig.sqlConnect(sql, sqlArr, callBack);
            }
            else {
                upnum = parseFloat(data[0].num) + parseFloat(num);
                //console.log(upnum);
                var sql = 'UPDATE shopcart SET num= ? where typeindex=? AND userid=? AND goodsid=?';
                var sqlArr = [upnum, typeindex, userid, goodsid];
                var callBack = (err, data) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        res.send({
                            'success': true,
                        })
                    }
                }
                dbConfig.sqlConnect(sql, sqlArr, callBack);
            }
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);

}
//获取购物车列表
getCartList = (req, res) => {
    var data1 = {};
    let userid = req.body.userId;
    var sql = 'select * from shopcart where userid= ?';
    var sqlArr = [userid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            //console.log(data);
            data1 = data;
            var goodsids = "";
            var length = Object.keys(data).length;
            if (length == 0) {
                res.send({
                    'success': false,
                })
                return;
            }
            for (let index = 0; index < length; index++) {
                if (index == length - 1) {
                    goodsids += data[index].goodsid;
                }
                else {
                    goodsids += data[index].goodsid + ",";
                }
            }
            var sql = 'select * from goods where id in (' + goodsids + ')';
            var sqlArr = [];
            var callBack = (err, data) => {
                if (err) {
                    console.log(err)
                }
                else {
                    var length1 = Object.keys(data).length;
                    var length2 = Object.keys(data1).length;
                    for (let index1 = 0; index1 < length1; index1++) {
                        for (let index2 = 0; index2 < length2; index2++) {
                            if (data1[index2].goodsid == data[index1].id) {
                                data1[index2] = Object.assign(data1[index2], data[index1]);
                            }
                        }
                    }
                    res.send({
                        'success': true,
                        'data': data1
                    })
                }
            }
            dbConfig.sqlConnect(sql, sqlArr, callBack);
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//保存购物车的更改
saveCartList = (req, res) => {
    let cartid = req.body.cartId;
    let userid = req.body.userId;
    let num = req.body.num;
    var sql = 'UPDATE shopcart SET num= ? WHERE userid= ? and cartId= ?';
    var sqlArr = [num, userid, cartid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//删除购物车中的一个商品
deleteCartList = (req, res) => {
    let cartid = req.body.cartId;
    let userid = req.body.userId;
    var sql = 'DELETE FROM shopcart WHERE userid= ? and cartid= ?';
    var sqlArr = [userid, cartid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//搜索物品
searchGoods = (req, res) => {
    let key = req.body.key;
    let pageNo = parseFloat(req.body.pageNo);
    let pageSize = parseFloat(req.body.pageSize);
    let pageNum = pageSize * pageNo;
    if (pageNo == 1) {
        var sql = 'select * from goods where title like \'%' + key + '%\' limit ?';
        var sqlArr = [pageNum];
    }
    else {
        var sql = 'select * from goods where title like \'%' + key + '%\' limit ?,?';
        var sqlArr = [pageNum - pageSize, parseFloat(pageSize)];
    }
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取主分类
getClassify = (req, res) => {
    var sql = "select * from classify";
    var sqlArr = [];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }

    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取二级分类
getSedClassify = (req, res) => {
    let mainid = req.body.mainId;
    var sql = "select * from sedclassify where mainid =?";
    var sqlArr = [mainid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }

    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//分类查询
searchClassify = (req, res) => {
    let classify = req.body.classify;
    let sedClassify = req.body.sedClassify;
    let pageNo = parseFloat(req.body.pageNo);
    let pageSize = parseFloat(req.body.pageSize);
    let pageNum = pageSize * pageNo;
    if (pageNo == 1) {
        var sql = 'select * from goods where fstclassify = ? and sedclassify = ? limit ?';
        var sqlArr = [classify, sedClassify, pageNum];
    }
    else {
        var sql = 'select * from goods where fstclassify = ? and sedclassify = ? limit ?,?';
        var sqlArr = [classify, sedClassify, pageNum - pageSize, parseFloat(pageSize)];
    }
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//新建用户
saveUsers = (req, res) => {
    let openid = req.body.openid;
    let nickname = req.body.nickname;
    let avatarurl = req.body.avatarurl;
    var sql = 'INSERT INTO users (openid,nickname,avatarurl) VALUES (?,?,?)';
    var sqlArr = [openid, nickname, avatarurl];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//检查用户是否已经创建过
checkUsers = (req, res) => {
    let openid = req.body.openid;
    var sql = 'select * from users where openid =?';
    var sqlArr = [openid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            if (Object.keys(data).length === 0) {
                res.send({
                    'success': false,
                })
            }
            else {
                res.send({
                    'success': true,
                })
            }
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//添加地址
addAddress = (req, res) => {
    let openid = req.body.openid;
    let name = req.body.name;
    let phonenumber = req.body.phonenumber;
    let address = req.body.address;
    let buildingnumber = req.body.buildingnumber;
    let housenumber = req.body.housenumber;
    var sql =
        'INSERT INTO useraddress (openid,name,phonenumber,address,buildingnumber,housenumber) VALUES (?,?,?,?,?,?)';
    var sqlArr = [openid, name, phonenumber, address, buildingnumber, housenumber];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取地址
getAddress = (req, res) => {
    let openid = req.body.openid;
    let id = req.body.id;
    if (openid == null) {
        var sql = 'select * from useraddress where id=?';
        var sqlArr = [id];
    }
    else if (id == null) {
        var sql = 'select * from useraddress where openid=?';
        var sqlArr = [openid];
    }

    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//更新地址
updateAddress = (req, res) => {
    let id = req.body.id;
    let name = req.body.name;
    let phonenumber = req.body.phonenumber;
    let address = req.body.address;
    let buildingnumber = req.body.buildingnumber;
    let housenumber = req.body.housenumber;
    var sql =
        "UPDATE useraddress SET name =?,phonenumber =?,address =?,buildingnumber =?,housenumber =?  WHERE id= ?"
    var sqlArr = [name, phonenumber, address, buildingnumber, housenumber, id];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//删除地址
deleteAddress = (req, res) => {
    let id = req.body.id;
    var sql = 'DELETE FROM useraddress WHERE id= ?';
    var sqlArr = [id];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取物品的配置
getGoodsType = (req, res) => {
    let goodsid = req.body.goodsId;
    var sql = 'select * from goodstype where goodsid=?';
    var sqlArr = [goodsid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//添加订单
addOrders = (req, res) => {
    let openid = req.body.openid;
    let username = req.body.username;
    let wechatname = req.body.wechatname;
    let phonenumber = req.body.phonenumber;
    let address = req.body.address;
    let payway = req.body.payway;
    let protect = req.body.protect;
    let express = req.body.express;
    let invoice = req.body.invoice;
    let notes = req.body.notes;
    let cost = req.body.cost;
    let orderstatus = "正在确定订单";
    let starttime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    let ispay = 1;
    let iscancel = 0;
    const creatuuid = uuid.v1().split('-').join('');
    //console.log(creatuuid);
    var sql = "INSERT INTO orders " +
        "(id,openid,username,wechatname,phonenumber,address,payway,protect,express,invoice,notes,cost,orderstatus,starttime,ispay,iscancel) " +
        "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var sqlArr = [creatuuid, openid, username, wechatname, phonenumber, address, payway, protect, express, invoice, notes, cost, orderstatus, starttime, ispay, iscancel];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'id': creatuuid
            })
        }
    }

    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//添加订单商品
addOrdersGoods = (req, res) => {
    let orderid = req.body.orderid;
    let username = req.body.username;
    let wechatname = req.body.wechatname;
    let goodsid = req.body.goodsid;
    let goodsname = req.body.goodsname;
    let goodsnum = req.body.goodsnum;
    let goodscost = req.body.goodscost;
    let goodstype = req.body.goodstype;
    let goodsimage = req.body.goodsimage;
    var sql = "INSERT INTO ordergoods " +
        "(orderid,username,wechatname,goodsid,goodsname,goodsnum,goodscost,goodstype,goodsimage) " +
        "VALUES (?,?,?,?,?,?,?,?,?)";
    var sqlArr = [orderid, username, wechatname, goodsid, goodsname, goodsnum, goodscost, goodstype, goodsimage];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
            })
        }
    }

    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取订单
getOrders = (req, res) => {
    let openid = req.body.openid;
    var sql = "select * from orders where openid=? and iscancel=0";
    var sqlArr = [openid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            for (let i = 0; i < data.length; i++) {
                var starttimestr = moment(new Date(data[i].starttime).getTime()).format('lll');
                data[i].starttime = starttimestr;
            }
            //console.log(data[0].starttime);
            res.send({
                'success': true,
                'data': data
            })
        }
    }

    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取订单
getOrdersGoods = (req, res) => {
    let orderid = req.body.orderid;
    var sql = "select * from ordergoods where orderid=?";
    var sqlArr = [orderid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }

    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取笔记本通讯
getRecommend = (req, res) => {
    let fstclassify = 'bjb';
    var sql = "select * from goods where fstclassify = ? order by recommend DESC";
    var sqlArr = [fstclassify];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//添加个人定制
addPersonal = (req, res) => {
    let openid = req.body.openid;
    let username = req.body.username;
    let cost = req.body.cost;
    let purpose = req.body.purpose;
    let software = req.body.software;
    let peripherals = req.body.peripherals;
    let configuration = req.body.configuration;
    let otherrequirement = req.body.otherrequirement;
    let status = "正在列出配置单";
    let starttime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    let notes = req.body.notes;
    let iscancel = 0;
    let isfinish = 0;
    var sql = "INSERT INTO personal " +
        "(openid,username,cost,purpose,software,peripherals,configuration,otherrequirement,notes,status,starttime,iscancel,isfinish) " +
        "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
    var sqlArr = [openid, username, cost, purpose, software, peripherals, configuration, otherrequirement, notes, status, starttime, iscancel, isfinish];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取个人定制
getPersonal = (req, res) => {
    let openid = req.body.openid;
    var sql = "select * from personal where openid = ? and iscancel = 0"
    var sqlArr = [openid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            for (let i = 0; i < data.length; i++) {
                var starttimestr = moment(new Date(data[i].starttime).getTime()).format('lll');
                data[i].starttime = starttimestr;
            }
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//取消订单
cancelOrders = (req, res) => {
    let id = req.body.id;
    let openid = req.body.openid;
    var sql = "UPDATE orders SET iscancel = 1 WHERE id = ? and openid = ?"
    var sqlArr = [id, openid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//取消个人定制
cancelPersonal = (req, res) => {
    let id = req.body.id;
    let openid = req.body.openid;
    var sql = "UPDATE personal SET iscancel = 1 WHERE id = ? and openid = ?"
    var sqlArr = [id, openid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取版头广告
getAD = (req, res) => {
    var sql = "select * from ad"
    var sqlArr = [];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//获取物品的颜色
getGoodsColors = (req, res) => {
    let goodsid = req.body.goodsId;
    var sql = 'select * from goodscolors where goodsid=?';
    var sqlArr = [goodsid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true,
                'data': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//验证服务器推送url地址
checkPush = (req, res) => {
    console.log(req.query);
    let signature = req.query.signature,
        timestamp = req.query.timestamp,
        nonce = req.query.nonce,
        echostr = req.query.echostr;
    let a = crypto.createHash('sha1').update([pushToken, timestamp, nonce].sort().join('')).digest('hex');  // 这里的pushToken就是在上面的那里配置的Token

    if (a == signature) {
        // 如果验证成功则原封不动的返回
        res.send(echostr);
    } else {
        res.send({
            status: 400,
            data: "check msg error"
        })
    }
};
sha1 = function (...arr) {
    return crypto.createHash('sha1').update(arr.sort().join('')).digest('hex');
};
//客服接收到的消息
handleCustomerSevice = (req, res) => {
    req.rawBody = '';//添加接收变量
    var json = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        req.rawBody += chunk;
    });
    req.on('end', function () {
        // console.log(req.body);
        // console.log('接收到了消息，请求url中');
        //console.log(req.query);
        let signature = req.query.signature,
            timestamp = req.query.timestamp,
            nonce = req.query.nonce,
            openid = req.query.openid,
            encrypt_type = req.query.encrypt_type,
            msg_signature = req.query.msg_signature,
            msg_encrypt = JSON.parse(req.rawBody).Encrypt; // 密文体

        // 开发者计算签名
        let devMsgSignature = crypto.createHash('sha1').update([pushToken, timestamp, nonce, msg_encrypt].sort().join('')).digest('hex');
        //console.log(devMsgSignature);
        if (devMsgSignature == msg_signature) {
            //console.log('验证成功,是从微信服务器转发过来的消息');
            const decryptData = WXDecryptContact(msg_encrypt);
            //console.log(decryptData);
            let access_token = '';
            axios.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx9b08d479caaa4175&secret=15fa7794d3f1ce7b03903af4ae22c514')
                .then(res => {
                    //console.log('获取access_token成功');
                    //console.log(decryptData);
                    access_token = res.data.access_token;
                    var gotopay = /gotopay/;
                    if (decryptData.Content == '微信支付') {
                        axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send' + '?access_token=' + access_token, {
                            touser: decryptData.FromUserName,
                            msgtype: "link",
                            link: {
                                "title": "微信支付",
                                "description": "微信支付码",
                                "url": "https://www.zcxyyz.top/images/wxpaycode.png",
                                "thumb_url": "THUMB_URL"
                            }
                        })
                            .then(res => {
                                //console.log('消息接口发送成功');
                                //console.log(res.data);
                                if (res.data.errcode == 0) {
                                    console.log('消息发送成功');
                                } else if (res.data.errcode == 40001) {
                                    console.log('access_token过期');
                                } else {
                                    console.log('其他错误信息');
                                    console.log(res.data);
                                }
                                //console.log(res.data);
                            })
                            .catch(err => {
                                console.log('错误消息');
                                console.log(err);
                            })
                    }
                    else if (decryptData.Content == '支付宝支付') {
                        axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send' + '?access_token=' + access_token, {
                            touser: decryptData.FromUserName,
                            msgtype: "link",
                            link: {
                                "title": "支付宝支付",
                                "description": "支付宝支付码",
                                "url": "https://qr.alipay.com/fkx14082hnrqw2v91y53l02",
                                "thumb_url": "THUMB_URL"
                            }
                        })
                            .then(res => {
                                //console.log('消息接口发送成功');
                                //console.log(res.data);
                                if (res.data.errcode == 0) {
                                    console.log('消息发送成功');
                                } else if (res.data.errcode == 40001) {
                                    console.log('access_token过期');
                                } else {
                                    console.log('其他错误信息');
                                    console.log(res.data);
                                }
                                //console.log(res.data);
                            })
                            .catch(err => {
                                console.log('错误消息');
                                console.log(err);
                            })
                    }
                    else if (decryptData.SessionFrom == 'wxapp') {
                        //console.log(num);
                        axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send' + '?access_token=' + access_token, {
                            touser: decryptData.FromUserName,
                            msgtype: "text",
                            text: {
                                "content": "由于小程序客服的变态机制\n请扫描下方二维码添加客服好友\n达到咨询目的\n或者可以添加我们的QQ群\n1048294606\n\n长按二维码即可扫描！\n长按二维码即可扫描！\n长按二维码即可扫描！"
                            }
                        })
                            .then(res => {
                                //console.log('消息接口发送成功');
                                //console.log(res.data);
                                if (res.data.errcode == 0) {
                                    console.log('消息发送成功');
                                } else if (res.data.errcode == 40001) {
                                    console.log('access_token过期');
                                } else {
                                    console.log('其他错误信息');
                                    console.log(res.data);
                                }
                                //console.log(res.data);
                            })
                            .catch(err => {
                                console.log('错误消息');
                                console.log(err);
                            })
                        axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send' + '?access_token=' + access_token, {
                            touser: decryptData.FromUserName,
                            msgtype: "link",
                            link: {
                                "title": "客服账号",
                                "description": "客服账号码",
                                "url": "https://www.zcxyyz.top/images/kefu.png",
                                "thumb_url": "THUMB_URL"
                            }
                        })
                            .then(res => {
                                //console.log('消息接口发送成功');
                                //console.log(res.data);
                                if (res.data.errcode == 0) {
                                    console.log('消息发送成功');
                                } else if (res.data.errcode == 40001) {
                                    console.log('access_token过期');
                                } else {
                                    console.log('其他错误信息');
                                    console.log(res.data);
                                }
                                //console.log(res.data);
                            })
                            .catch(err => {
                                console.log('错误消息');
                                console.log(err);
                            })
                    }
                    else if (gotopay.test(decryptData.SessionFrom)) {
                        var num = decryptData.SessionFrom.replace(/[^0-9]/ig, "");
                        //console.log(num);
                        axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send' + '?access_token=' + access_token, {
                            touser: decryptData.FromUserName,
                            msgtype: "text",
                            text:
                            {
                                "content": "请用该链接支付\n\n\n您需要支付" + num + "元\n\n\n" + "抱歉无法使用官方支付，敬请谅解！\n" + "如需使用支付包支付，请回复‘支付宝支付’\n"
                                    + "如果支付昵称非‘白驹数码（**祺）’请勿支付！\n\n支付成功后可以到\n我的-我的订单\n中查看详情\n\n长按二维码即可快速支付！\n长按二维码即可快速支付！\n长按二维码即可快速支付！"
                            }
                        })
                            .then(res => {
                                //console.log('消息接口发送成功');
                                //console.log(res.data);
                                if (res.data.errcode == 0) {
                                    console.log('消息发送成功');
                                } else if (res.data.errcode == 40001) {
                                    console.log('access_token过期');
                                } else {
                                    console.log('其他错误信息');
                                    console.log(res.data);
                                }
                                //console.log(res.data);
                            })
                            .catch(err => {
                                console.log('错误消息');
                                console.log(err);
                            })
                        axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send' + '?access_token=' + access_token, {
                            touser: decryptData.FromUserName,
                            msgtype: "link",
                            link: {
                                "title": "微信支付",
                                "description": "微信支付码",
                                "url": "https://www.zcxyyz.top/images/wxpaycode.png",
                                "thumb_url": "THUMB_URL"
                            }
                        })
                            .then(res => {
                                //console.log('消息接口发送成功');
                                //console.log(res.data);
                                if (res.data.errcode == 0) {
                                    console.log('消息发送成功');
                                } else if (res.data.errcode == 40001) {
                                    console.log('access_token过期');
                                } else {
                                    console.log('其他错误信息');
                                    console.log(res.data);
                                }
                                //console.log(res.data);
                            })
                            .catch(err => {
                                console.log('错误消息');
                                console.log(err);
                            })
                    }
                })
            res.send('success');
        } else {
            console.log('error');
            res.send('error');
        }
    });
};
//增加一项报名信息
addSoloKing = (req, res) => {
    let openid = req.body.openid;
    let username = req.body.username;
    let nickname = req.body.nickname;
    let qqid = req.body.qqid;
    let wxid = req.body.wxid;
    let phonenumber = req.body.phonenumber;
    let fstregion = req.body.fstregion;
    let region = req.body.region;
    let pos = req.body.pos;
    let urlimg = req.body.urlimg;

    var sql = "INSERT INTO soloking " +
        "(openid,username,nickname,qqid,wxid,phonenumber,fstregion,region,pos,urlimg) " +
        "VALUES (?,?,?,?,?,?,?,?,?,?)";
    var sqlArr = [openid, username, nickname, qqid, wxid, phonenumber, fstregion, region, pos, urlimg];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
//检查是否报名
checkSoloKing = (req, res) => {
    let openid = req.body.openid;

    var sql = "SELECT * FROM soloking WHERE openid = ?";
    var sqlArr = [openid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            //console.log(data);
            if (data.length == 0) {
                res.send({
                    'success': false
                })
            }
            else {
                res.send({
                    'success': true
                })
            }

        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}
cancelSoloKing = (req, res) => {
    let openid = req.body.openid;

    var sql = "DElETE FROM soloking WHERE openid = ?";
    var sqlArr = [openid];
    var callBack = (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({
                'success': true
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
}



module.exports = {
    getCate,
    getPostCate,
    getGoods,
    getGoodsInfo,
    addShopCart,
    getCartList,
    saveCartList,
    deleteCartList,
    searchGoods,
    getClassify,
    getSedClassify,
    searchClassify,
    saveUsers,
    checkUsers,
    addAddress,
    getAddress,
    updateAddress,
    deleteAddress,
    getGoodsType,
    addOrders,
    addOrdersGoods,
    getOrders,
    getOrdersGoods,
    getRecommend,
    addPersonal,
    getPersonal,
    cancelOrders,
    cancelPersonal,
    getAD,
    getGoodsColors,
    checkPush,
    handleCustomerSevice,
    addSoloKing,
    checkSoloKing,
    cancelSoloKing
}