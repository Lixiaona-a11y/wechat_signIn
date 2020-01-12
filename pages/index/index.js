//index.js
//获取应用实例
const app = getApp()
var url = getApp().globalData.url;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: [],
    haveSign: true, //能否点击签到，true签到按钮亮，false签到按钮暗
    sentence: {
      statement: '只要是我们经历做了，我相信，谁都可以成为自己的英雄。',
      nickname: '匿名'
    }
  },

  getOneSentence: function() {
    console.log(url + '/api/user/onestate');
    wx.request({
      url: url + '/api/user/onestate',
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        // console.log(res);
        if (res.data[0] !== undefined) {
          this.setData({
            sentence: {
              statement: res.data[0]['statement'],
              nickname: res.data[0]['nickname']
            }
          })
        }
      }
    })
  },

  scancode: function() { // 允许从相机和相册扫码   
    wx.scanCode({
      success(res) {
        console.log(res);
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: (res) => {
        console.log(res);
        wx.showToast({
          title: '失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  getClearFromChild:function(e){
    this.setData({
      haveSign:true
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getStorage({
      key: 'selected',
      success: function(res) {
        that.setData({
          selected: res.data
        });
        // 检测是否过了一天
        // console.log(that.data.selected);
        let preDate = that.data.selected[that.data.selected.length - 1]['date'];
        let nowDate = new Date();
        let preDateArr = preDate.split('-');
        let pre_year = preDateArr[0];
        let pre_month = preDateArr[1];
        let pre_date = preDateArr[2];
        let now_year = nowDate.getFullYear();
        let now_month = nowDate.getMonth() + 1;
        let now_date = nowDate.getDate();
        // console.log(now_year,now_month,now_date);
        if (pre_year == now_year && pre_month == now_month && pre_date == now_date) {
          that.setData({
            haveSign: false
          });
        } else {
          that.setData({
            haveSign: true
          });
        }
      }
    });

    that.getOneSentence();

    // 
  },
  /**
   * 日历是否被打开
   */
  bindselect(e) {
    // console.log(e.detail.ischeck)
  },
  /**
   * 获取选择日期
   */
  bindgetdate(e) {
    let time = e.detail;
    // console.log(time)
  },

  /**
   * 签到小助手
   */
  signIn: function() {
    if (!this.data.haveSign) {
      return;
    } else {
      let today = new Date();
      let year = today.getFullYear(); //年
      let month = today.getMonth() + 1; //月
      let date = today.getDate(); //日
      let currentDays = this.data.selected;
      currentDays.push({
        'date': year + '-' + month + '-' + date
      });
      this.setData({
        selected: currentDays,
        haveSign: false
      });
      wx.setStorage({
        key: 'selected',
        data: this.data.selected,
        success: function(res) {
          // console.log(res);
        }
      })
    }
    // console.log(this.data.selected);
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