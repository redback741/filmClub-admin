import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Tasks } from '@/features/tasks'
import { priorities, statuses } from '@/features/tasks/data/data'

// 定义任务列表页面的搜索参数验证架构 (Search Params Schema)
// 用于解析和验证 URL 查询参数，如 ?page=1&status=done
const taskSearchSchema = z.object({
  // 当前页码，默认为 1
  page: z.number().optional().catch(1),
  // 每页显示数量，默认为 10
  pageSize: z.number().optional().catch(10),
  // 任务状态筛选，支持多选
  // 使用 z.enum 限制值必须在预定义的 statuses 列表中
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]), // 默认为空数组
  // 任务优先级筛选，支持多选
  // 使用 z.enum 限制值必须在预定义的 priorities 列表中
  priority: z
    .array(z.enum(priorities.map((priority) => priority.value)))
    .optional()
    .catch([]), // 默认为空数组
  // 关键词过滤/搜索
  filter: z.string().optional().catch(''),
})

// 创建 /tasks/ 路由定义
export const Route = createFileRoute('/_authenticated/tasks/')({
  // 绑定搜索参数验证逻辑，确保组件内获取的 search params 是类型安全的
  validateSearch: taskSearchSchema,
  // 指定该路由渲染的组件
  component: Tasks,
})
