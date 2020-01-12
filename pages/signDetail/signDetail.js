// pages/signDetail/signDetail.js
const util = require('../../utils/util.js');
var url = getApp().globalData.url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {
      title: '例会',
      startDate: '2019/09/19',
      endDate: '永久',
      startTime: '00:00',
      endTime: '23:59',
      signRule: '每天可签到1次',
      totalSign: 0,
      joinCount: 0 //参与人数
    }, //本次签到标题 规则 时间等信息
    todaySign: [], //今日成员签到记录
    signId: null, //该签到的id
    hasShield: false, //是否有显示签到填入信息 true为显示，false为不显示
    signInfo: [],
    canSigned: true,
    hasSuccessBadge: false,
    todayDate: '',
    todayTime: 0,
    editUrl: '',
    path: ''
  },

  // 从上一页返回时调用刷新页面
  changeParentData: function() {
    var pages = getCurrentPages(); //当前页面栈
    if (pages.length > 1) {
      var beforePage = pages[pages.length - 2]; //获取上一个页面实例对象
      beforePage.changeData(); //触发父页面中的方法
    }
  },


  closeBadge: function() {
    if (!this.data.canSigned) {
      this.setData({
        hasSuccessBadge: false,
        todayTime: 1
      });
      this.getSignRecord();
      wx.reLaunch({
        url: '../signList/signList',
      })
    }
  },

  showInfo: function() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          this.setData({
            hasShield: true
          })
        }
      }
    })

  },
  handleClose: function() {
    this.setData({
      hasShield: false
    })
  },
  closeInfo: function(e) {
    if (!this.data.canSigned) {
      this.setData({
        hasShield: false
      })
    }
  },

  /**
   * 判断是否可进入编辑界面
   */

  canEdit: function() {

  },



  /**
   * 时间格式化为2019/09/24
   */
  dateFormat: function(value) {
    var valueArr = value.split('-');
    return valueArr.join('/');
  },



  /**
   * 根据经纬度判断距离
   */
  Rad: function(d) {
    return d * Math.PI / 180.0;
  },

  /**
   * 获取用户位置和指定位置之间的距离
   */
  getDistance: function(lat1, lng1, lat2, lng2) {
    // lat1用户的纬度
    // lng1用户的经度
    // lat2指定位置的纬度
    // lng2指定位置的经度
    var radLat1 = this.Rad(lat1);
    // console.log(radLat1);
    var radLat2 = this.Rad(lat2);
    // console.log(radLat2);
    var a = radLat1 - radLat2;
    // console.log(a);
    var b = this.Rad(lng1) - this.Rad(lng2);
    // console.log(this.Rad(lng1));
    // console.log(this.Rad(lng2));
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2) * 1000; //保留两位小数 单位为：m
    return s
  },

  /**
   * 检测定位是否在规定地点范围内
   */
  isInDistance() {
    var _this = this;
    // 获取用户的经纬度
    return new Promise(function(resolve, reject) {
      wx.getLocation({
        type: 'wgs84',
        success: (res) => {
          // 获取用户与指定位置的距离
          var distance = _this.getDistance(parseFloat(res.latitude), parseFloat(res.longitude), parseFloat(_this.data.detail.latitude), parseFloat(_this.data.detail.longitude));
          resolve(distance);
        },
        cancel: function(res) {
          reject('用户拒绝授权获取地理位置');
        },
        fail: function(res) {
          reject(res)
        }
      })
    })
  },

  /**
   * 提交签到信息 完成签到
   */
  signIn: function(input) {
    var data = input;
    data['signid'] = this.data.signId;
    data['openid'] = wx.getStorageSync('openId');
    wx.request({
      url: url + '/api/join/signin',
      method: 'POST',
      data: data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        this.setData({
          canSigned: false,
          hasSuccessBadge: true
        });
      }
    })
  },

  /**
   *提交签到填写信息 
   */
  closeInfo: function(e) {
    // console.log(Object.keys(e.detail.value).length);
    var _this = this;
    var input = e.detail.value;
    for (let i = 0; i < Object.keys(e.detail.value).length - 1; i++) {
      var key = Object.keys(e.detail.value)[i];
      if (!input[key]) {
        wx.showToast({
          title: '请输入' + this.data.signInfo[i][1],
          icon: 'none',
          duration: 1000
        });
        return false;
      }
      if (key === 'phone') {
        if (!(/^1[3456789]\d{9}$/.test(input['phone']))) {
          wx.showToast({
            title: '手机号码格式不正确',
            icon: 'none',
            duration: 1000
          });
          return false;
        }
      }
      if (key === 'gender') {
        if (!(/^(男|女)$/.test(input['gender']))) {
          wx.showToast({
            title: '性别只有男或女哦',
            icon: 'none',
            duration: 1000
          });
          return false;
        }
      }
    }

    _this.setData({
      hasShield: false
    });

    // 判断用户是否在规定范围内
    if (_this.data.detail.location) {
      this.isInDistance().then(function(res) {
        // console.log(res);
        if (res < _this.data.detail.distance) {
          _this.signIn(input);
        } else {
          wx.showToast({
            title: '您当前的位置已超出签到地点范围',
            icon: 'none',
            duration: 2000
          })
        }
      }).catch(function(err) {
        wx.showModal({
          title: '提醒',
          content: '您拒绝了位置授权，无法进行签到,点击确定重新获取授权',
          success(res) {
            //如果点击确定
            if (res.confirm) {
              wx.openSetting({
                success(res) {
                  //如果同意了位置授权则userLocation=true
                  if (res.authSetting["scope.userLocation"]) {
                    _this.onLoad();
                  }
                }
              })
            } else {
              _this.onLoad();
            }
          }
        });
      });
    } else {
      _this.signIn(input);
    }
  },
  /**
   * 判断某一日期是否在规定日期段内
   */
  isDuringDate: function(beginDateArr, endDateArr) {
    var curDate = new Date();
    var beginDate = new Date(beginDateArr[0], (beginDateArr[1] - 1), beginDateArr[2], beginDateArr[3], beginDateArr[4], beginDateArr[5]);
    var endDate = new Date(endDateArr[0], (endDateArr[1] - 1), endDateArr[2], endDateArr[3], endDateArr[4], endDateArr[5]);
    // console.log(beginDate,endDate);
    if (curDate >= beginDate && curDate <= endDate) {
      return true;
    }
    return false;
  },

  /**
   * 判断当下时间是否在规定时间段内
   */
  time_rage: function(beginTime, endTime, nowTime) {
    var strb = beginTime.split(":");
    var nowTime = new Date().getHours() + ':' + new Date().getMinutes();
    if (strb.length != 3) {
      return false;
    }

    var stre = endTime.split(":");
    if (stre.length != 3) {
      return false;
    }

    var strn = nowTime.split(":");
    if (stre.length != 3) {
      return false;
    }
    var b = new Date();
    var e = new Date();
    var n = new Date();

    b.setHours(strb[0]);
    b.setMinutes(strb[1]);
    e.setHours(stre[0]);
    e.setMinutes(stre[1]);
    n.setHours(strn[0]);
    n.setMinutes(strn[1]);

    if (n.getTime() - b.getTime() > 0 && n.getTime() - e.getTime() < 0) {
      return true;
    } else {
      // console.log("当前时间是：" + n.getHours() + ":" + n.getMinutes() + "，不在该时间范围内！");
      return false;
    }
  },
  /**
   * 判断今日可不可签到
   */
  enableSign: function(options, beginDateTime, endDateTime, startTime, endTime) {
    var that = this
    wx.request({
      url: url + '/api/join/findjoin',
      method: 'GET',
      data: {
        signid: options.id,
        openid: wx.getStorageSync('openId')
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: function(res) {
        // console.log(that.time_rage('08:00','13:00'));
        if (that.isDuringDate(beginDateTime, endDateTime) && that.time_rage(startTime, endTime)) {
          if (res.data.length == 0) {
            // console.log(beginDateTime, endDateTime);
            that.setData({
              canSigned: true
            })
          } else {
            var createTime = res.data[0]['create_time'];
            var createTime = createTime.replace(/-/g, ':').replace(' ', ':').split(':');
            // console.log(createTime);
            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth() + 1;
            var date = today.getDate();
            if (createTime[0] == year && createTime[1] == month && createTime[2] == date) {
              that.setData({
                canSigned: false,
                todayTime: 1
              })
            } else {
              that.setData({
                canSigned: true
              })
            }
          }
        } else {
          that.setData({
            canSigned: false,
          })
        }
      }
    })
  },

  /**
   * 获取今日签到成员记录信息
   */
  getSignRecord() {
    wx.request({
      url: url + '/api/join/todayrecord',
      method: 'GET',
      data: {
        signId: this.data.signId,
      },
      success: (res) => {
        // console.log(res.data);
        this.setData({
          todaySign: res.data, //今日成员签到记录
        })
      }
    })
  },



  /**
   * 
   */
  load: function(options) {
    // console.log(options.id);
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    month = month > 9 ? month : '0' + month;
    var date = today.getDate();
    date = date > 9 ? date : '0' + date;
    this.setData({
      signId: options.id,
      todayDate: year + '-' + month + '-' + date
    });
    wx.request({
      url: url + '/api/sign/onesign',
      method: 'GET',
      data: {
        signId: options.id
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 判断可否进入编辑页面 当前openid=res.data['signposter']['openid']时候可进入
        if (wx.getStorageSync('openId') == res.data['signposter']['openid']) {
          this.setData({
            editUrl: '../editSign/editSign?signid=' + this.data.signId
          })
        } else {
          this.setData({
            editUrl: ''
          });
          wx.showToast({
            title: '您不是签到发起人，无法编辑该签到',
            icon: 'none',
            duration: 2000
          })
        }
        var startDate = this.dateFormat(res.data.startDate);
        var endDate = this.dateFormat(res.data.endDate);
        if (endDate.split('/')[0] == 2100) {
          endDate = '永久'
        }
        // console.log(endDate);
        var settingArr = JSON.parse(res.data.settingArr);
        // console.log(settingArr);
        var newsettingArr = [];
        if (settingArr) {
          settingArr.forEach((item, index, array) => {
            var arr = item.split('-');
            newsettingArr.push(arr);
          });
        }

        // 获取累计签到次数
        wx.request({
          url: url + '/api/join/totalsign',
          method: 'GET',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            signid: this.data.signId,
            openid: wx.getStorageSync('openId')
          },
          success: (result) => {
            this.setData({
              detail: {
                title: res.data.title,
                startDate: startDate,
                endDate: endDate,
                startTime: res.data.startTime,
                endTime: res.data.endTime,
                signRule: res.data.rule == '' ? '无' : res.data.rule,
                location: res.data.location,
                distance: res.data.distance,
                latitude: res.data.latitude,
                longitude: res.data.longitude,
                totalSign: result.data,
                joinCount: options.joinCount
              },
              signInfo: newsettingArr
            });
            // 判断今日能否签到
            var beginDate = res.data.startDate.split('-');
            var beginTime = res.data.startTime.split(':');
            var beginDateTime = beginDate.concat(beginTime);
            var endDate1 = res.data.endDate.split('-');
            var endTime = res.data.endTime.split(':');
            var endDateTime = endDate1.concat(endTime);
            // console.log(beginDateTime,endDateTime);
            this.enableSign(options, beginDateTime, endDateTime, res.data.startTime, res.data.endTime);
          }
        })


      }
    });
    this.getSignRecord();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.load(options);
    var signId = this.data.signId;
    var signTitle = this.data.detail.title;
    var joinCount = this.data.detail.joinCount;
    this.setData({
      path: '/pages/signDetail/signDetail?id=' + signId + '&joinCount=' + joinCount,
    })
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
  onShareAppMessage: function(res) {
    var that = this;
    var signId = that.data.signId;
    var signTitle = that.data.detail.title;
    var joinCount = that.data.detail.joinCount;
    // console.log(signId,signTitle,joinCount);
    return {
      title: signTitle,
      path: '/pages/signDetail/signDetail?id=' + signId + '&joinCount=' + joinCount,
      imageUrl: '../../assets/images/bg.jpg',
    }
  }
})