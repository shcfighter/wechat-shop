//index.js
var app = getApp()
Page({
  data: {
    goodsList:{
      saveHidden:true,
      totalPrice:0,
      totalScoreToPay: 0,
      allSelect:true,
      noSelect:false,
      list:[]
    },
    delBtnWidth:120,    //删除按钮宽度单位（rpx）
  },
 
 //获取元素自适应后的实际宽度
  getEleWidth:function(w){
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750/2)/(w/2);  //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res/scale);
      return real;
    } catch (e) {
      return false;
     // Do something when catch error
    }
  },
  initEleWidth:function(){
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth:delBtnWidth
    });
  },
  onLoad: function () {
      this.initEleWidth();
      //this.onShow();
  },
  onShow: function(){
      var that = this;
      let userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        wx.navigateTo({
          url: "/pages/authorize/index"
        });
        return;
      }
      // 获取购物车数据
      wx.request({
        url: app.globalData.domain + 'api/cartList',
        data: {},
        method: "GET",
        header: {
          'content-type': 'application/json', // 默认值
          'token': wx.getStorageSync('token')
        },
        success: function (res) {
          var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
          if(res.data.status != 0){
            wx.showModal({
              title: '提示',
              content: '获取购物车失败！',
              showCancel: false
            })
            return;
          }
          var shopList = res.data.items;
          that.data.goodsList.list = shopList;
          that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), shopList);
        }
      })
      
  },
  toIndexPage:function(){
      wx.switchTab({
            url: "/pages/index/index"
      });
  },

  touchS:function(e){
    if(e.touches.length==1){
      this.setData({
        startX:e.touches[0].clientX
      });
    }
  },
  touchM:function(e){
  var index = e.currentTarget.dataset.index;

    if(e.touches.length==1){
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if(disX == 0 || disX < 0){//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      }else if(disX > 0 ){//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-"+disX+"px";
        if(disX>=delBtnWidth){
          left = "left:-"+delBtnWidth+"px";
        }
      }
      var list = this.data.goodsList.list;
      if(index!="" && index !=null){
        list[parseInt(index)].left = left; 
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },
  touchE:function(e){
    var index = e.currentTarget.dataset.index;    
    if(e.changedTouches.length==1){
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth/2 ? "margin-left:-"+delBtnWidth+"px":"margin-left:0px";
      var list = this.data.goodsList.list;
     if(index!=="" && index != null){
        list[parseInt(index)].left = left; 
       this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

      }
    }
  },
  delItem: function (e) {
    console.log("delItem=======================")
    var that = this;
    var index = e.currentTarget.dataset.index;
    console.log(index)
    var list = this.data.goodsList.list;
    console.log(list)
    console.log(list[index].cart_id)
    //删除数据
    wx.request({
      url: app.globalData.domain + 'api/delCart/' + list[index].cart_id,
      method: "PUT",
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        console.log(res)
        wx.hideLoading();
        if (res.data.status != 0) {
          wx.showModal({
            title: '提示',
            content: '删除购物车失败！',
            showCancel: false
          })
          return;
        }
        list.splice(index, 1);
        console.log(list);
        that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
      }
    })
  },
  selectTap:function(e){
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if(index!=="" && index != null){
        list[parseInt(index)].active = !list[parseInt(index)].active ; 
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
   },
   totalPrice:function(){
      var list = this.data.goodsList.list;
      var total = 0;
      let totalScoreToPay = 0;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(curItem.active){
            total+= parseFloat(curItem.price)*curItem.num;
            totalScoreToPay += curItem.score * curItem.num;
          }
      }
      this.data.goodsList.totalScoreToPay = totalScoreToPay;
      total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
      return total;
   },
   allSelect:function(){
      var list = this.data.goodsList.list;
      var allSelect = false;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(curItem.active){
            allSelect = true;
          }else{
             allSelect = false;
             break;
          }
      }
      return allSelect;
   },
   noSelect:function(){
      var list = this.data.goodsList.list;
      var noSelect = 0;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(!curItem.active){
            noSelect++;
          }
      }
      if(noSelect == list.length){
         return true;
      }else{
        return false;
      }
   },
   setGoodsList:function(saveHidden,total,allSelect,noSelect,list){
     this.setData({
        goodsList:{
          saveHidden:saveHidden,
          totalPrice:total,
          allSelect:allSelect,
          noSelect:noSelect,
          list:list,
          totalScoreToPay: this.data.goodsList.totalScoreToPay
        }
      });
      var shopCarInfo = {};
      var tempNumber = 0;
      shopCarInfo.shopList = list;
      for(var i = 0;i<list.length;i++){
        tempNumber = tempNumber + list[i].number
      }
      shopCarInfo.shopNum = tempNumber;
      wx.setStorage({
        key:"shopCarInfo",
        data:shopCarInfo
      })

      
   },
   bindAllSelect:function(){
      var currentAllSelect = this.data.goodsList.allSelect;
      var list = this.data.goodsList.list;
      if(currentAllSelect){
        for(var i = 0 ; i < list.length ; i++){
            var curItem = list[i];
            curItem.active = false;
        }
      }else{
        for(var i = 0 ; i < list.length ; i++){
            var curItem = list[i];
            curItem.active = true;
        }
      }
     
      this.setGoodsList(this.getSaveHide(),this.totalPrice(),!currentAllSelect,this.noSelect(),list);
   },
   jiaBtnTap:function(e){
	  var that = this
    var index = e.currentTarget.dataset.index;
    var list = that.data.goodsList.list;
    if(index!=="" && index != null){
      // 添加判断当前商品购买数量是否超过当前商品可购买库存
      var carShopBean = list[parseInt(index)];
      var carShopBeanStores = 0;
      wx.showLoading({
        title: '加载中',
        "mask": true
      })
      console.log("jiaBtnTap");
      console.log(list[parseInt(index)]);
      var url = "api/commodity/specifition/price/";
      if (!carShopBean.specifition_name){
        url = "api/commodity/price/";
      }
      console.log(url)
      wx.request({
        url: app.globalData.domain + url + list[parseInt(index)].commodity_id,
        method: "POST",
        data: {
          commodity_id: list[parseInt(index)].commodity_id,
          specifition_name: list[parseInt(index)].specifition_name
        },
        success: function (res) {
          console.log(res);
          if(res.data.status != 0){
            wx.hideLoading();
            return ;
          }
          carShopBeanStores = res.data.items.num;
          if (list[parseInt(index)].num < carShopBeanStores) {
            list[parseInt(index)].num++;
            //修改购物车数量
            wx.request({
              url: app.globalData.domain + 'api/insertCart',
              method: "POST",
              data: {
                commodity_id: list[parseInt(index)].commodity_id,
                num: list[parseInt(index)].num,
                specifition_name: list[parseInt(index)].specifition_name,
                price: res.data.items.price
              },
              header: {
                'content-type': 'application/json', // 默认值
                'token': wx.getStorageSync('token')
              },
              success: function (res) {
                wx.hideLoading();
                if (res.data.status != 0) {
                  wx.showModal({
                    title: '提示',
                    content: '修改购物车失败！',
                    showCancel: false
                  })
                  return;
                }
                that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
              }
            })
          }else{
            wx.hideLoading();
          }
        }
      })
    }
   },
   jianBtnTap:function(e){
     var that = this
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if(index!=="" && index != null){
      if(list[parseInt(index)].num>1){
        wx.showLoading({
          title: '加载中',
          "mask": true
        });
        list[parseInt(index)].num--;
        //修改购物车数量
        wx.request({
          url: app.globalData.domain + 'api/insertCart',
          method: "POST",
          data: {
            commodity_id: list[parseInt(index)].commodity_id,
            num: list[parseInt(index)].num,
            specifition_name: list[parseInt(index)].specifition_name,
            price: list[parseInt(index)].price
          },
          header: {
            'content-type': 'application/json', // 默认值
            'token': wx.getStorageSync('token')
          },
          success: function (res) {
            wx.hideLoading();
            if (res.data.status != 0) {
              wx.showModal({
                title: '提示',
                content: '修改购物车失败！',
                showCancel: false
              })
              return;
            }
            that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
          }
        })
      }
    }
   },
   editTap:function(){
     var list = this.data.goodsList.list;
     for(var i = 0 ; i < list.length ; i++){
            var curItem = list[i];
            curItem.active = false;
     }
     this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
   },
   saveTap:function(){
     var list = this.data.goodsList.list;
     for(var i = 0 ; i < list.length ; i++){
            var curItem = list[i];
            curItem.active = true;
     }
     this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
   },
   getSaveHide:function(){
     var saveHidden = this.data.goodsList.saveHidden;
     return saveHidden;
   },
   deleteSelected:function(){
     console.loe(deleteSelected)
      var list = this.data.goodsList.list;
     /*
      for(let i = 0 ; i < list.length ; i++){
            let curItem = list[i];
            if(curItem.active){
              list.splice(i,1);
            }
      }
      */
     // above codes that remove elements in a for statement may change the length of list dynamically
     var arr = new Array();
     var i = 0;
     list = list.filter(function(curGoods) {
       if (curGoods.active){
         arr[i++] = curGoods.cart_id;
       }
        return !curGoods.active;
     });
     console.log(list);
     
     //入库
     wx.request({
       url: app.globalData.domain + 'api/delBatchCart',
       method: "PUT",
       data: {
         carts: arr.join(",")
       },
       header: {
         'content-type': 'application/json', // 默认值
         'token': wx.getStorageSync('token')
       },
       success: function (res) {
         if (res.data.status != 0) {
           wx.showModal({
             title: '提示',
             content: '删除购物车失败！',
             showCancel: false
           })
           return;
         }
         this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
       }
     })
    },
    toPayOrder:function(){
      wx.showLoading();
      var that = this;
      if (this.data.goodsList.noSelect) {
        wx.hideLoading();
        return;
      }
      // 重新计算价格，判断库存
      var shopList = [];
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        // shopList = shopCarInfoMem.shopList
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active;
        });
      }
      if (shopList.length == 0) {
        wx.hideLoading();
        return;
      }
      var isFail = false;
      var doneNumber = 0;
      var needDoneNUmber = shopList.length;
      for (let i =0; i < shopList.length; i++) {
        if (isFail) {
          wx.hideLoading();
          return;
        }
        let carShopBean = shopList[i];
        // 获取价格和库存
        if (!carShopBean.specifition_name || carShopBean.specifition_name == "") {
          wx.request({
            url: app.globalData.domain + 'api/commodity/price/' + carShopBean.commodity_id,
            method: 'POST',
            data: {},
            header: {
              'content-type': 'application/json', // 默认值
              'token': wx.getStorageSync('token')
            },
            success: function(res) {
              //console.log(res);
              if(res.data.status != 0){
                wx.showModal({
                  title: '提示',
                  content: '请求失败',
                  showCancel: false
                })
                isFail = true;
                wx.hideLoading();
                return;
              }
              doneNumber++;
              if (res.data.items.status != 1) {
                wx.showModal({
                  title: '提示',
                  content: res.data.items.commodity_name + ' 商品已失效，请重新购买',
                  showCancel:false
                })
                isFail = true;
                wx.hideLoading();
                return;
              }
              if (res.data.items.num < carShopBean.num) {
                wx.showModal({
                  title: '提示',
                  content: res.data.items.commodity_name + ' 库存不足，请重新购买',
                  showCancel:false
                })
                isFail = true;
                wx.hideLoading();
                return;
              }
              if (res.data.items.price != carShopBean.price) {
                wx.showModal({
                  title: '提示',
                  content: res.data.items.commodity_name + ' 价格有调整，请重新购买',
                  showCancel:false
                })
                isFail = true;
                wx.hideLoading();
                return;
              }
              if (needDoneNUmber == doneNumber) {
                that.navigateToPayOrder();
              }
            }
          })
        } else {
          wx.request({
            url: app.globalData.domain + 'api/commodity/specifition/price/' + carShopBean.commodity_id,
            method: 'POST',
            data: {
              commodity_id: carShopBean.commodity_id,
              specifition_name: carShopBean.specifition_name
            },
            header: {
              'content-type': 'application/json', // 默认值
              'token': wx.getStorageSync('token')
            },
            success: function(res) {
              if (res.data.status != 0) {
                wx.showModal({
                  title: '提示',
                  content: '请求失败',
                  showCancel: false
                })
                isFail = true;
                wx.hideLoading();
                return;
              }
              if (res.data.items.status != 1) {
                wx.showModal({
                  title: '提示',
                  content: res.data.items.commodity_name + ' 商品已失效，请重新购买',
                  showCancel: false
                })
                isFail = true;
                wx.hideLoading();
                return;
              }
              doneNumber++;
              if (res.data.items.num < carShopBean.num) {
                wx.showModal({
                  title: '提示',
                  content: carShopBean.commodity_name + ' 库存不足，请重新购买',
                  showCancel:false
                })
                isFail = true;
                wx.hideLoading();
                return;
              }
              if (res.data.items.price != carShopBean.price) {
                wx.showModal({
                  title: '提示',
                  content: carShopBean.commodity_name + ' 价格有调整，请重新购买',
                  showCancel:false
                })
                isFail = true;
                wx.hideLoading();
                return;
              }
              if (needDoneNUmber == doneNumber) {
                that.navigateToPayOrder();
              }
            }
          })
        }
        
      }
    },
    navigateToPayOrder:function () {
      wx.hideLoading();
      wx.navigateTo({
        url:"/pages/to-pay-order/index?orderType=cartBuy"
      })
    }

})
