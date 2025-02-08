import { FileUploadService } from '../../../src/Frontend/FileUploadService'

describe('FileUploadService Initialization Tests', () => {
  test('should correctly initialize with all arguments provided', () => {
    const axiosInstanceMock = {}  
    const presignedUrl = 'https://example.com/get-presigned-url'
    const folder = 'test-folder'
    const ACL = 'private'
    const shouldConvertToWebp = false

    const service = new FileUploadService(
      axiosInstanceMock, 
      presignedUrl, 
      folder, 
      ACL, 
      shouldConvertToWebp
    )

    expect(service.axiosInstance).toBe(axiosInstanceMock)
    expect(service.get_presigned_url).toBe(presignedUrl)
    expect(service.folder).toBe(folder)
    expect(service.ACL).toBe(ACL)
    expect(service.should_convert_image_to_webp).toBe(shouldConvertToWebp)
  })

  test('should correctly initialize with optional arguments missing', () => {
    const axiosInstanceMock = {}
    const presignedUrl = 'https://example.com/get-presigned-url'

    const service = new FileUploadService(
      axiosInstanceMock, 
      presignedUrl
    )

    expect(service.axiosInstance).toBe(axiosInstanceMock)
    expect(service.get_presigned_url).toBe(presignedUrl)
    expect(service.folder).toBe('')
    expect(service.ACL).toBe('public-read')
    expect(service.should_convert_image_to_webp).toBe(true)
  })

  test('should set default values for class properties when no parameters are provided', () => {
    const service = new FileUploadService(null, '')

    expect(service.folder).toBe('')
    expect(service.name).toBe('')
    expect(service.ACL).toBe('public-read')
    expect(service.ContentType).toBe('')
    expect(service.extension).toBe('')
    expect(service.size).toBe(0)
    expect(service.lastModified).toBe('')
    expect(service.source).toBeNull()
    expect(service.should_convert_image_to_webp).toBe(true)
    expect(service.imageMaxWidth).toBe(1980)
    expect(service.imageMaxHeight).toBe(1980)
    expect(service.imageQuality).toBe(0.8)
    expect(service.status).toBe('Empty')
    expect(service.progress).toBe(0)
    expect(service.fileContentBlob).toBeNull()
    expect(service.file_path).toBe('')
    expect(service.file_name).toBe('')
    expect(service.get_presigned_url).toBe('')
    expect(service.presigned_url).toBe('')
    expect(service.isLoading).toBe(false)
    expect(service.axiosInstance).toBeNull()
  })
})
