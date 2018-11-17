//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail:{},
    swiperCurrent: 0,  
    hasMoreSelect:false,
    selectSize:"选择：",
    selectSizePrice:0,
    totalScoreToPay: 0,
    shopNum:0,
    hideShopPopup:true,
    buyNumber:0,
    buyNumMin:1,
    buyNumMax:0,
    specifition_name:"",
    canSubmit:false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo:{},
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
  },

  //事件处理函数
  swiperchange: function(e) {
    this.setData({  
      swiperCurrent: e.detail.current  
    })  
  },
  onLoad: function (e) {
    if (e.inviter_id) {
      wx.setStorage({
        key: 'inviter_id_' + e.id,
        data: e.inviter_id
      })
    }
    var that = this;
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function(res) {
        that.setData({
          shopCarInfo:res.data
        });
      } 
    })
    wx.request({
      url: app.globalData.domain +'api/commodity/detail/' + e.id,
      data: {},
      method: "GET",
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function(res) {
        var selectSizeTemp = "";
        if (res.data.items.basicInfo.properties) {
          for (var i = 0; i < res.data.items.basicInfo.properties.length;i++){
            selectSizeTemp = selectSizeTemp + " " + res.data.items.basicInfo.properties[i].name;
          }
          that.setData({
            hasMoreSelect:true,
            selectSize:that.data.selectSize + selectSizeTemp,
            selectSizePrice:res.data.items.basicInfo.price,
            totalScoreToPay: res.data.items.basicInfo.minScore ? 0 : 0
          });
        }
        that.data.goodsDetail = res.data.items;
        if (res.data.items.basicInfo.videoId) {
          that.getVideoSrc(res.data.items.basicInfo.videoId);
        }
        that.setData({
          goodsDetail:res.data.items,
          selectSizePrice:res.data.items.basicInfo.price,
          totalScoreToPay: res.data.items.basicInfo.minScore ? 0 : 0,
          buyNumMax:res.data.items.basicInfo.num,
          buyNumber: (res.data.items.basicInfo.num>0) ? 1: 0
        });
        WxParse.wxParse('article', 'html', res.data.items.content, that, 5);
      }
    })
    this.cartNum();
    this.isCollect(e.id);
    this.reputation(e.id);
    
  },
  cartNum: function(){
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/cart/num',
      data: {},
      method: "GET",
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == 0) {
          that.data.shopNum = res.data.items;
          that.setData({
            shopNum: res.data.items
          });
        }
      }
    });
  },
  isCollect: function(id){
    var that = this;
    //判断是否收藏
    wx.request({
      url: app.globalData.domain + 'api/collect/findCommodity/' + id,
      data: {},
      method: "GET",
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if(res.data.status == 0 && res.data.items == 0){
          that.setData({
            is_collect: true
          });
        }
      }
    })
  },
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  toCollect: function () {
    var that = this;
    //收藏
    wx.request({
      url: app.globalData.domain + 'api/collect/' + this.data.goodsDetail.basicInfo.commodity_id,
      data: {},
      method: "PUT",
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status != 0) {
          wx.showModal({
            title: '错误',
            content: '收藏失败',
            showCancel: false
          })
          return;
        }
        var isCollect = false;
        if(res.data.items == 0){
          isCollect = true;
        }
        that.setData({
          is_collect: isCollect
        });
      }
    });
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy",
      selectSizePrice: this.data.goodsDetail.basicInfo.price
    });
    this.bindGuiGeTap();
  },  
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function() {
     this.setData({  
        hideShopPopup: false 
    })  
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function() {
     this.setData({  
        hideShopPopup: true 
    })  
  },
  numJianTap: function() {
     if(this.data.buyNumber > this.data.buyNumMin){
        var currentNum = this.data.buyNumber;
        currentNum--; 
        this.setData({  
            buyNumber: currentNum
        })  
     }
  },
  numJiaTap: function() {
     if(this.data.buyNumber < this.data.buyNumMax){
        var currentNum = this.data.buyNumber;
        currentNum++ ;
        this.setData({  
            buyNumber: currentNum
        })  
     }
  },
  /**
   * 选择商品规格
   * @param {Object} e
   */
  labelItemTap: function(e) {
    var that = this;
    
    //console.log(e)
    //console.log(e.currentTarget.dataset.propertyid)
    //console.log(e.currentTarget.dataset.propertyname)
    //console.log(e.currentTarget.dataset.propertychildid)
    //console.log(e.currentTarget.dataset.propertychildname)
    
    // 取消该分类下的子栏目所有的选中状态
    
    var childs = that.data.goodsDetail.basicInfo.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;

    for(var i = 0;i < childs.length;i++){
      that.data.goodsDetail.basicInfo.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.basicInfo.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    // 获取所有的选中规格尺寸数据
    var needSelectNum = that.data.goodsDetail.basicInfo.properties.length;
    var curSelectNum = 0;
    var specifition_name = "";
    for (var i = 0; i < that.data.goodsDetail.basicInfo.properties.length;i++) {
      childs = that.data.goodsDetail.basicInfo.properties[i].childsCurGoods;
      for (var j = 0;j < childs.length;j++) {
        if(childs[j].active){
          curSelectNum++;
          specifition_name = specifition_name + that.data.goodsDetail.basicInfo.properties[i].name + ":"+ childs[j].name +";";
        }
      }
    }
    var canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    // 计算当前价格
    if (canSubmit) {
      console.log(specifition_name)
      var url = "api/commodity/price/";
      if (specifition_name && specifition_name != "") {
        url = "api/commodity/specifition/price/";
      }
      wx.request({
        url: app.globalData.domain + url + that.data.goodsDetail.basicInfo.commodity_id,
        method: "POST",
        data: {
          commodity_id: that.data.goodsDetail.basicInfo.commodity_id,
          specifition_name: specifition_name
        },
        header: {
          'content-type': 'application/json', // 默认值
          'token': wx.getStorageSync('token')
        },
        success: function(res) {
          that.setData({
            selectSizePrice:res.data.items.price,
            totalScoreToPay: res.data.items.score ? 0 : 0,
            specifition_name: specifition_name,
            buyNumMax:res.data.items.num,
            buyNumber: (res.data.items.num>0) ? 1: 0
          });
        }
      })
    }

    
    this.setData({
      goodsDetail: that.data.goodsDetail,
      canSubmit:canSubmit
    })  
  },
  /**
  * 加入购物车
  */
  addShopCar:function(){
    var that = this;
    if (this.data.goodsDetail.basicInfo.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit){
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })       
      }
      this.bindGuiGeTap();
      return;
    }
    if(this.data.buyNumber < 1){
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel:false
      })
      return;
    }
    //组建购物车
    var shopCarInfo = this.bulidShopCarInfo();
    this.setData({
      shopCarInfo:shopCarInfo,
      shopNum:shopCarInfo.shopNum
    });

    // 写入本地存储
    wx.setStorage({
      key: 'shopCarInfo',
      data: shopCarInfo
    })

    var shop_num = 0;
    for (var i = 0; i < shopCarInfo.shopList.length; i++){
      var shop = shopCarInfo.shopList[i];
      if (shop.commodity_id == this.data.goodsDetail.basicInfo.commodity_id && shop.specifition_name == this.data.specifition_name){
        shop_num = shop.num;
        break;
      }
    }

    //入库
    wx.request({
      url: app.globalData.domain + 'api/insertCart',
      method: "POST",
      data: {
        commodity_id: this.data.goodsDetail.basicInfo.commodity_id,
        num: shop_num,
        image_url: this.data.goodsDetail.basicInfo.image_url[0] + "_m",
        commodity_name: this.data.goodsDetail.basicInfo.commodity_name,
        specifition_name: this.data.specifition_name,
        price: this.data.selectSizePrice,
        freight_price: this.data.goodsDetail.basicInfo.freight_price + ""
      },
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == 0) {
          //console.log("购物车入库成功")
          that.closePopupTap();
          wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '添加购物车失败！',
            showCancel: false
          })
          return;
        }
      }
    })

    //console.log(shopCarInfo);

    //shopCarInfo = {shopNum:12,shopList:[]}
  },
	/**
	  * 立即购买
	  */
  buyNow: function (e){
    let that = this
    let shoptype = e.currentTarget.dataset.shoptype
    //console.log(shoptype)
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
      }
      this.bindGuiGeTap();
      wx.showModal({
        title: '提示',
        content: '请先选择规格尺寸哦~',
        showCancel:false
      })
      return;
    }    
    if(this.data.buyNumber < 1){
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel:false
      })
      return;
    }
    //组建立即购买信息
    var buyNowInfo = this.buliduBuyNowInfo(shoptype);
    // 写入本地存储
    wx.setStorage({
      key:"buyNowInfo",
      data:buyNowInfo
    })
    this.closePopupTap();
    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow"
    }) 
       
  },
  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function () {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.commodity_id = this.data.goodsDetail.basicInfo.commodity_id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.image_url[0] + "_m";
    shopCarMap.commodity_name = this.data.goodsDetail.basicInfo.commodity_name;
    shopCarMap.specifition_name = this.data.specifition_name;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.num = this.data.buyNumber;
    shopCarMap.freight_price = this.data.goodsDetail.basicInfo.freight_price;

    var shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.commodity_id == shopCarMap.commodity_id && tmpShopCarMap.specifition_name == shopCarMap.specifition_name) {
        hasSameGoodsIndex = i;
        shopCarMap.num = shopCarMap.num + tmpShopCarMap.num;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    return shopCarInfo;
  },
	/**
	 * 组建立即购买信息
	 */
  buliduBuyNowInfo: function (shoptype) {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.label = this.data.specifition_name;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    /*    var hasSameGoodsIndex = -1;
        for (var i = 0; i < toBuyInfo.shopList.length; i++) {
          var tmpShopCarMap = toBuyInfo.shopList[i];
          if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
            hasSameGoodsIndex = i;
            shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
            break;
          }
        }
        toBuyInfo.shopNum = toBuyInfo.shopNum + this.data.buyNumber;
        if (hasSameGoodsIndex > -1) {
          toBuyInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
        } else {
          toBuyInfo.shopList.push(shopCarMap);
        }*/

    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },   
  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.category_id + '&inviter_id=' + wx.getStorageSync('uid'),
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  reputation: function (goodsId) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/reputation',
      data: {
        goodsId: goodsId
      },
      success: function (res) {
        if (res.data.code == 0) {
          //console.log(res.data.data);
          that.setData({
            reputation: res.data.data
          });
        }
      }
    })
  },
  getVideoSrc: function (videoId) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/media/video/detail',
      data: {
        videoId: videoId
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            videoMp4Src: res.data.data.fdMp4
          });
        }
      }
    })
  }
})
