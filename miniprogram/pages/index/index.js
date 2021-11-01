//index.js
const app = getApp()
const util = require('../../utils/util.js');
const api = require('../../config/api.js');

Page({
  data: {
    // 轮播图
    banner: [{
      url: '../../static/images/banner1.png'
    }],
    // 视频名称
    nickname: '',
    // 文字
    desc: '',
    // 链接
    url: 'https://v.douyin.com/dbkYKmK/',
    // 视频
    video: ''
  },

  onLoad: function () {
    this.searchTap()
  },

  onShow: function () {
    wx.getClipboardData({
      success: (res) => {
        // 匹配地址
        let result = util.handleUrl(res.data)
        if (!result) {
          return
        }
        // 如果地址相同则不在显示
        if (result == this.data.url) {
          return
        }
        wx.showModal({
          title: '检测到视频链接，是否粘贴？',
          content: result,
          showCancel: true, //是否显示取消按钮
          cancelText: "取消", //默认是“取消”
          cancelColor: '#fe6b35', //取消文字的颜色
          confirmText: "粘贴", //默认是“确定”
          confirmColor: '#fe6b35', //确定文字的颜色
          success: (res) => {
            if (res.cancel) {} else {
              this.setData({
                url: result,
              })
            }
          },
        })
      }
    })
  },

  onShareAppMessage: function() { 
    return { 
      title: '去水印', 
      desc: '一键去水印', 
      path: '/pages/index/index' 
    } 
  }, 

  // 搜索框事件
  bindKeyInput: function (e) {
    this.setData({
      url: e.detail.value
    })
  },

  // 清除事件
  closeTap() {
    this.setData({
      url: ''
    })
  },

  // 解析事件
  searchTap() {
    let url = this.data.url
    if (!url) {
      wx.showModal({
        title: '温馨提示',
        content: '网址不能为空',
        showCancel: false,
        confirmColor: '#fe6b35',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
      return
    }
    wx.showLoading({
      title: '加载中...',
    })
    let data = {
      url: url
    }
    util.request(api.IndexUrl, data).then(res => {
      wx.hideLoading()
      if (res.status === "success") {
        let video = res.mp4
        let nickname = res.nickname
        let desc = res.desc
        this.setData({
          video: video,
          nickname: nickname,
          desc: desc
        })
      }
    });
  },

  // 下载视频
  downloadFile(e) {
    let url = this.data.video;
    // let fullName = this.data.nickname
    wx.downloadFile({
      url: url,
      // filePath: wx.env.USER_DATA_PATH + '/' + fullName,
      success(res) {
        if (res.statusCode === 200) {
          wx.hideLoading()
          // let tempFilePath = res.filePath  // 如果设置了filePath参数，则不会有tempFilePath
          let tempFilePath = res.tempFilePath
          console.log('tempFilePath', tempFilePath, res)
          wx.saveFile({
            tempFilePath,
            success(res) {
              // 可以进行到这里
              console.log(res);
              const savedFilePath = res.savedFilePath
              console.log(savedFilePath)
              wx.showToast({
                title: '下载成功',
                icon: 'none',
                mask: true
              })
            },
            fail(err) {
              console.log(err);
              wx.showToast({
                title: '下载失败，请重新尝试',
                icon: 'none',
                mask: true
              })
            }
          })
        }
      }
    })
  },

  // 复制链接
  setClipboardData() {
    wx.setClipboardData({
      data: this.data.video,
      success() {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 1000
        })
      }
    })
  }
})