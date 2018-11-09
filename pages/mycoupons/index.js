//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    coupons:[]
  },
  onLoad: function () {
  },
  onShow : function () {
    this.getMyCoupons();
  },
  getMyCoupons: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/findCoupon',
      data: {
        token: wx.getStorageSync('token'),
        status: 0
      },
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == 0) {
          var coupons = res.data.items;
          if (coupons.length > 0) {
            that.setData({
              coupons: coupons
            });
          }
        }
      }
    })
  },
  goBuy:function(){
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }

})
