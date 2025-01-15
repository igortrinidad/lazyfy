import { FileUploadService } from '../../src/Frontend/FileUploadService'

describe('FileUploadService', () => {

  let mockAxiosInstance: any
  let mockGetPresignedUrl: string

  beforeEach(() => {
    mockAxiosInstance = { post: jest.fn() }
    mockGetPresignedUrl = 'https://example.com/presigned-url'
  })

  test('should initialize with default values when no folder or ACL is provided', () => {
    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl)

    expect(service.get_presigned_url).toBe(mockGetPresignedUrl)
    expect(service.folder).toBe('')
    expect(service.ACL).toBe('public-read')
    expect(service.axiosInstance).toBe(mockAxiosInstance)
  })

  test('should initialize with provided folder and ACL', () => {
    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl, 'uploads', 'private')

    expect(service.folder).toBe('uploads')
    expect(service.ACL).toBe('private')
  })

  test('should have correct default properties', () => {
    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl)

    expect(service.name).toBe('')
    expect(service.ContentType).toBe('')
    expect(service.extension).toBe('')
    expect(service.size).toBe(0)
    expect(service.lastModified).toBe('')
    expect(service.source).toBe(null)
    expect(service.imageMaxWidth).toBe(1980)
    expect(service.imageMaxHeight).toBe(1980)
    expect(service.imageQuality).toBe(0.8)
    expect(service.status).toBe('Empty')
    expect(service.progress).toBe(0)
    expect(service.fileContentBlob).toBe(null)
    expect(service.file_path).toBe('')
    expect(service.file_name).toBe('')
    expect(service.isLoading).toBe(false)
  })

  test('should correctly compute color from name', () => {
    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl)
    service.name = 'test.jpg'

    expect(service.color).toBe('#eab308')
  })

  test('should correctly format file name', () => {

    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl)
    service.name = 'asdasdas/asda/test.jpg'

    expect(service.formatted_name).toBe('test.jpg')
  })

  test('should correctly format file size', () => {

    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl)
    service.size = 1200000

    expect(service.formatted_size).toBe('1.14 MB')
  })

  test('should identify image based on ContentType', () => {
    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl)

    service.ContentType = 'image/png'
    expect(service.getFileIsImage).toBe(true)

    service.ContentType = 'video/mp4'
    expect(service.getFileIsImage).toBe(false)
  })

  test('should update properties when setFile is called and check if the file type is converted to webp', () => {
    const mockFile = {
      name: 'image.png',
      type: 'image/png',
      size: 150000,
      lastModified: '2025-01-01'
    }

    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl, '', 'public-read', true)
    service.setFile(mockFile)

    expect(service.size).toBe(mockFile.size)
    expect(service.lastModified).toBe(mockFile.lastModified)
    expect(service.name).toBe(mockFile.name.replace('.png', '.webp'))
    expect(service.extension).toBe('.webp')
    expect(service.ContentType).toBe('image/webp')
    expect(service.source).toBe(mockFile)
    expect(service.status).toBe('Selected')
  })
  
  test('should update properties when setFile is called and check if the file type is NOT converted to webp', () => {
    const mockFile = {
      name: 'image.png',
      type: 'image/png',
      size: 150000,
      lastModified: '2025-01-01'
    }

    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl, '', 'public-read', false)
    service.setFile(mockFile)

    expect(service.name).toBe(mockFile.name)
    expect(service.ContentType).toBe(mockFile.type)
    expect(service.size).toBe(mockFile.size)
    expect(service.lastModified).toBe(mockFile.lastModified)
    expect(service.extension).toBe('.png')
    expect(service.ContentType).toBe('image/png')
    expect(service.source).toBe(mockFile)
    expect(service.status).toBe('Selected')
  })

  test('should throw error when setFileFromBlob is called without a blob', () => {
    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl)

    expect(() => service.setFileFromBlob(null)).toThrow('Blob is required')
  })

  test('should update properties when setFileFromBlob is called with valid blob and NOT change the file type', () => {
    const mockBlob = new Blob(['test content'], { type: 'image/png' })

    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl, '', 'public-read', false)
    service.setFileFromBlob(mockBlob, 'image/png')

    expect(service.ContentType).toBe('image/png')
    expect(service.extension).toBe('.png')
    expect(service.name).toMatch(/image_\d+\.png/)
    expect(service.status).toBe('Selected')
    expect(service.fileContentBlob).toBe(mockBlob)
  })
  
  test('should update properties when setFileFromBlob is called with valid blob and chaging the file type to webp', () => {
    const mockBlob = new Blob(['test content'], { type: 'image/png' })

    const service = new FileUploadService(mockAxiosInstance, mockGetPresignedUrl, '', 'public-read', true)
    service.setFileFromBlob(mockBlob, 'image/png')
    expect(service.ContentType).toBe('image/webp')
    expect(service.extension).toBe('.webp')
    expect(service.name).toMatch(/image_\d+\.webp/)
    expect(service.status).toBe('Selected')
    expect(service.fileContentBlob).toBe(mockBlob)
  })
})
