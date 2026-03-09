import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from '@/features/users'
import { roles } from '@/features/users/data/data'

// 定义 Users 列表页的 URL 查询参数校验规则（Search Params Schema）
const usersSearchSchema = z.object({
  // 当前页码，允许缺省；当参数缺失或解析失败时回退为 1
  page: z.number().optional().catch(1),
  // 每页条数，允许缺省；当参数缺失或解析失败时回退为 10
  pageSize: z.number().optional().catch(10),
  // Facet filters：用于“多选筛选器”的查询参数（例如状态、角色）
  status: z
    // status 是一个数组，表示支持多选（例如 ?status=active&status=invited）
    .array(
      // union + literal：将允许的字符串值限定在指定集合内，避免出现未知状态
      z.union([
        z.literal('active'), // 激活
        z.literal('inactive'), // 未激活
        z.literal('invited'), // 已邀请
        z.literal('suspended'), // 已停用
      ])
    )
    // 允许不传 status 参数
    .optional()
    // 当参数缺失或校验失败时回退为空数组，表示“不按状态筛选”
    .catch([]),
  role: z
    // role 同样是数组，支持多选（例如 ?role=admin&role=manager）
    .array(
      // enum：将可选角色值动态绑定到 roles 配置，确保 URL 参数只能来自现有角色列表
      z.enum(roles.map((r) => r.value as (typeof roles)[number]['value']))
    )
    // 允许不传 role 参数
    .optional()
    // 当参数缺失或校验失败时回退为空数组，表示“不按角色筛选”
    .catch([]),
  // Per-column text filter：列级文本过滤（此处示例为用户名）
  username: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  component: Users,
})
