const app = getApp()

Page({
	data: {
    balance:0,
    freeze:0,
    score:0,
    score_sign_continuous:0,
    browseNum: 0,
    collectNum: 0,
    cartNum: 0,
    couponNum: 0
  },
	onLoad() {
	},	
  onShow() {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    } else {
      that.setData({
        userInfo: userInfo,
        version: app.globalData.version
      })
    }
    this.getUserApiInfo();
    this.checkScoreSign();
    this.getBrowseNum(); 
    this.getCollectNum();
    this.getCartNum();
    this.getCouponNum();
  },
  getCouponNum: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/coupon/num',
      method: 'GET',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == 0) {
          that.data.couponNum = res.data.items;
          that.setData({
            couponNum: res.data.items
          });
        }
      }
    });
  },
  getCartNum: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/cart/num',
      method: 'GET',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == 0) {
          that.data.cartNum = res.data.items;
          that.setData({
            cartNum: res.data.items
          });
        }
      }
    });
  },
  getBrowseNum: function(){
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/browse/num',
      method: 'GET',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if(res.data.status == 0){
          that.data.browseNum = res.data.items;
          that.setData({
            browseNum: res.data.items
          });
        }
      }
    });
  },
  getCollectNum: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/collect/num',
      method: 'GET',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == 0) {
          that.data.collectNum = res.data.items;
          that.setData({
            collectNum: res.data.items
          });
        }
      }
    });
  },
  aboutUs : function () {
    wx.showModal({
      title: '关于我们',
      content: '本系统是微信小程序商城体验版，祝大家使用愉快！',
      showCancel:false
    })
  },
  getPhoneNumber: function(e) {
    console.log(e)
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        title: '提示',
        content: '无法获取手机号码',
        showCancel: false
      })
      return;
    }
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/user/mobile',
      method: 'PUT',
      data: {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      },
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000
          })
          that.getUserApiInfo();
        } else {
          wx.showModal({
            title: '提示',
            content: '绑定失败',
            showCancel: false
          })
        }
      }
    })
  },
  getUserApiInfo: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/detail',
      data: {
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            apiUserInfoMap: res.data.data,
            userMobile: res.data.data.base.mobile
          });
        }
      }
    })

  },
  checkScoreSign: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/integration/num',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == 0) {
          that.setData({
            score: res.data.items
          });
        }
      }
    })
  },
  scoresign: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/signIn',
      method: 'PUT',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == -1) {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          });
          return;
        }
		if (res.data.items == -1) {
          // wx.showModal({
          //   title: '错误',
          //   content: "当天已签到",
          //   showCancel: false
          // });
          wx.showToast({
            title: '当天已签到',
            icon: 'none',
            duration: 2000
          })
          return;
        }
        that.checkScoreSign();
      }
    })
  },
  relogin:function(){
    wx.navigateTo({
      url: "/pages/authorize/index"
    })
  }
})