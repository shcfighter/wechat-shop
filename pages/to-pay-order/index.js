//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    totalScoreToPay: 0,
    goodsList:[],
    isNeedLogistics:1, // 是否需要物流信息
    allGoodsPrice:0,
    yunPrice:0,
    allGoodsAndYunPrice:0,
    goodsJsonStr:"",
    orderType:"", //订单类型，购物车下单或立即支付下单，默认是购物车，
    hasNoCoupons: true,
    coupons: [],
    youhuijine:0, //优惠券金额
    curCoupon:null // 当前选择使用的优惠券
  },
  onShow : function () {
    var that = this;
    var shopList = [];
    //立即购买下单
    if ("buyNow"==that.data.orderType){
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
      console.log(shopList)
      var entity = shopList[0];
      that.data.allGoodsPrice += parseInt(entity.price) * parseInt(entity.num);
      if (parseInt(entity.freight_price) > that.data.yunPrice) {
        that.data.yunPrice = parseInt(entity.freight_price);
      }
    }else{
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        // shopList = shopCarInfoMem.shopList
        shopList = shopCarInfoMem.shopList.filter(entity => {
          that.data.allGoodsPrice += parseInt(entity.price) * parseInt(entity.num);
          if (parseInt(entity.freight_price) > that.data.yunPrice){
            that.data.yunPrice = parseInt(entity.freight_price);
          }
          return entity.active;
        });

      }
    }
    that.setData({
      goodsList: shopList,
      yunPrice: that.data.yunPrice,
      allGoodsPrice: that.data.allGoodsPrice,
      allGoodsAndYunPrice: that.data.allGoodsPrice + that.data.yunPrice
    });
    that.initShippingAddress();
    that.getMyCoupons();
  },

  onLoad: function (e) {
    this.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    });
  },

  getDistrictId : function (obj, aaa){
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },

  createOrder:function (e) {
    wx.showLoading();
    var that = this;
    var loginToken = wx.getStorageSync('token') // 用户登录 token
    var remarks = ""; // 备注信息
    if (e) {
      remarks = e.detail.value.remark; // 备注信息
    }

    var postData = {
      order_details: JSON.parse(that.data.goodsJsonStr),
      remarks: remarks
    };
    if (that.data.isNeedLogistics > 0) {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
      postData.address_id = that.data.curAddressData.address_id;
    }
    if (that.data.curCoupon) {
      postData.coupon_id = that.data.curCoupon.coupon_detail_id;
    }
    if (!e) {
      postData.calculate = "true";
    }
    console.log(postData)
    wx.request({
      url: app.globalData.domain +'api/order/insert',
      method:'PUT',
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      data: postData, // 设置请求的 参数
      success: (res) =>{
        wx.hideLoading();
        // if (res.data.code != 0) {
        //   wx.showModal({
        //     title: '错误',
        //     content: res.data.msg,
        //     showCancel: false
        //   })
        //   return;
        // }

        if (e && "buyNow" != that.data.orderType) {
          // 清空购物车数据
          wx.removeStorageSync('shopCarInfo');
        }
        
        // if (!e) {
        //   that.setData({
        //     totalScoreToPay: res.data.data.score,
        //     isNeedLogistics: res.data.data.isNeedLogistics,
        //     allGoodsPrice: res.data.data.amountTotle,
        //     allGoodsAndYunPrice: res.data.data.amountLogistics + res.data.data.amountTotle,
        //     yunPrice: res.data.data.amountLogistics
        //   });
          
        //   that.getMyCoupons();
        //   return;
        // }
        
        // 下单成功，跳转到订单管理界面
        wx.redirectTo({
          url: "/pages/order-list/index"
        });
      }
    })
  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain +'api/defaultAddress',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: (res) =>{
        if (res.data.status == 0 && !(JSON.stringify(res.data.items) === '{}')) {
          that.setData({
            curAddressData:res.data.items
          });
        }else{
          that.setData({
            curAddressData: null
          });
        }
        that.processYunfei();
      }
    })
  },
  processYunfei: function () {
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var isNeedLogistics = 1;
    var allGoodsPrice = 0;

    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.price * carShopBean.num;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }


      let inviter_id = 0;
      let inviter_id_storge = wx.getStorageSync('inviter_id_' + carShopBean.commodity_id);
      if (inviter_id_storge) {
        inviter_id = inviter_id_storge;
      }


      goodsJsonStrTmp += '{"commodity_id":' + carShopBean.commodity_id + ',"number":' + carShopBean.num + ',"specifition_name":"' + carShopBean.specifition_name + '","logisticsType":0, "cart_id":"' + carShopBean.cart_id +'"}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    
    that.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr
    });
    //that.createOrder();
  },
  addAddress: function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url:"/pages/select-address/index"
    })
  },
  getMyCoupons: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'api/findCoupon',
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == 0) {
          // var coupons = res.data.items.filter(entity => {
          //   return entity.min_use_amount <= that.data.allGoodsAndYunPrice;
          // });
          var coupons = res.data.items;
          if (coupons.length > 0) {
            that.setData({
              hasNoCoupons: false,
              coupons: coupons
            });
          }
        }
      }
    })
  },
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon:null
      });
      return;
    }
    //console.log("selIndex:" + selIndex);
    this.setData({
      youhuijine: this.data.coupons[selIndex].coupon_amount,
      curCoupon: this.data.coupons[selIndex]
    });
  }
})
