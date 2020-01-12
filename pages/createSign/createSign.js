// pages/createSign/createSign.js
const util = require('../../utils/util.js');
var url = getApp().globalData.url;

var today = new Date();
var year = today.getFullYear();
var month = today.getMonth() + 1;
month = month < 10 ? '0' + month : month;
var date = today.getDate();
date = date < 10 ? '0' + date : date;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isDateOpen: false, //签到日期分区展开还是收起 false为收起，true为展开
    isTimeOpen: false, //签到日期分区展开还是收起 false为收起，true为展开
    isOpen: false, //高级设置分区展开还是收起 false为收起，true为展开
    isLocationOpen: false, //选择签到地点展开还是收起 false为收起，true为展开
    isChecked: false, //switch手否选中
    time: {
      time1: ["00", "00"],
      time2: ["23", "59"]
    },
    extreTime: {
      start: ["00", "00"],
      end: ["23", "59"]
    },
    date: {
      date1: [],
      date2: []
    },
    extreDate: {
      start: [],
      end: []
    },
  },
  changeOpen: function() {
    let isOpen = this.data.isOpen;
    this.setData({
      isOpen: !isOpen
    })
  },
  getTimeOne: function(e) {
    let time2 = this.data.time['time2'];
    this.setData({
      time: {
        time1: e.detail,
        time2: time2
      }
    })
  },
  getTimeTwo: function(e) {
    let time1 = this.data.time['time1'];
    this.setData({
      time: {
        time1: time1,
        time2: e.detail
      }
    })
  },
  getDateOne: function(e) {
    let date2 = this.data.date['date2'];
    this.setData({
      date: {
        date1: e.detail,
        date2: date2
      }
    })
  },
  getDateTwo: function(e) {
    let date1 = this.data.date['date1'];
    this.setData({
      date: {
        date1: date1,
        date2: e.detail
      }
    })
  },

  //签到日期 radio-group中选项发生改变时触发
  radioDateChange: function(e) {
    let date1 = this.data.date.date1;
    if (e.detail.value == '自定义') {
      this.setData({
        isDateOpen: true,
        date: {
          date1: [year, month, date],
          date2: [year, month, date]
        }
      });
    } else {
      this.setData({
        isDateOpen: false,
        date: {
          date1: date1,
          date2: ["2100", "12", "12"]
        }
      })
    }
  },
  //签到时间 radio-group中选项发生改变时触发
  radioTimeChange: function(e) {
    // console.log(e.detail.value);
    if (e.detail.value == '自定义') {
      this.setData({
        isTimeOpen: true,
      })
    } else {
      this.setData({
        isTimeOpen: false,
        time: {
          time1: ["00", "00"],
          time2: ["23", "59"]
        }
      })
    }
  },

  // 选择签到地点 switch中发生改变时触发
  switchChange: function(e) {
    var that=this;
    // console.log(e.detail);
    if (e.detail.value) {
      util.getUserLocation(function(){
        that.setData({
          isLocationOpen: true
        })
      },function(){
        that.setData({
          isChecked: false
        })
      });
    } else {
      that.setData({
        isLocationOpen: false
      })
    }
  },
  // 打开地图选择位置 
  getLocation: function() {
    var _this = this;
    wx.chooseLocation({
      success: function(res) {
        // console.log(res);
        var name = res.name;
        var address = res.address;
        var latitude = res.latitude;
        var longitude = res.longitude;
        _this.setData({
          name: name,
          address: address,
          latitude: latitude,
          longitude: longitude
        })
      },
      complete(r) {
        // console.log(r)
      }
    })
  },
  // 获取用户信息
  getUserInfo: function(e) {
    util.getUserInfo(function() {
      return;
    });
  },

  //点击提交表单时触发
  goSubmit: function(e) {
    let formData = e.detail.value;
    // 由于子组件无法监听父组件传来的值发生的变化，需重新设置date2 
    let date2 = this.data.date.date2.join('-');
    formData['endDate'] = date2;
    formData['openid'] = wx.getStorageSync('openId');
    if (this.data.isLocationOpen) {
      if (!formData['location']) {
        wx.showToast({
          title: '打开高级设置后必须指定签到地点',
          icon: 'none',
          duration: 1000
        });
        return false;
      }
    }
    if (formData['location']) {
      if (!formData['distance']) {
        wx.showToast({
          title: '必须设置签到范围',
          icon: 'none',
          duration: 1000
        });
        return false;
      } else {
        if (formData['distance'] < 50) {
          wx.showToast({
            title: '签到范围必须不小于50米',
            icon: 'none',
            duration: 1000
          });
          return false;
        }

      }
    } else {
      if (formData['distance']) {
        wx.showToast({
          title: '设置签到范围前必须先指定签到地点',
          icon: 'none',
          duration: 1000
        });
        return false;
      }
    }

    let signTitle = formData['title'];
    if (signTitle == "") {
      wx.showToast({
        title: '请填写签到标题',
        icon: 'none',
        duration: 1000
      });
      return false;
    }
    wx.getSetting({
      success: function(result) {
        if (result.authSetting['scope.userInfo']) {
          // console.log(result);
          wx.request({
            url: url + '/api/sign/sign',
            method: 'POST',
            data: formData,
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
              // console.log(res.data);
              wx.navigateTo({
                url: '../createSuccess/createSuccess?id=' + res.data,
              })
            }
          })
        }
      }
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 签到日期为当天
    this.setData({
      date: {
        date1: [year, month, date],
        date2: ["2100", "12", "12"]
      },
      extreDate: {
        start: [year, month, date],
        end: ["2100", "12", "12"]
      }
    });


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

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

  }
})