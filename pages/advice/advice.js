// pages/advice/advice.js
var url = getApp().globalData.url;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 提示字数不可超过200
   */
  showTips:function(e){
    // console.log(e.detail.value)
    if (e.detail.value.length==200) {
      wx.showToast({
        title: '已满200字',
        icon: 'none',
        duration: 1000
      });
    }
  },
  /**
   * 提交反馈意见
   */
  goSubmit: function(e) {
    // console.log(e.detail.value);
    if(e.detail.value.advice==''){
      wx.showToast({
        title: '请输入您的反馈意见',
        icon: 'none',
        duration: 1000
      });
      return false;
    }
   
    wx.request({
      url: url+'/api/advice/postadvice',
      method: 'POST',
      data: {
        advice: e.detail.value.advice
      },
      header :{
        'content-type': 'application/x-www-form-urlencoded'
      },
      success:(res)=>{
        wx.showToast({
          title: '已提交，感谢您的意见',
          icon:'none',
          ducation:1000
        })
        wx.reLaunch({
          url: '../index/index',
        })
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