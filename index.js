require('dotenv').config()
const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const Jimp = require('jimp')

let main = async () => {
  const paramList = {
    Bucket: 'osu-energy-images'
  }
  let imageNames = await (new Promise((resolve, reject) => {
    S3.listObjects(paramList, (err, data) => {
      if (err) reject(err)
      else resolve(data.Contents)
    })
  }))

  for (let image of imageNames) {
    if (image['Key'] && image['Key'].split('/').length === 1) {
      const paramData = {
        Bucket: 'osu-energy-images',
        Key: image['Key']
      }
      let imageData = (await (new Promise((resolve, reject) => {
        S3.getObject(paramData, (err, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      }))).Body
      let jImage = await Jimp.read(imageData)
      jImage.cover(400,266)
      // let rData = await (new Promise((resolve, reject) => {
      //   jImage.getBase64(Jimp.AUTO, (err, data) => {
      //     if (err) reject(err)
      //     else resolve(data)
      //   })
      // }))
      let rData = await jImage.getBufferAsync(Jimp.MIME_JPEG)
      await (new Promise((resolve, reject) => {
        const uploadParams = {
          Bucket: 'osu-energy-images',
          Key: 'thumbnails/' + image['Key'],
          Body: rData
        }
        S3.putObject(uploadParams, (err, data) => {
          if (err) reject()
          else resolve()
        })
      }))
    } else {
      console.log(image)
    }
  }
}
main()
