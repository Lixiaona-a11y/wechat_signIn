// components/calendar/calendar.js
/**
 * 日历选择组件
 */
Component({
  /**
   * 组件的属性列表
   * data [Date] 当前现实的月份
   * selected [Array] 所有被选择的天
   */
  behaviors: ['wx://form-field'],//wx://form-field 代表一个内置 behavior ，它使得这个自定义组件有类似于表单控件的行为。
  properties: {
    minDate: {
      type: Array,
      value: []
    },
    maxDate: {
      type: Array,
      value: []
    },
    datefromparent:{
      type:Array,
      value:[]
    }
  },
  /**
   * 组件的初始数据
   */
  ready() {
    this.setData({
      value: this.data.datefromparent[0] + '-' + this.data.datefromparent[1] + '-' + this.data.datefromparent[2],// behaviors: ['wx://form-field']里面就有设置value属性，所以我们可以直接拿来设置 提交表单数据中的value
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    bindDateChange: function(e) {
      let chooseDay = e.detail.value;
      let chooseDayArr = chooseDay.split('-');
      this.setData({
        datefromparent: chooseDayArr
      });
      this.triggerEvent("sendDateToParent", chooseDayArr);

      this.setData({
        value: e.detail.value // behaviors: ['wx://form-field']里面就有设置value属性，所以我们可以直接拿来设置提交表单数据中的value
      });
    }
  }
})