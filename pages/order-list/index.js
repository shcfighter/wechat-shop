var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({
  data:{
    statusType: ["全部", "待付款", "待发货", "待收货", "待评价", "已完成", "退款中"],
    currentType:0,
    loadingMoreHidden: true,
    tabClass: ["", "", "", "", ""],
    page: 1,
    pageSize: 10,
    orderList: []
  },
  statusTap:function(e){
     var curType =  e.currentTarget.dataset.index;
     this.data.currentType = curType
     this.setData({
       currentType:curType
     });
     this.onShow();
  },
  orderDetail : function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  cancelOrderTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
     wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: app.globalData.domain + 'api/order/cancel/' + orderId,
            method: "PUT",
            data: {},
            header: {
              'content-type': 'application/json', // 默认值
              'token': wx.getStorageSync('token')
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data.status == -1 || res.data.items == -1) {
                wx.showModal({
                  title: '错误',
                  content: '取消订单失败',
                  showCancel: false
                })
                return;
              }
              console.log("success");
              that.onShow();
            }
          })
        }
      }
    })
  },
  toPayTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    console.log("orderId: " + orderId + ", money: " + money)
    wxpay.wxpay(app, money, orderId, "/pages/order-list/index");
  },
  onLoad:function(e){
    // 生命周期函数--监听页面加载
    var curType = e.type;
    if(curType){
      this.data.currentType = curType;
      this.setData({
        currentType: curType
      });
    }
  },
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
 
  },
  getOrderStatistics : function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/statistics',
      data: { token: wx.getStorageSync('token') },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          var tabClass = that.data.tabClass;
          if (res.data.data.count_id_no_pay > 0) {
            tabClass[0] = "red-dot"
          } else {
            tabClass[0] = ""
          }
          if (res.data.data.count_id_no_transfer > 0) {
            tabClass[1] = "red-dot"
          } else {
            tabClass[1] = ""
          }
          if (res.data.data.count_id_no_confirm > 0) {
            tabClass[2] = "red-dot"
          } else {
            tabClass[2] = ""
          }
          if (res.data.data.count_id_no_reputation > 0) {
            tabClass[3] = "red-dot"
          } else {
            tabClass[3] = ""
          }
          if (res.data.data.count_id_success > 0) {
            //tabClass[4] = "red-dot"
          } else {
            //tabClass[4] = ""
          }

          that.setData({
            tabClass: tabClass,
          });
        }
      }
    })
  },
  onShow:function(){
    this.setData({
      page: 1,
      loadingMoreHidden: true
    });
    this.getOrderList();
  },
  getOrderList: function (append){
    // 获取订单列表
    wx.showLoading();
    var that = this;
    //this.getOrderStatistics();
    wx.request({
      url: app.globalData.domain + 'api/order/list',
      data: {
        'status': that.data.currentType,
        'page': that.data.page,
        'pageSize': that.data.pageSize
      },
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.status == 0) {
          if(res.data.items.length == 0){
            that.setData({
              loadingMoreHidden: false
            });
          }
          let orderList = [];
          if (append){
            orderList = that.data.orderList;
          }
          
          for (var i = 0; i < res.data.items.length; i++) {
            orderList.push(res.data.items[i]);
          }
          that.setData({
            orderList: orderList
          });
        } else {
          this.setData({
            orderList: []
          });
        }
      }
    })
  },
  onHide:function(){
    // 生命周期函数--监听页面隐藏
 
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
 
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
   
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
    this.setData({
      page: this.data.page + 1
    });
    this.getOrderList(true);
  }
})
