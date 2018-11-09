// pages/authorize/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  bindGetUserInfo: function(e) {
    if (!e.detail.userInfo) {
      return;
    }
    wx.setStorageSync('userInfo', e.detail.userInfo)
    this.login();
  },
  login: function() {
    let that = this;
    let token = wx.getStorageSync('token');
    console.log("login token : " + token);
    if (token) {
      wx.request({
        url: app.globalData.domain + '/api/user/check',
        data: {},
        header: {
          'content-type': 'application/json', // 默认值
          'token': token
        },
        success: function(res) {
          if (res.data.status != 0) {
            wx.removeStorageSync('token')
            console.log("check token fail ");
            that.login();
          } else {
            // 回到原来的地方放
            console.log("check token success back");
            wx.navigateBack();
          }
        }
      })
      return;
    }
    wx.login({
      success: function(res) {
        console.log(res.code);
        wx.request({
          url: app.globalData.domain + 'api/accredit',
          data: {
            code: res.code
          },
          success: function(res) {
            //console.log(res)
            if (res.data.status != 0) {
              // 登录错误
              console.log("login token fail");
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: '无法登录，请重试',
                showCancel: false
              })
              return;
            }

            wx.setStorageSync('token', res.data.items.token)
            wx.setStorageSync('uid', res.data.items.uid)
            // 回到原来的地方放
            console.log("login token success back");
            
            wx.navigateBack();
          }
        })
      }
    })
  }
})