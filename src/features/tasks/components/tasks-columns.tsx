import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { labels, priorities, statuses } from '../data/data'
import { type Task } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const tasksColumns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Task' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    meta: {
      className: 'ps-1 max-w-0 w-2/3',
      tdClassName: 'ps-4',
    },
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label)

      return (
        <div className='flex space-x-2'>
          {label && <Badge variant='outline'>{label.label}</Badge>}
          <span className='truncate font-medium'>{row.getValue('title')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center gap-2'>
          {status.icon && (
            <status.icon className='size-4 text-muted-foreground' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!Array.isArray(value) || value.length === 0) return true
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-3' },
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue('priority')
      )

      if (!priority) {
        return null
      }

      return (
        <div className='flex items-center gap-2'>
          {priority.icon && (
            <priority.icon className='size-4 text-muted-foreground' />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!Array.isArray(value) || value.length === 0) return true
      return value.includes(row.getValue(id))
    },
  },
  { accessorKey: 'name', header: ({ column }) => <DataTableColumnHeader column={column} title='Name' /> },
  { accessorKey: 'type', header: ({ column }) => <DataTableColumnHeader column={column} title='Type' /> },
  { accessorKey: 'hallType', header: ({ column }) => <DataTableColumnHeader column={column} title='Hall Type' /> },
  {
    accessorKey: 'startTime',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Start Time' />,
    cell: ({ row }) => {
      const v = row.getValue('startTime') as unknown
      return v ? new Date(v as string).toLocaleString() : ''
    },
  },
  {
    accessorKey: 'screeningTime',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Screening Time' />,
    cell: ({ row }) => {
      const v = row.getValue('screeningTime') as unknown
      return v ? new Date(v as string).toLocaleString() : ''
    },
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Created At' />,
    cell: ({ row }) => {
      const v = row.getValue('createTime') as unknown
      return v ? new Date(v as string).toLocaleString() : ''
    },
  },
  {
    accessorKey: 'updateTime',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Updated At' />,
    cell: ({ row }) => {
      const v = row.getValue('updateTime') as unknown
      return v ? new Date(v as string).toLocaleString() : ''
    },
  },
  { accessorKey: 'movieName', header: ({ column }) => <DataTableColumnHeader column={column} title='Movie Name' /> },
  { accessorKey: 'posterUrl', header: ({ column }) => <DataTableColumnHeader column={column} title='Poster URL' /> },
  { accessorKey: 'city', header: ({ column }) => <DataTableColumnHeader column={column} title='City' /> },
  { accessorKey: 'address', header: ({ column }) => <DataTableColumnHeader column={column} title='Address' /> },
  { accessorKey: 'recruiterName', header: ({ column }) => <DataTableColumnHeader column={column} title='Recruiter' /> },
  { accessorKey: 'recruiterIntro', header: ({ column }) => <DataTableColumnHeader column={column} title='Recruiter Intro' /> },
  { accessorKey: 'recruiterContact', header: ({ column }) => <DataTableColumnHeader column={column} title='Recruiter Contact' /> },
  { accessorKey: 'price', header: ({ column }) => <DataTableColumnHeader column={column} title='Price' /> },
  { accessorKey: 'guests', header: ({ column }) => <DataTableColumnHeader column={column} title='Guests' /> },
  { accessorKey: 'benefitFree', header: ({ column }) => <DataTableColumnHeader column={column} title='Benefit Free' /> },
  { accessorKey: 'benefitLottery', header: ({ column }) => <DataTableColumnHeader column={column} title='Benefit Lottery' /> },
  { accessorKey: 'registrationLink', header: ({ column }) => <DataTableColumnHeader column={column} title='Registration Link' /> },
  { accessorKey: 'feedbackLink', header: ({ column }) => <DataTableColumnHeader column={column} title='Feedback Link' /> },
  { accessorKey: 'maxRegistrations', header: ({ column }) => <DataTableColumnHeader column={column} title='Max Registrations' /> },
  { accessorKey: 'currentRegistrations', header: ({ column }) => <DataTableColumnHeader column={column} title='Current Registrations' /> },
  { accessorKey: 'isDeleted', header: ({ column }) => <DataTableColumnHeader column={column} title='Is Deleted' /> },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
