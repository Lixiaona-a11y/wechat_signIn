// pages/postStatement/postStatement.js
const util = require('../../utils/util.js');
var url = getApp().globalData.url;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  // 获取用户信息
  getUserInfo: function(e) {
    util.getUserInfo(function() {
      return;
    });
  },

  // 发布'每日好句'
  postStatement: function(e) {
    var statement = e.detail.value.statement;
    var openid = wx.getStorageSync('openId');
    // console.log(openid,statement);
    wx.getSetting({
      success: (result) => {
        if (result.authSetting['scope.userInfo']) {
          // console.log('2');
          if(statement){
            wx.request({
              url: url + '/api/user/poststate',
              method: 'POST',
              data: {
                openid: openid,
                statement: statement
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: (res) => {
                // console.log(res);
                wx.switchTab({
                  url: '../index/index',
                  success: function (event) {
                    var page = getCurrentPages().pop();
                    if (page == undefined || page == null) return;
                    page.onLoad();
                  }
                })
              }
            })
          }else{
            wx.showToast({
              title: '展示句子为空时不可提交',
              icon: 'none',
              duration: 1000
            })
          }
     
        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
  onShareAppMessage: function() {

  }
})