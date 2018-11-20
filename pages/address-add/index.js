var area = require('../../utils/city.js')
var app = getApp()
var p = 0, c = 0, d = 0
Page({
  data:{
    provinceName:[],
    provinceCode: [],
    provinceSelIndex: '',
    cityName: [],
    cityCode: [],
    citySelIndex: '',
    districtName: [],
    districtCode: [],
    districtSelIndex: '',
    showMessage: false,
    messageContent: '',
    showDistpicker: false,
    value: []
  },
  onLoad:function(e){
    // 载入时要显示再隐藏一下才能显示数据，如果有解决方法可以在issue提一下，不胜感激:-)
    // 初始化数据
    var that = this;
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
              id: id,
              addressData: res.data.items
            });
            var data = res.data.items;
            that.echoAreaData(data.province_id, data.city_id, data.district_id)
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
    } else {
      this.echoAreaData()
    }
    
  },
  echoAreaData: function(provinceId, cityId, districtId){
    var provinceId = provinceId || 0 // provinceSelIndex
    var cityId = cityId || 0 // citySelIndex
    var districtId = districtId || 0 // districtSelIndex
    var province = area[100000];
    var provinceName = [];
    var provinceCode = [];
    var index = 0;
    for (var item in province) {
      if(item == provinceId){
        this.data.provinceSelIndex = index;
      }
      provinceName.push(province[item])
      provinceCode.push(item)
      index++;
    }
    this.setData({
      provinceName: provinceName,
      provinceCode: provinceCode,
      provinceSelIndex: this.data.provinceSelIndex
    })
    // 设置市的数据
    var city = area[provinceId]
    var cityName = [];
    var cityCode = [];
    index = 0;
    for (var item in city) {
      if (item == cityId) {
        this.data.citySelIndex = index;
      }
      cityName.push(city[item])
      cityCode.push(item)
      index++;
    }
    this.setData({
      cityName: cityName,
      cityCode: cityCode,
      citySelIndex: this.data.citySelIndex
    })
    // 设置区的数据
    var district = area[cityId]
    var districtName = [];
    var districtCode = [];
    index = 0;
    for (var item in district) {
      if (item == districtId) {
        this.data.districtSelIndex = index;
      }
      districtName.push(district[item])
      districtCode.push(item)
      index++;
    }
    this.setData({
      districtName: districtName,
      districtCode: districtCode,
      districtSelIndex: this.data.districtSelIndex
    })
    this.data.value = [this.data.provinceSelIndex, this.data.citySelIndex, this.data.districtSelIndex];
    console.log(this.data.provinceSelIndex + " --> " + this.data.citySelIndex + " --> " + this.data.districtSelIndex);
    this.setData({
      value: [this.data.provinceSelIndex, this.data.citySelIndex, this.data.districtSelIndex],
      provinceSelIndex: this.data.provinceSelIndex,
      citySelIndex: this.data.citySelIndex,
      districtSelIndex: this.data.districtSelIndex
    })
  },
  setAreaData: function(p, c, d){
    var p = p || 0 // provinceSelIndex
    var c = c || 0 // citySelIndex
    var d = d || 0 // districtSelIndex
    // 设置省的数据
    var province = area['100000']
    var provinceName = [];
    var provinceCode = [];
    for (var item in province) {
      provinceName.push(province[item])
      provinceCode.push(item)
    }
    this.setData({
      provinceName: provinceName,
      provinceCode: provinceCode
    })
    // 设置市的数据
    var city = area[provinceCode[p]]
    var cityName = [];
    var cityCode = [];
    for (var item in city) {
      cityName.push(city[item])
      cityCode.push(item)
    }
    this.setData({
      cityName: cityName,
      cityCode: cityCode
    })
    // 设置区的数据
    var district = area[cityCode[c]]
    var districtName = [];
    var districtCode = [];
    for (var item in district) {
      districtName.push(district[item])
      districtCode.push(item)
    }
    this.setData({
      districtName: districtName,
      districtCode: districtCode
    })
  },
  changeArea: function(e) {
    p = e.detail.value[0]
    c = e.detail.value[1]
    d = e.detail.value[2]
    this.setAreaData(p, c, d)
  },
  showDistpicker: function() {
    this.setData({
      showDistpicker: true
    })
  },
  distpickerCancel: function() {
    this.setData({
      showDistpicker: false
    })
  },
  distpickerSure: function() {
    this.setData({
      provinceSelIndex: p,
      citySelIndex: c,
      districtSelIndex: d
    })
    this.distpickerCancel()
  },
  savePersonInfo: function(e) {
    var that = this;
    var data = e.detail.value
    var telRule = /^1[3|4|5|7|8]\d{9}$/, nameRule = /^[\u2E80-\u9FFF]+$/
    if (data.name == '') {
      this.showMessage('请输入姓名')
    } else if (! nameRule.test(data.name)) {
      this.showMessage('请输入中文名')
    } else if (data.tel == '') {
      this.showMessage('请输入手机号码')
    } else if (! telRule.test(data.tel)) {
      this.showMessage('手机号码格式不正确')
    } else if (data.province == '') {
      this.showMessage('请选择所在地区')
    } else if (data.city == '') {
      this.showMessage('请选择所在地区')
    } else if (data.district == '') {
      this.showMessage('请选择所在地区')
    } else if (data.address == '') {
      this.showMessage('请输入详细地址')
    } else {
      var apiAddoRuPDATE = "insertAddress";
      var method = 'POST';
      var apiAddid = that.data.id;
      if (apiAddid) {
        apiAddoRuPDATE = "updateAddress";
        method = 'PUT';
      } else {
        apiAddid = 0;
      }
      var provinceId = that.getProvince(data.province);
      var cityId = that.getCity(provinceId, data.city);
      var districtId = that.getDistrict(cityId, data.district);
      wx.request({
        url: app.globalData.domain + '/api/' + apiAddoRuPDATE,
        method: method,
        header: {
          'content-type': 'application/json', // 默认值
          'token': wx.getStorageSync('token')
        },
        data: {
          id: apiAddid,
          province_id: parseInt(provinceId),
          city_id: parseInt(cityId),
          district_id: parseInt(districtId),
          province_value: data.province,
          city_value: data.city,
          district_value: data.district,
          name: data.name,
          address: data.address,
          mobile: data.tel,
          code: data.code,
          is_default: Number(data.default)
        },
        success: function (res) {
          if (res.data.status != 0) {
            // 登录错误 
            wx.hideLoading();
            wx.showModal({
              title: '失败',
              content: res.data.message,
              showCancel: false
            })
            return;
          }
          // 跳转到结算页面
          wx.navigateBack({})
        }
      })
    }
  },
  deleteAddress: function (e) {
    console.log(e)
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
  readFromWx: function () {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        let provinceName = res.provinceName;
        let cityName = res.cityName;
        let districtName = res.countyName;
        let address = res.detailInfo;
        let code = res.postalCode;
        let name = res.userName;
        let mobile = res.telNumber;

        var provinceId = that.getProvince(provinceName);
        var cityId = that.getCity(provinceId, cityName);
        var districtId = that.getDistrict(cityId, districtName);
        that.echoAreaData(provinceId, cityId, districtId);
        var addressData = {}
        addressData['name'] = name;
        addressData['mobile'] = mobile;
        addressData['address'] = address;
        addressData['code'] = code;
        that.setData({
          addressData: addressData
        });
      }
    })
  },
  getProvince: function (province) {
    var data = area[100000];
    for (var key in data){
      if (province == data[key]) {
        return key;
      }
    };
  },
  getCity: function (provinceId, city) {
    var data = area[provinceId];
    for (var key in data){
      if (city == data[key]) {
        return key;
      }
    };
  },
  getDistrict: function (cityId, district) {
    var data = area[cityId];
    for (var key in data) {
      if (district == data[key]) {
        return key;
      }
    };
  },
  showMessage: function(text) {
    var that = this
    that.setData({
      showMessage: true,
      messageContent: text
    })
    setTimeout(function(){
      that.setData({
        showMessage: false,
        messageContent: ''
      })
    }, 3000)
  }
})