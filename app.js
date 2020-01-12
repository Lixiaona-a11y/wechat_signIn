App({

  globalData: {
    nickName: '', //用户昵称
    avatarUrl: '', //用户头像路径
    userInfo: {},
    url: 'https://www.wkz2019.xyz'
  },

  userInfoReadyCallback:function(res){
    this.globalData.userInfo = res.userInfo;
    if (this.globalData.userInfo.avatarUrl != '') {
      this.globalData.avatarUrl = this.globalData.userInfo.avatarUrl;
      this.globalData.nickName = this.globalData.userInfo.nickName;
      console.log(this.globalData.url + '/api/user/updateuser');
      wx.request({
        url: this.globalData.url + '/api/user/updateuser',
        data: {
          openid: wx.getStorageSync('openId'),
          avatar: this.globalData.avatarUrl,
          nickname: this.globalData.nickName
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: (result) => {
          // console.log('已修改');
        }
      })
    } else if (wx.canIUse('button.open-type.getUserInfo')) {
      this.globalData.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }

  },

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function() {
    // const util = require('./utils/util.js');
    // util.getUserInfo(function(c) {
    //   return;
    // });
    // wx.getSetting({
    //   success: (res) => {
    //     if (res.authSetting['scope.userInfo']) {
    //       util.getUserInfo(function(c) {
    //         // console.log(c);
    //         return;
    //       });
    //     }
    //   }
    // })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 说明用户信息已经授权，可直接调用wx.getUserInfo获取，
          wx.getUserInfo({
            success: res => {
              // console.log(res)
              this.globalData.userInfo = res.userInfo;
              // console.log(this.globalData.userInfo);
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回                   
              // 所以此处加入 callback 以防止这种情况                    
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });


  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function(options) {

  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function() {

  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function(msg) {

  }
})