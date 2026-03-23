import { z } from 'zod'

// 基于活动数据类型，完善 Task 的运行时校验与类型定义
// 兼容原有任务字段（id/title/status/label/priority），并新增活动相关字段
export const taskSchema = z.object({
  // 通用标识
  id: z.union([z.string(), z.number()]).transform((v) => String(v)),

  // 时间字段
  startTime: z.coerce.date().optional(),
  screeningTime: z.coerce.date().optional(),
  createTime: z.coerce.date().optional(),
  updateTime: z.coerce.date().optional(),

  // 电影/展示信息
  movieName: z.string().optional(),
  posterUrl: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  director: z.string().optional(),
  actor: z.string().optional(),
  shootingTime: z.string().optional(),
  doubanRating: z.string().optional(),
})

export type Movie = z.infer<typeof taskSchema>


/**
 * 影厅类型枚举
 */
export enum HallType {
  STANDARD = 1, // 普通厅
  IMAX = 2, // IMAX厅
  DOLBY = 3, // 杜比厅
  CINITY = 4, // CINITY厅
}

/**
 * 活动类型枚举
 */
export enum ActivityType {
  KOUBEI = 1, // 口碑场
  FANS = 2, // 粉丝专场
  ROADSHOW = 3, // 路演场
  PREMIERE = 4, // 首映礼
}

/**
 * 活动状态枚举
 */
export enum ActivityStatus {
  PENDING = 0, // 待发布
  PUBLISHED = 1, // 已发布/报名中
  ENDED = 2, // 已结束
}

// @Entity({
//   name: 'activities',
// })
// export class Activity {
//   @PrimaryGeneratedColumn({
//     comment: '主键ID',
//   })
//   id: number;

//   @Column({
//     length: 50,
//     comment: '活动标题',
//   })
//   name: string;

//   @Column({
//     name: 'start_time',
//     comment: '活动开始时间',
//   })
//   startTime: Date;

//   @Column({
//     name: 'screening_time',
//     comment: '放映开始时间',
//   })
//   screeningTime: Date;

//   @Column({
//     name: 'type',
//     type: 'enum',
//     enum: ActivityType,
//     default: ActivityType.KOUBEI,
//     comment: '活动类型：1-口碑场, 2-粉丝专场, 3-路演场, 4-首映礼',
//   })
//   type: ActivityType;

//   @Column({
//     name: 'status',
//     type: 'enum',
//     enum: ActivityStatus,
//     default: ActivityStatus.PENDING,
//     comment: '活动状态：0-待发布, 1-已发布, 2-已结束',
//   })
//   status: ActivityStatus;

//   @Column({
//     name: 'movie_name',
//     length: 100,
//     comment: '电影名称',
//   })
//   movieName: string;

//   @Column({
//     name: 'poster_url',
//     type: 'text',
//     nullable: true,
//     comment: '电影海报封面URL',
//   })
//   posterUrl: string;

//   @Column({
//     length: 50,
//     comment: '活动城市',
//   })
//   city: string;

//   @Column({
//     length: 255,
//     comment: '影院详细地址',
//   })
//   address: string;

//   @Column({
//     name: 'hall_type',
//     type: 'enum',
//     enum: HallType,
//     default: HallType.STANDARD,
//     comment: '影厅类型：1-普通厅, 2-IMAX, 3-杜比, 4-CINITY',
//   })
//   hallType: HallType;

//   // 招募方信息
//   @Column({
//     name: 'recruiter_name',
//     length: 100,
//     comment: '招募方名称',
//   })
//   recruiterName: string;

//   @Column({
//     name: 'recruiter_intro',
//     type: 'text',
//     nullable: true,
//     comment: '招募方简介',
//   })
//   recruiterIntro: string;

//   @Column({
//     name: 'recruiter_contact',
//     length: 100,
//     nullable: true,
//     comment: '招募方联系方式',
//   })
//   recruiterContact: string;

//   // 价格信息
//   @Column({
//     type: 'decimal',
//     precision: 10,
//     scale: 2,
//     default: 0,
//     comment: '活动价格（0表示免费）',
//   })
//   price: number;

//   // 交流人员
//   @Column({
//     type: 'text',
//     nullable: true,
//     comment: '交流人员名单（主创、活动方等）',
//   })
//   guests: string;

//   // 活动物料
//   @Column({
//     name: 'benefit_free',
//     type: 'text',
//     nullable: true,
//     comment: '免费周边（物料）',
//   })
//   benefitFree: string;

//   @Column({
//     name: 'benefit_lottery',
//     type: 'text',
//     nullable: true,
//     comment: '抽奖礼品（物料）',
//   })
//   benefitLottery: string;

//   // 链接
//   @Column({
//     name: 'registration_link',
//     type: 'text',
//     nullable: true,
//     comment: '报名链接（如果是外部报名）',
//   })
//   registrationLink: string;

//   @Column({
//     name: 'feedback_link',
//     type: 'text',
//     nullable: true,
//     comment: '反馈入口链接',
//   })
//   feedbackLink: string;

//   @Column({
//     name: 'max_registrations',
//     type: 'int',
//     default: 0,
//     comment: '最大报名人数（0表示无限制）',
//   })
//   maxRegistrations: number;

//   @Column({
//     name: 'current_registrations',
//     type: 'int',
//     default: 0,
//     comment: '当前报名人数',
//   })
//   currentRegistrations: number;

//   @Column({
//     name: 'is_deleted',
//     type: 'boolean',
//     default: false,
//     comment: '是否已删除',
//   })
//   isDeleted: boolean;

//   @CreateDateColumn({
//     name: 'create_time',
//     comment: '创建时间',
//   })
//   createTime: Date;

//   @UpdateDateColumn({
//     name: 'update_time',
//     comment: '更新时间',
//   })
//   updateTime: Date;

//   // 废弃 ManyToMany，改用 OneToMany 关联 ActivityRegistration
//   @OneToMany(
//     () => ActivityRegistration,
//     (registration) => registration.activity,
//   )
//   registrations: ActivityRegistration[];
// }
