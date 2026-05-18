import { http } from '@/lib/request'

export type ApiResponse<T> = {
  code: number
  data: T
  message?: string
}

export type OssUploadPolicy = {
  expire: string
  policy: string
  signature: string
  accessId: string
  host: string
  dir?: string
}

const rawUploadSignUrl = import.meta.env?.VITE_UPLOAD_SIGN_URL?.trim()
const uploadSignUrl = rawUploadSignUrl
  ? rawUploadSignUrl.replace(/^["']|["']$/g, '')
  : '/movie/upload'

const normalizeHost = (host: string) => {
  const trimmedHost = host.trim()
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    trimmedHost.startsWith('http://')
  ) {
    return `https://${trimmedHost.slice('http://'.length)}`
  }
  return trimmedHost
}

const getFileExtension = (fileName: string) => {
  const index = fileName.lastIndexOf('.')
  return index >= 0 ? fileName.slice(index).toLowerCase() : ''
}

const generateFileName = (dir: string | undefined, file: File) => {
  const normalizedDir = dir?.trim() ? dir.trim().replace(/^\/+|\/+$/g, '') : ''
  const prefix = normalizedDir ? `${normalizedDir}/` : ''
  const ext = getFileExtension(file.name)
  return `${prefix}${Date.now()}${ext}`
}

export async function getUploadPolicy() {
  return http.post<ApiResponse<OssUploadPolicy>>(uploadSignUrl)
}

export async function uploadImageToOss(file: File) {
  const policyRes = await getUploadPolicy()
  const policy = policyRes.data

  if (!policy?.host || !policy.policy || !policy.signature || !policy.accessId) {
    throw new Error('上传签名信息不完整')
  }

  const objectKey = generateFileName(policy.dir, file)
  const formData = new FormData()
  formData.append('key', objectKey)
  formData.append('policy', policy.policy)
  formData.append('OSSAccessKeyId', policy.accessId)
  formData.append('signature', policy.signature)
  formData.append('success_action_status', '200')
  formData.append('file', file)

  const host = normalizeHost(policy.host)
  const uploadTarget = import.meta.env.DEV ? '/oss' : host
  const uploadRes = await fetch(uploadTarget, {
    method: 'POST',
    body: formData,
  })

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text()
    const detail = errorText.trim().replace(/\s+/g, ' ').slice(0, 240)
    throw new Error(detail ? `图片上传失败：${detail}` : '图片上传失败')
  }

  return `${host.replace(/\/$/, '')}/${objectKey}`
}
