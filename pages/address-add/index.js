var commonCityData = require('../../utils/city.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    provinces:[],
    citys:[],
    districts:[],
    selProvince:'请选择',
    selCity:'请选择',
    selDistrict:'请选择',
    selProvinceIndex:0,
    selCityIndex:0,
    selDistrictIndex:0
  },
  bindCancel:function () {
    wx.navigateBack({})
  },
  bindSave: function(e) {
    var that = this;
    var linkMan = e.detail.value.linkMan;
    var address = e.detail.value.address;
    var mobile = e.detail.value.mobile;
    var code = e.detail.value.code;

    if (linkMan == ""){
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel:false
      })
      return
    }
    if (mobile == ""){
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel:false
      })
      return
    }
    if (this.data.selProvince == "请选择"){
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel:false
      })
      return
    }
    if (this.data.selCity == "请选择"){
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel:false
      })
      return
    }
    var cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id;
    var districtId;
    if (this.data.selDistrict == "请选择" || !this.data.selDistrict){
      districtId = '';
    } else {
      districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id;
    }
    if (address == ""){
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel:false
      })
      return
    }
    if (code == ""){
      wx.showModal({
        title: '提示',
        content: '请填写邮编',
        showCancel:false
      })
      return
    }
    var apiAddoRuPDATE = "insertAddress";
    var method = 'POST';
    var apiAddid = that.data.id;
    if (apiAddid) {
      apiAddoRuPDATE = "updateAddress";
      method = 'PUT';
    } else {
      apiAddid = 0;
    }
    wx.request({
      url: app.globalData.domain + '/api/' + apiAddoRuPDATE,
      method: method,
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token')
      },
      data: {
        id: apiAddid,
        province_id: parseInt(commonCityData.cityData[this.data.selProvinceIndex].id),
        city_id: parseInt(cityId),
        district_id: parseInt(districtId),
        name:linkMan,
        address:address,
        mobile:mobile,
        code:code,
        is_default:1
      },
      success: function(res) {
        if (res.data.status != 0) {
          // 登录错误 
          wx.hideLoading();
          wx.showModal({
            title: '失败',
            content: res.data.message,
            showCancel:false
          })
          return;
        }
        // 跳转到结算页面
        wx.navigateBack({})
      }
    })
  },
  initCityData:function(level, obj){
    if(level == 1){
      var pinkArray = [];
      for(var i = 0;i<commonCityData.cityData.length;i++){
        pinkArray.push(commonCityData.cityData[i].name);
      }
      this.setData({
        provinces:pinkArray
      });
    } else if (level == 2){
      var pinkArray = [];
      var dataArray = obj.cityList
      for(var i = 0;i<dataArray.length;i++){
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        citys:pinkArray
      });
    } else if (level == 3){
      var pinkArray = [];
      var dataArray = obj.districtList
      for(var i = 0;i<dataArray.length;i++){
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        districts:pinkArray
      });
    }
    
  },
  bindPickerProvinceChange:function(event){
    var selIterm = commonCityData.cityData[event.detail.value];
    this.setData({
      selProvince:selIterm.name,
      selProvinceIndex:event.detail.value,
      selCity:'请选择',
      selCityIndex:0,
      selDistrict:'请选择',
      selDistrictIndex: 0
    })
    this.initCityData(2, selIterm)
  },
  bindPickerCityChange:function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity:selIterm.name,
      selCityIndex:event.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(3, selIterm)
  },
  bindPickerChange:function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      this.setData({
        selDistrict: selIterm.name,
        selDistrictIndex: event.detail.value
      })
    }
  },
  onLoad: function (e) {
    var that = this;
    this.initCityData(1);
    var id = e.id;
    if (id) {
      // 初始化原数据
      wx.showLoading();
      wx.request({
        url: app.globalData.domain + 'api/addressDetail/' + id,
        data: {},
        header: {
          'content-type': 'application/json', // 默认值
          'token': wx.getStorageSync('token')
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.status == 0) {
            that.setData({
              id:id,
              addressData: res.data.items,
              selProvince: that.getProvince(res.data.items.province_id),
              selCity: that.getCity(res.data.items.province_id, res.data.items.city_id),
              selDistrict: that.getDistrict(res.data.items.province_id, res.data.items.city_id, res.data.items.district_id)
              });
            that.setDBSaveAddressId(res.data.items);
            return;
          } else {
            wx.showModal({
              title: '提示',
              content: '无法获取快递地址数据',
              showCancel: false
            })
          }
        }
      })
    }
  },
  getProvince: function(provinceId){
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (provinceId == commonCityData.cityData[i].id) {
        return commonCityData.cityData[i].name;
      }
    }
  },
  getCity: function(provinceId, cityId){
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (provinceId == commonCityData.cityData[i].id) {
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (cityId == commonCityData.cityData[i].cityList[j].id) {
            return commonCityData.cityData[i].cityList[j].name;
          }
        }
      }
    }
  },
  getDistrict: function(provinceId, cityId, districtId){
    if(districtId){
      return ;
    }
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (provinceId == commonCityData.cityData[i].id) {
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (cityId == commonCityData.cityData[i].cityList[j].id) {
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (districtId == commonCityData.cityData[i].cityList[j].districtList[k].id) {
                return commonCityData.cityData[i].cityList[j].districtList[k].name;
              }
            }
          }
        }
      }
    }
  },
  setDBSaveAddressId: function(data) {
    var retSelIdx = 0;
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (data.province_id == commonCityData.cityData[i].id) {
        this.data.selProvinceIndex = i;
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (data.city_id == commonCityData.cityData[i].cityList[j].id) {
            this.data.selCityIndex = j;
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (data.district_id == commonCityData.cityData[i].cityList[j].districtList[k].id) {
                this.data.selDistrictIndex = k;
              }
            }
          }
        }
      }
    }
   },
  selectCity: function () {
    
  },
  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.domain + '/api/delAddress/' + id,
            data: {},
            method: 'PUT',
            header: {
              'content-type': 'application/json', // 默认值
              'token': wx.getStorageSync('token')
            },
            success: (res) => {
              wx.navigateBack({})
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  readFromWx : function () {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        let provinceName = res.provinceName;
        let cityName = res.cityName;
        let diatrictName = res.countyName;
        let retSelIdx = 0;

        for (var i = 0; i < commonCityData.cityData.length; i++) {
          if (provinceName == commonCityData.cityData[i].name) {
            let eventJ = { detail: { value:i }};
            that.bindPickerProvinceChange(eventJ);
            that.data.selProvinceIndex = i;
            for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
              if (cityName == commonCityData.cityData[i].cityList[j].name) {
                //that.data.selCityIndex = j;
                eventJ = { detail: { value: j } };
                that.bindPickerCityChange(eventJ);
                for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                  if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                    //that.data.selDistrictIndex = k;
                    eventJ = { detail: { value: k } };
                    that.bindPickerChange(eventJ);
                  }
                }
              }
            }
            
          }
        }

        that.setData({
          wxaddress: res,
        });
      }
    })
  }
})
