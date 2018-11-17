//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    coupons:[],
    currentType: 0
  },
  statusTap: function (e) {
    var curType = e.currentTarget.dataset.index;
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  onLoad: function () { 
  },
  onShow : function () {
    this.getMyCoupons();
  },
  getMyCoupons: function () {
    var that = this;
    wx.showLoading({
      mask: true
    });
    wx.request({
      url: app.globalData.domain + 'api/findCouponStatus',
      data: {
        status: that.data.currentType
      },
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.status == 0) {
          that.setData({
            coupons: res.data.items
          });
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
