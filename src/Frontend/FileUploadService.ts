import { formatFileColor, formatFileName, formatFileSize } from '../helpers/file-helpers'

export class FileUploadService {
  
  public folder: string = ''
  public name: string = ''
  public ACL: string = 'private'
  public ContentType: string = '' 
  public extension: string = ''
  public size: number = 0
  public lastModified: string = ''
  public source: any = null
  public should_convert_image_to_webp: boolean = true
  public imageMaxWidth: number = 1980
  public imageMaxHeight: number = 1980
  public imageQuality: number = 0.8

  public status: string = 'Empty'
  public progress: number = 0
  public fileContentBlob: any = null

  public file_path: string = ''
  public file_name: string = ''
  public get_presigned_url: string = ''
  public presigned_url: string = ''
  public isLoading: boolean = false
  public axiosInstance: any

  constructor(axiosInstance: any, get_presigned_url: string, folder: string = '', ACL = 'public-read', should_convert_image_to_webp = true) {
    this.axiosInstance = axiosInstance
    this.get_presigned_url = get_presigned_url
    this.folder = folder
    this.ACL = ACL
    this.should_convert_image_to_webp = should_convert_image_to_webp
  }

  public get color() {
    return formatFileColor(this.name)
  }
  
  public get formatted_name() {
    return formatFileName(this.name) ?? ''
  }
  
  public get formatted_size() {
    return formatFileSize(this.size) ?? '0kb'
  }

  public async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  public setFile(file: any) {
    this.name = file.name
    this.ContentType = file.type
    this.size = file.size
    this.lastModified = file.lastModified
    this.extension = '.' + this.name.split('.').pop()?.toLowerCase() || ''
    this.source = file
    this.status = 'Selected'
    this.setExtensionAndNameForImageToImprovePerformance()
  }

  public setFileFromMediaRecorded(ContentType: string = 'video/webm', recordedChunks: any) {
    this.ContentType = ContentType
    this.extension = '.' + ContentType.split('/').pop() || 'webm'
    this.name = `recorded_at_${ new Date().getTime() }${ this.extension }`
    this.status = 'Selected'
    this.fileContentBlob = new Blob(recordedChunks, { type: ContentType })
  }

  public setFileFromBlob(blob: any, ContentType: string = 'image/webp') {
    if(!blob) {
      throw new Error('Blob is required')
    }
    this.ContentType = ContentType
    this.extension = '.' + ContentType.split('/').pop() || 'webp'
    this.name = `image_${ new Date().getTime() }${ this.extension }`
    this.status = 'Selected'
    this.fileContentBlob = blob
    this.source = blob
    this.setExtensionAndNameForImageToImprovePerformance()
  }

  private setExtensionAndNameForImageToImprovePerformance() {
    if(this.getFileIsImage && this.should_convert_image_to_webp) {
      this.extension = '.webp'
      this.name = `${ this.name.split('.').shift() }.webp`
      this.ContentType = 'image/webp'
    }
  }

  public async upload() {
    if(this.isLoading) return
    try {
      this.isLoading = true
      await this.readFileAndUpload()
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.isLoading = false
    }
  }

  public async uploadBlob() {
    if(this.isLoading) return
    try {
      this.isLoading = true
      await this.uploadFileToAws()
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.isLoading = false
    }
  }

  public async uploadRecordedMedia() {
    if(this.isLoading) return
    try {
      this.isLoading = true
      await this.uploadFileToAws()
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      this.isLoading = false
    }
  }

  public get getFileIsImage() {
    return this.ContentType.includes('image')
  }
 

  protected async getPresignedUrlFromApi() {
    const { folder: folder_path, get_presigned_url, extension, ACL, ContentType, name } = this
    try {
      const { data } = await this.axiosInstance.post(get_presigned_url, { folder_path, extension, name, ContentType, ACL })
      this.file_path = data.file_path
      this.file_name = data.file_name
      this.presigned_url = data.presigned_url
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  private readFileAndUpload(): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (event: any) => {
        this.status = 'Preparing'
        if(this.getFileIsImage && this.should_convert_image_to_webp) {
          this.fileContentBlob = await this.convertImageToWebp(event.target.result)
        } else {
          this.fileContentBlob = event.target.result
        }
        try {
          await this.uploadFileToAws()
          resolve()
        } catch (error) {
          this.status = 'Error'
          reject(error)
        }
      };

      reader.onerror = (error) => {
        this.status = 'Error'
        reject(error)
      }

      if(this.getFileIsImage) {
        reader.readAsDataURL(this.source)
      } else {
        reader.readAsArrayBuffer(this.source)
      }

    })
  }

  private async convertImageToWebp(image: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image()
        img.src = image
  
        img.onload = () => {
          let newWidth = this.imageMaxWidth
          let newHeight = this.imageMaxHeight

          const aspectRatio = img.width / img.height

          if (aspectRatio > 1) {
            newHeight = Math.min(this.imageMaxHeight, this.imageMaxWidth / aspectRatio)
          } else {
            newWidth = Math.min(this.imageMaxWidth, this.imageMaxHeight * aspectRatio)
          }

          const canvas = document.createElement('canvas')
          canvas.width = newWidth
          canvas.height = newHeight

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas context is null'))
            return
          }

          ctx.drawImage(img, 0, 0, newWidth, newHeight)
  
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Conversion to WebP failed'))
              return
            }
            resolve(blob)
          }, 'image/webp', this.imageQuality)
        }
      } catch (error) {
        console.error(error)
        reject(error)
      }
    })
  }

  protected uploadFileToAws(multipart_chunk?: any): Promise<void> {

    return new Promise((resolve, reject) => {

      this.status = 'Uploading'

      const xhr = new XMLHttpRequest()
      xhr.open('PUT', multipart_chunk ? multipart_chunk.presigned_url : this.presigned_url, true)
      xhr.setRequestHeader('Content-Type', this.ContentType)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentage = (e.loaded / e.total) * 100
          this.progress = percentage
          if(multipart_chunk) multipart_chunk.progress = percentage
        }
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            this.status = 'Complete'
            const ETag = xhr.getResponseHeader("ETag")
            if (ETag && multipart_chunk) {
              multipart_chunk.ETag = ETag.replace(/"/g, "")
            }
            resolve()
          } else {
            this.status = 'Error'
            console.error('File upload failed.')
            reject()
          }
        }
      }

      xhr.send(multipart_chunk ? multipart_chunk.file : this.fileContentBlob)

    })
  }
  
}