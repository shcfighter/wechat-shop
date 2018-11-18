var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({
  data:{
    currentType:0,
    loadingMoreHidden: true,
    tabClass: ["", "", "", "", ""],
    page: 1,
    pageSize: 10,
    historyList: []
  },
  statusTap:function(e){
     var curType =  e.currentTarget.dataset.index;
     this.data.currentType = curType
     this.setData({
       currentType:curType
     });
     if(curType == 0){
       wx.setNavigationBarTitle({
         title: "我的收藏"
       })
     } else {
       wx.setNavigationBarTitle({
         title: "我的足迹"
       })
     }
    
     this.onShow();
  },
  commmodityDetail : function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + orderId
    })
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
  onShow:function(){
    this.setData({
      page: 1,
      loadingMoreHidden: true
    });
    this.getHistoryList();
  },
  getHistoryList: function (append){
    wx.showLoading({
      mask: true
    });
    var that = this;
    var url = "api/collect/list";
    if (this.data.currentType == 1){
      url = "api/browse/list";
    }
    wx.request({
      url: app.globalData.domain + url,
      data: {
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
          if (res.data.items.length == 0 && append){
            that.setData({
              loadingMoreHidden: false
            });
          }
          let historyList = [];
          if (append){
            historyList = that.data.historyList;
          }
          
          for (var i = 0; i < res.data.items.length; i++) {
            if (this.data.currentType == 1) {
              historyList.push(res.data.items[i].commodity);;
            } else {
              historyList.push(JSON.parse(res.data.items[i].commodity));
            }
          }
          that.setData({
            historyList: historyList
          });
        } else {
          this.setData({
            historyList: []
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
    this.getHistoryList(true);
  }
})
