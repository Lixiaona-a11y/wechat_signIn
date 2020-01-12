var url = 'https://www.wkz2019.xyz';

function getUserInfo(callback) {
  // console.log(e);
  // 获取用户设置信息 查看用户是否已授权
  wx.getSetting({
    success(res) {
      console.log(res.authSetting['scope.userInfo']);
      if (res.authSetting['scope.userInfo']) {
        // console.log('已授权======');
        let openId = wx.getStorageSync('openId');
        if (openId) {
          wx.getUserInfo({
            success(res) {
              getApp().globalData.nickName = res.userInfo.nickName;
              getApp().globalData.avatarUrl = res.userInfo.avatarUrl;
              callback();
            },
            fail(res) {
              // console.log("获取用户信息失败", res);
            }
          })
        } else {
          wx.login({
            success(res) {
              // console.log(res.code);
              // return;
              if (res.code) {
                wx.getUserInfo({
                  success: function(res_user) {
                    wx.request({
                      url: url + '/api/user/openid',
                      data: {
                        code: res.code,
                        avatar: res_user.userInfo.avatarUrl,
                        nickname: res_user.userInfo.nickName
                      },
                      method: 'POST',
                      header: {
                        'content-type': 'application/x-www-form-urlencoded'
                      },
                      success: function(result) {
                        getApp().globalData.nickName = res_user.userInfo.nickName;
                        getApp().globalData.avatarUrl = res_user.userInfo.avatarUrl;
                        wx.setStorageSync('openId', result.data.openid);
                        callback();
                      }
                    })
                  }
                })
              }
            }
          })
        }
      } else {
        showSettingToast("请授权", callback);
      }
    }
  })
}

function showSettingToast(e, callback) {
  wx.showModal({
    title: '提示',
    content: '设置',
    showCancel: false,
    content: e,
    success: function(res) {
      if (res.confirm) {
        wx.openSetting({
          success: function(data) {
            if (data.authSetting['scope.userInfo']) {
              wx.showToast({
                title: '授权成功',
                icon: 'success',
                duration: 1000
              })
              getUserInfo(callback);
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

function getUserLocation(resolve, reject) {
  wx.getLocation({
    success: function(res) {
      // console.log(res.latitude, res.longitude)
      resolve();
    },
    fail() {
      wx.showModal({
        title: '提醒',
        content: '您拒绝了位置授权，将无法使用大部分功能，点击确定重新获取授权',
        success(res) {
          //如果点击确定
          if (res.confirm) {
            wx.openSetting({
              success(res) {
                //如果同意了位置授权则userLocation=true
                if (res.authSetting["scope.userLocation"]) {
                  resolve();
                }else{
                  reject();
                }
              }
            })
          } else {
            reject();
          }
        }
      });
    }
  })

}

module.exports = {
  getUserInfo: getUserInfo,
  getUserLocation: getUserLocation
}