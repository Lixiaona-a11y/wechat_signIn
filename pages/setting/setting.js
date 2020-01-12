// pages/setting/setting.js
var url = getApp().globalData.url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    choiceArr: [{
        choice: '姓名',
        alias: 'name',
        checked: false
      }, {
        choice: '手机号',
        alias: 'phone',
        checked: false
      }, {
        choice: '学校',
        alias: 'school',
        checked: false
      }, {
        choice: '班级',
        alias: 'class_number',
        checked: false
      }, {
        choice: '性别',
        alias: 'gender',
        checked: false
      }, {
        choice: '单位',
        alias :'jobunit',
        checked: false
      }, {
        choice: '学号',
        alias :'stu_number',
        checked: false
      },
      {
        choice: '员工号',
        alias :'work_number',
        checked: false
      },
    ],
    selectedArr: [],
    signId: null
  },

  getSelected: function(e) {
    // 点击选中 改变样式
    // console.log(e.currentTarget.dataset.index);
    let index = e.currentTarget.dataset.index;
    let choiceArr = this.data.choiceArr;
    choiceArr[index].checked = !choiceArr[index].checked;
    this.setData({
      choiceArr: choiceArr
    });

    // 将选中项加入selectedArr数组中
    let selectedArr = this.data.selectedArr;
    let selectedArrSet = new Set(selectedArr);
    if (choiceArr[index].checked) {
      selectedArrSet.add(choiceArr[index]['alias'] + '-' + choiceArr[index]['choice']);
      this.setData({
        selectedArr: [...selectedArrSet]
      });
    } else {
      selectedArrSet.delete(choiceArr[index]['alias'] + '-' + choiceArr[index]['choice']);
      this.setData({
        selectedArr: [...selectedArrSet]
      });
    }
  },

  submit: function() {
    // console.log(this.data.selectedArr);
    // console.log(this.data.signId);
    wx.request({
      url: url+'/api/sign/setting',
      method: 'POST',
      data: {
        // 由于后台接受的都是字符串，所以使用JSON.stringify()格式化数组
        settingArr: JSON.stringify(this.data.selectedArr),
        signId: this.data.signId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        console.log(res.data);
      }
    });
    wx.reLaunch({
      url: '/pages/signList/signList',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      signId: options.id
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
  onShareAppMessage: function() {

  }
})