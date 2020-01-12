// pages/signList/signList.js
const util = require('../../utils/util.js');
var url = getApp().globalData.url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbar: ['我发起的', '我参与的'],
    currentTab: 0,
    postSignMess: [],
    postMore: true,
    attendMore: true,
    attendSignMess: [],
    postPageIndex: 0,
    postPageSize: 3,
    attendPageIndex: 0,
    attendPageSize: 3,
    haveRight:false
  },

  navbarTap: function(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    });
    if (this.data.currentTab == 0) {
      this.setData({
        postMore:true
      });
      this.getPostSign();
    }
    if (this.data.currentTab == 1) {
      this.setData({
        attendMore:true
      });
      this.getAttendSign();
    }
  },

  // 返回时刷新上一页
  changeData: function () {
    this.onLoad();
  },

  // 获取用户信息
  getUserInfo: function (e) {
    util.getUserInfo(function () {
      wx.reLaunch({
        url: '../signList/signList',
      })
    });
  },

  /**
   * 获取本人发起的签到列表
   */
  getPostSign: function() {
    // console.log('getPostSign');
    if (!this.data.postMore) {
      return;
    }
    if (wx.getStorageSync('openId')) {
      wx.request({
        url: url + '/api/sign/signlist',
        method: 'GET',
        data: {
          page: ++this.data.postPageIndex,
          size: this.data.postPageSize,
          openid: wx.getStorageSync('openId')
        },
        success: (res) => {
          console.log(res);
          var newList = this.data.postSignMess.concat(res.data.data);
          var count = parseInt(res.header['X-Total-Count']);
          var flag = (this.data.postPageIndex * this.data.postPageSize < count) && (count !== 0) ? true : false;
          this.setData({
            postMore: flag
          })
          // 获取每一个签到的参与人数
          newList.forEach((item, index, array) => {
            wx.request({
              url: url + '/api/join/joincount',
              method: 'GET',
              data: {
                signid: item['id']
              },
              success: (result) => {
                newList[index]['count'] = result.data;
                this.setData({
                  postSignMess: newList,
                });
              }
            })
          });
        }
      })
    } else {
      this.setData({
        postMore: false
      })
    }
  },

  /**
   * 对象按照key值排序
   */
  keysrt: function (prop) {
    return function (obj1, obj2) {
      var val1 = obj1[prop];
      var val2 = obj2[prop]; 
      if (val1 > val2) {
        return -1;
      } else if (val1 < val2) {
        return 1;
      } else {
        return 0;
      }
    }
  },
  /**
   * 获取本人参与的签到列表
   */
  getAttendSign: function() {
    // console.log('getAttendSign');
    if (!this.data.attendMore) {
      return;
    }
    if (wx.getStorageSync('openId')) {
      wx.request({
        url: url + '/api/join/attendsign',
        method: 'GET',
        data: {
          // page: ++this.data.attendPageIndex,
          // size: this.data.attendPageSize,
          openid: wx.getStorageSync('openId')
        },
        success: (res) => {
          // var newList = this.data.attendSignMess.concat(res.data.data);
          // var count = parseInt(res.header['X-Total-Count']);
          // var flag = (this.data.attendPageIndex * this.data.attendPageSize < count) && (count !== 0) ? true : false;
          // this.setData({
          //   attendMore: flag
          // })

          var newList = res.data;
          console.log(newList);
          // 获取每一个签到的参与人数
          newList.forEach((item, index, array) => {
            wx.request({
              url: url + '/api/join/joincount',
              method: 'GET',
              data: {
                signid: item['id']
              },
              success: (result) => {
                newList[index]['count'] = result.data;
                newList.sort(this.keysrt('join_id'));
                // console.log(newList);
                this.setData({
                  attendSignMess: newList,
                  attendMore:false
                });
              }
            })
          });
        }
      })
    }
    // else {
    //   this.setData({
    //     attendMore: false
    //   })
    // }
  },

  /**
   * 删除我发起的签到
   */

  deleteSign: function(e) {
    // console.log(e.currentTarget.dataset.id);
    wx.request({
      url: url + '/api/sign/delete',
      method: 'GET',
      data: {
        id: e.currentTarget.dataset.id
      },
      header: {
        "Content-Type": "application/json"
      },
      success: (res) => {
        // console.log(res);
        var postSignMess = this.data.postSignMess;
        postSignMess.forEach((item, index, array) => {
          if (item['id'] == e.currentTarget.dataset.id) {
            postSignMess.splice(index, 1);
          }
        });
        this.setData({
          postSignMess: postSignMess
        });
      }
    })
  },

  /**
   * 删除我参与的签到
   */
  deleteJoinSign: function(e) {
    wx.request({
      url: url + '/api/join/deletejoin',
      method: 'GET',
      data: {
        signid: e.currentTarget.dataset.id
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // console.log(1);
        var attendSignMess = this.data.attendSignMess;
        // console.log(attendSignMess);
        attendSignMess.forEach((item, index, array) => {
          if (item['id'] == e.currentTarget.dataset.id) {
            attendSignMess.splice(index, 1);
          }
        });
        this.setData({
          attendSignMess: attendSignMess
        });
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '数据加载中',
    });
    if(options.currentTab){
      this.setData({
        currentTab:options.currentTab
      });
    }
    if (this.data.currentTab == 0) {
      this.getPostSign();
    }
    if (this.data.currentTab == 1) {
      this.getAttendSign();
    }
    wx.hideLoading();
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
    if (wx.getStorageSync('openId')==''){
      this.setData({
        haveRight:false
      })
    }else{
      this.setData({
        haveRight: true
      })
    }
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
    if (this.data.currentTab == 0) {
      this.getPostSign();
    }
    if (this.data.currentTab == 1) {
      this.getAttendSign();
    }
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.currentTab == 0) {
      this.getPostSign();
    }
    if (this.data.currentTab == 1) {
      // console.log(1);
      // this.getAttendSign();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})