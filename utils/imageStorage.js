// utils/imageStorage.js
const config = require('../config/config.js')

class ImageStorage {
  constructor() {
    this.storagePath = config.image.storagePath
  }

  // 下载图片并存储
  async downloadAndSaveImage(imageUrl, type) {
    try {
      // 生成文件名
      const fileName = `${type}_${Date.now()}.png`
      const filePath = `${this.storagePath}${fileName}`
      
      // 下载图片
      const downloadTask = wx.downloadFile({
        url: imageUrl,
        filePath: wx.env.USER_DATA_PATH + '/' + fileName,
        success: (res) => {
          if (res.statusCode === 200) {
            console.log('Image downloaded successfully:', res.tempFilePath)
            return res.tempFilePath
          }
        },
        fail: (err) => {
          console.error('Image download failed:', err)
          return null
        }
      })
      
      // 监控下载进度
      downloadTask.onProgressUpdate((res) => {
        console.log('Download progress:', res.progress)
      })
      
      return new Promise((resolve) => {
        downloadTask.onComplete((res) => {
          if (res.statusCode === 200) {
            resolve(res.tempFilePath)
          } else {
            resolve(null)
          }
        })
      })
    } catch (error) {
      console.error('Image storage error:', error)
      return null
    }
  }

  // 获取存储的图片列表
  getSavedImages() {
    return new Promise((resolve) => {
      wx.getSavedFileList({
        success: (res) => {
          resolve(res.fileList)
        },
        fail: (err) => {
          console.error('Get saved files failed:', err)
          resolve([])
        }
      })
    })
  }

  // 删除存储的图片
  deleteSavedImage(filePath) {
    return new Promise((resolve) => {
      wx.removeSavedFile({
        filePath: filePath,
        success: () => {
          resolve(true)
        },
        fail: (err) => {
          console.error('Delete saved file failed:', err)
          resolve(false)
        }
      })
    })
  }
}

module.exports = new ImageStorage()