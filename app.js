//app.js
App({
  onLaunch: function () {
    var that = this;    
    // 判断是否登录
    let token = wx.getStorageSync('token');
    //wx.removeStorageSync('token')
    console.log("token: " + token)
    if (!token) {
      that.goLoginPageTimeOut()
      return
    }
    wx.request({
      url: that.globalData.domain + 'api/user/check',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': token
      },
      success: function (res) {
        if (res.data.status != 0) {
          wx.removeStorageSync('token')
          that.goLoginPageTimeOut()
        }
      }
    })
  },
  sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString){
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
      method:'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: wx.getStorageSync('token'),
        type:0,
        module:'order',
        business_id: orderId,
        trigger: trigger,
        template_id: template_id,
        form_id: form_id,
        url:page,
        postJsonString: postJsonString
      },
      success: (res) => {
        //console.log('*********************');
        //console.log(res.data);
        //console.log('*********************');
      }
    })
  },
  sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: wx.getStorageSync('token'),
        type: 0,
        module: 'immediately',
        template_id: template_id,
        form_id: form_id,
        url: page,
        postJsonString: postJsonString
      },
      success: (res) => {
        console.log(res.data);
      }
    })
  },  
  goLoginPageTimeOut: function () {
    setTimeout(function(){
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    }, 1000)
  },
  globalData:{
    domain: "http://localhost:8080/",
    //domain: "http://111.231.132.168/",
    userInfo:null,
    mallName: "天使童装",
    subDomain: "tz", // 如果你的域名是： https://api.it120.cc/abcd 那么这里只要填写 abcd
    version: "4.0.0",
    shareProfile: '百款精品商品，总有一款适合您', // 首页转发的时候话术
    order_reputation_score: '好评送',
    recharge_amount_min: 0.01   //充值最少金额
  }
  /*
  根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒；
  1、/pages/to-pay-order/index.js 中已添加关闭订单、商家发货后提醒消费者；
  2、/pages/order-details/index.js 中已添加用户确认收货后提供用户参与评价；评价后提醒消费者好评奖励积分已到账；
  3、请自行修改上面几处的模板消息ID，参数为您自己的变量设置即可。  
   */
})
