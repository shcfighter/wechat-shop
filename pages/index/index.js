//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false , // loading
    userInfo: {},
    swiperCurrent: 0,  
    selectCurrent:0,
    categories: [],
    activeCategory: "",
    goods:[],
    scrollTop:0,
    loadingMoreHidden:true,

    hasNoCoupons:true,
    coupons: [],
    searchInput: '',

    curPage:1,
    pageSize:20
  },

  tabClick: function (e) {
    this.setData({
      activeCategory: e.currentTarget.id,
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategory);
  },
  //事件处理函数
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },
  toDetailsTap:function(e){
    wx.navigateTo({
      url:"/pages/goods-details/index?id="+e.currentTarget.dataset.id
    })
  },
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function(e) {
     this.setData({  
        selectCurrent: e.index  
    })  
  },
  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: app.globalData.mallName
    })
    wx.request({
      url: app.globalData.domain + '/api/banner',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function(res) {
        //console.log(res)
        if (res.data.status == 404) {
          wx.showModal({
            title: '提示',
            content: '请在后台添加 banner 轮播图片',
            showCancel: false
          })
        } else {
          that.setData({
            banners: res.data.items
          });
        }
      }
    }),
    wx.request({
      url: app.globalData.domain +'/api/category',
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function(res) {
        var categories = [{ category_id: 0, category_name:"全部"}];
        if (res.data.status == 0) {
          for (var i = 0; i < res.data.items.length; i++) {
            categories.push(res.data.items[i]);
          }
        }
        that.setData({
          categories:categories,
          activeCategory:"全部",
          curPage: 1
        });
        that.getGoodsList("全部");
      }
    })
    that.getCoupons ();
    that.getNotice ();
  },
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
   },
  getGoodsList: function (category, append) {
    if (category == 0) {
      category = "";
    }
    var that = this;
    wx.showLoading({
      title: '加载中',
      "mask":true
    })
    wx.request({
      url: app.globalData.domain +'api/commodity/search',
      method: "POST",
      data: {
        category: category,
        keyword: that.data.searchInput,
        page: this.data.curPage,
        pageSize: this.data.pageSize
      },
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function(res) {
        wx.hideLoading()
        //console.log(res.data)        
        if (res.data.status == -1 || res.data.items.length == 0){
          let newData = { loadingMoreHidden: false }
          if (!append) {
            newData.goods = []
          }
          that.setData(newData);
          return
        }
        let goods = [];
        if (append) {
          goods = that.data.goods
        }
        for(var i=0;i<res.data.items.length;i++){
          goods.push(res.data.items[i]);
        }
        that.setData({
          loadingMoreHidden: true,
          goods:goods,
        });
      }
    })
  },
  getCoupons: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/coupons',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: res.data.items
          });
        }
      }
    })
  },
  gitCoupon : function (e) {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/coupon/fetch/' + e.currentTarget.dataset.id,
      method: 'PUT',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if(res.data.status != 0){
          wx.showModal({
            title: '错误',
            content: res.data.message,
            showCancel: false
          });
          return ;
        }
        if (res.data.items == 0) {
          wx.showModal({
            title: '错误',
            content: '来晚了',
            showCancel: false
          })
          return;
        }
        if (res.data.items == 3) {
          wx.showModal({
            title: '错误',
            content: '你领过了，别贪心哦~',
            showCancel: false
          })
          return;
        }
        if (res.data.items == 2) {
          wx.showModal({
            title: '错误',
            content: '已过期~',
            showCancel: false
          })
          return;
        }
        if (res.data.items == 1) {
          wx.showToast({
            title: '领取成功，赶紧去下单吧~',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  getNotice: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/notice/list',
      data: { pageSize :5},
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    })
  },
  listenerSearchInput: function (e) {
    this.setData({
      searchInput: e.detail.value
    })

  },
  toSearch : function (){
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategory);
  },
  onReachBottom: function () {
    this.setData({
      curPage: this.data.curPage+1
    });
    this.getGoodsList(this.data.activeCategory, true)
  },
  onPullDownRefresh: function(){
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategory)
  }
})
