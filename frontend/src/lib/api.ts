import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// PDF API
export const pdfAPI = {
  mergePDFs: async (files: File[], onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    
    const response = await api.post('/pdf/merge', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress?.(progress)
        }
      },
    })
    
    return response.data
  },
  
  compressPDF: async (file: File, quality: string = 'medium', onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('quality', quality)
    
    const response = await api.post('/pdf/compress', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress?.(progress)
        }
      },
    })
    
    return response.data
  },
  
  pdfToImage: async (file: File, format: string = 'PNG', onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)
    
    const response = await api.post('/pdf/pdf-to-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress?.(progress)
        }
      },
    })
    
    return response.data
  },
  
  imageToPDF: async (files: File[], quality: string = 'medium', onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('quality', quality)
    
    const response = await api.post('/pdf/image-to-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress?.(progress)
        }
      },
    })
    
    return response.data
  },
  
  extractText: async (file: File, useOCR: boolean = false, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('use_ocr', String(useOCR))
    
    const response = await api.post('/pdf/extract-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress?.(progress)
        }
      },
    })
    
    return response.data
  },
  
  encryptPDF: async (file: File, password: string, ownerPassword?: string, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)
    if (ownerPassword) {
      formData.append('owner_password', ownerPassword)
    }
    
    const response = await api.post('/pdf/encrypt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress?.(progress)
        }
      },
    })
    
    return response.data
  },
  
  decryptPDF: async (file: File, password: string, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)
    
    const response = await api.post('/pdf/decrypt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress?.(progress)
        }
      },
    })
    
    return response.data
  },
  
  removePassword: async (file: File, password: string, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)
    
    const response = await api.post('/pdf/remove-password', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress?.(progress)
        }
      },
    })
    
    return response.data
  },
}

// Encoder/Decoder API
export const encoderAPI = {
  // JWT
  jwtEncode: async (text: string, secret: string, algorithm: string = 'HS256') => {
    const response = await api.post('/encoder/jwt/encode', { text, secret, algorithm })
    return response.data.result
  },
  
  jwtDecode: async (text: string, secret: string, algorithm: string = 'HS256') => {
    const response = await api.post('/encoder/jwt/decode', { text, secret, algorithm })
    return response.data.result
  },
  
  // Base32
  base32Encode: async (text: string) => {
    const response = await api.post('/encoder/base32/encode', { text })
    return response.data.result
  },
  
  base32Decode: async (text: string) => {
    const response = await api.post('/encoder/base32/decode', { text })
    return response.data.result
  },
  
  // Base64
  base64Encode: async (text: string) => {
    const response = await api.post('/encoder/base64/encode', { text })
    return response.data.result
  },
  
  base64Decode: async (text: string) => {
    const response = await api.post('/encoder/base64/decode', { text })
    return response.data.result
  },
  
  // URL Base64
  urlBase64Encode: async (text: string) => {
    const response = await api.post('/encoder/url-base64/encode', { text })
    return response.data.result
  },
  
  urlBase64Decode: async (text: string) => {
    const response = await api.post('/encoder/url-base64/decode', { text })
    return response.data.result
  },
  
  // MIME Base64
  mimeBase64Encode: async (text: string) => {
    const response = await api.post('/encoder/mime-base64/encode', { text })
    return response.data.result
  },
  
  mimeBase64Decode: async (text: string) => {
    const response = await api.post('/encoder/mime-base64/decode', { text })
    return response.data.result
  },
  
  // URL Encoding
  urlEncode: async (text: string) => {
    const response = await api.post('/encoder/url/encode', { text })
    return response.data.result
  },
  
  urlDecode: async (text: string) => {
    const response = await api.post('/encoder/url/decode', { text })
    return response.data.result
  },
  
  // Hashing
  hashMD5: async (text: string) => {
    const response = await api.post('/encoder/hash/md5', { text })
    return response.data.result
  },
  
  hashSHA1: async (text: string) => {
    const response = await api.post('/encoder/hash/sha1', { text })
    return response.data.result
  },
  
  hashSHA256: async (text: string) => {
    const response = await api.post('/encoder/hash/sha256', { text })
    return response.data.result
  },
  
  hashSHA512: async (text: string) => {
    const response = await api.post('/encoder/hash/sha512', { text })
    return response.data.result
  },
  
  // HMAC
  hmacMD5: async (text: string, secret: string) => {
    const response = await api.post('/encoder/hmac/md5', { text, secret })
    return response.data.result
  },
  
  hmacSHA1: async (text: string, secret: string) => {
    const response = await api.post('/encoder/hmac/sha1', { text, secret })
    return response.data.result
  },
  
  hmacSHA256: async (text: string, secret: string) => {
    const response = await api.post('/encoder/hmac/sha256', { text, secret })
    return response.data.result
  },
  
  hmacSHA512: async (text: string, secret: string) => {
    const response = await api.post('/encoder/hmac/sha512', { text, secret })
    return response.data.result
  },
  
  // JSON
  jsonFormat: async (text: string, indent: number = 2) => {
    const response = await api.post('/encoder/json/format', { text, indent })
    return response.data.result
  },
  
  jsonMinify: async (text: string) => {
    const response = await api.post('/encoder/json/minify', { text })
    return response.data.result
  },
  
  // Text Case
  textUpper: async (text: string) => {
    const response = await api.post('/encoder/text/upper', { text })
    return response.data.result
  },
  
  textLower: async (text: string) => {
    const response = await api.post('/encoder/text/lower', { text })
    return response.data.result
  },
  
  textTitle: async (text: string) => {
    const response = await api.post('/encoder/text/title', { text })
    return response.data.result
  },
  
  textReverse: async (text: string) => {
    const response = await api.post('/encoder/text/reverse', { text })
    return response.data.result
  },
  
  textSort: async (text: string) => {
    const response = await api.post('/encoder/text/sort', { text })
    return response.data.result
  },
  
  // Generators
  generateUUID: async () => {
    const response = await api.post('/encoder/generate/uuid', {})
    return response.data.result
  },
  
  generateLorem: async (paragraphs: number = 3, useLorem: boolean = false) => {
    const response = await api.post('/encoder/generate/lorem', { text: '', paragraphs, use_lorem: useLorem })
    return response.data.result
  },
}

export default api
