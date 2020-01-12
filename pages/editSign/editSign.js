// pages/editSign/editSign.js
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
    isDateOpen: true, //签到日期分区展开还是收起 false为收起，true为展开
    isTimeOpen: true, //签到日期分区展开还是收起 false为收起，true为展开
    isOpen: false, //高级设置分区展开还是收起 false为收起，true为展开
    isLocationOpen: false, //选择签到地点展开还是收起 false为收起，true为展开
    signId: null, //签到表id,
    signInfo: {}, //签到表编辑前的信息
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
    // console.log(e.detail.value);
    if (e.detail.value == '自定义') {
      this.setData({
        isDateOpen: true,
        date: {
          date1: [year, month, date],
          date2: [year, month, date + 1]
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
    // console.log(e.detail);
    if (e.detail.value) {
      this.setData({
        isLocationOpen: true
      })
    } else {
      this.setData({
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
    util.getUserInfo(e, function() {
      return;
    });
  },

  //点击提交表单时触发
  editSignInfo: function(e) {
    let formData = e.detail.value;
    // 由于子组件无法监听父组件传来的值发生的变化，需重新设置date2 
    let date2 = this.data.date.date2.join('-');
    console.log(formData);
    formData['endDate'] = date2;
    formData['openid'] = wx.getStorageSync('openId');
    formData['signId'] = this.data.signId;
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
      if (formData['distance']!=='0') {
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
      success: (result) => {
        if (result.authSetting['scope.userInfo']) {
          wx.request({
            url: url+'/api/sign/edit',
            method: 'POST',
            data: formData,
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
              console.log(res.data);
              wx.navigateTo({
                url: '../editSuccess/editSuccess?id='+this.data.signId,
              })
            }
          })
        }
      }
    })
  },

  getSignInfo: function() {
    wx.request({
      url: url+'/api/sign/onesign',
      method: 'GET',
      data: {
        signId: this.data.signId
      },
      success: (res) => {
        // console.log(res.data);
        var startDate = res.data['startDate'].split('-');
        var endDate = res.data['endDate'].split('-');
        var startTime = res.data['startTime'].split(':');
        var endTime=res.data['endTime'].split(':');
        this.setData({
          signInfo:res.data,
          date:{
            date1:startDate,
            date2:endDate
          },
          time:{
            time1:startTime,
            time2:endTime
          }
        });
       
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options.signid);
    // 签到日期为当天
    this.setData({
      signId: options.signid,
      date: {
        date1: [year, month, date],
        date2: ["2100", "12", "12"]
      },
      extreDate: {
        start: [year, month, date],
        end: ["2100", "12", "12"]
      }
    });

    this.getSignInfo();

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
    // 检测授权
    wx.getSetting({
      success: (res) => {
        // console.log(res);
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面 
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权       
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] !== undefined && res.authSetting['scope.userLocation'] !== true) {
          // 未授权
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function(res) {
              // console.log(res);
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function(dataAu) {
                    if (dataAu.authSetting['scope.userLocation'] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
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

  }
})