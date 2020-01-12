// pages/statistics/statistics.js
var url = getApp().globalData.url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbar: ['所有成员', '签到统计'],
    currentTab: 0,
    member: []
  },

  navbarTap: function(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },

// 数组对象的排序
// compare:function(property){
//   var arr = [
//     { name: 'zopp', age: 0 },
//     { name: 'gpp', age: 18 },
//     { name: 'yjj', age: 8 }
//   ];

//   function compare(property) {
//     return function (a, b) {
//       var value1 = a[property];
//       var value2 = b[property];
//       return value1 - value2;
//     }
//   }
// },

  getAllMembers: function(signid) {
    wx.request({
      url: url+'/api/join/allmembers',
      method:'GET',
      header:{
        'Content-Type':'application/json'
      },
      data:{
        signid:signid
      },
      success:(res)=>{
        console.log(res.data);
        // res.data.sort(this.compare('totalSign'));
        this.setData({
          member: res.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getAllMembers(options.signid);
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