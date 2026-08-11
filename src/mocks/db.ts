import type { AuthTokens } from '../types/auth'
import type { Feedback, FeedbackReply, ShareLink } from '../types/feedback'
import type { ProjectFile } from '../types/file'
import type { AppNotification } from '../types/notification'
import type { Portfolio } from '../types/portfolio'
import type { Application, Recruitment } from '../types/recruitment'
import type { Schedule } from '../types/schedule'
import type { ProjectNotice } from '../types/notice'
import type { MeUser, UserRegion } from '../types/user'
import type { ReferenceFile, VideoDetail } from '../types/video'
/* stats에 값을 업데이트해도 빈값 객체가 변질 되지 않도록 객체 생성 함수로 정의하여 사용용 */
function emptyStats() {
  return { projectTypes: [], roles: [] }
}

/** 온보딩 미완료 - 온보딩 플로우 테스트용 */
const incompleteUser: MeUser = {
  id: 1,
  email: 'new@example.com',
  nickname: '신규유저',
  profileImageUrl: null,
  socialType: 'GOOGLE',
  onboardingCompleted: false,
  primaryRole: null,
  roles: [],
  regions: [],
  region: null,
  location: null,
  categories: [],
  bio: null,
  createdAt: '2026-07-01T00:00:00Z',
  stats: emptyStats(),
}

/** 온보딩 완료 — 로그인된 '나', 대부분 기능 테스트용 */
const completeUser: MeUser = {
  id: 2,
  email: 'slate@example.com',
  nickname: '슬레이투',
  profileImageUrl: 'https://cdn.example.com/profiles/soomin.jpg',
  socialType: 'GOOGLE',
  onboardingCompleted: true,
  primaryRole: 'DIRECTOR',
  roles: ['DIRECTOR', 'PD', 'EDITOR'],
  regions: ['SEOUL'],
  region: 'SEOUL',
  location: 'SEOUL',
  categories: ['FILM_DRAMA', 'MUSIC_VIDEO'],
  bio: '사랑의 이야기를 영상으로 담아내는 것을 좋아합니다.',
  createdAt: '2026-06-01T10:00:00Z',
  stats: {
    projectTypes: [
      { type: 'AD_BRAND', label: '광고/브랜드 영상', count: 8 },
      { type: 'MUSIC_VIDEO', label: '뮤직비디오', count: 4 },
    ],
    roles: [
      { role: 'DIRECTOR', label: '연출', count: 9 },
      { role: 'PD', label: 'PD', count: 7 },
      { role: 'EDITOR', label: '편집', count: 5 },
    ],
  },
}

/** 타 유저 — 공개 프로필·멤버·공고 등 시나리오용 */
const publicEditor: MeUser = {
  id: 3,
  email: 'park@example.com',
  nickname: '박편집',
  profileImageUrl: 'https://cdn.example.com/profiles/park.jpg',
  socialType: 'GOOGLE',
  onboardingCompleted: true,
  primaryRole: 'EDITOR',
  roles: ['EDITOR'],
  regions: ['SEOUL'],
  region: 'SEOUL',
  location: 'SEOUL',
  categories: ['DOCUMENTARY'],
  bio: '디테일에 강한 편집자입니다.',
  createdAt: '2026-05-01T10:00:00Z',
  stats: {
    projectTypes: [{ type: 'DOCUMENTARY', label: '다큐멘터리', count: 5 }],
    roles: [{ role: 'EDITOR', label: '편집', count: 5 }],
  },
}

let nextId = 100
/* 다음 id 할당 함수 프로젝트나 유저와 안겹치게 넉넉히 100부터 시작 */
export function allocId(): number {
  nextId += 1
  return nextId
}

export type MockProjectRecord = {
  id: number
  title: string
  description: string
  type: string
  lengthType: string | null
  clientName: string | null
  status: string
  kind: string | null
  startDate: string | null
  endDate: string | null
  ownerUserId: number
  isPinned: boolean
  pinnedAt: string | null
  createdAt: string
  updatedAt: string
}

export type MockMemberRecord = {
  memberId: number
  userId: number
  nickname: string
  email: string
  profileImageUrl: string | null
  bio: string | null
  permission: 'ADMIN' | 'MEMBER'
  roleNames: string[]
  joinedAt: string
}

export type MockRecruitmentRecord = Recruitment & {
  description: string
  shootingPeriod: string
  contact: string
  updatedAt: string
}

export type MockProjectFileRecord = Omit<ProjectFile, 'uploader'> & {
  projectId: number
  storageKey: string
  uploaderId: number
}

/* 모의 데이터베이스 타입 정의 */
export type MockDb = {
  currentUserId: number | null
  tokens: AuthTokens | null
  users: MeUser[]
  /** FE mock 전용 — 비밀번호 변경/회원탈퇴 확인용. 실 BE엔 없는 필드라 MeProfile엔 포함하지 않음 */
  passwords: Record<number, string>
  portfolios: Portfolio[]
  projects: MockProjectRecord[]
  members: MockMemberRecord[]
  files: MockProjectFileRecord[]
  /** 목록용 hasUnreadFeedback은 VideoDetail에 없고 VideoItem에만 있음 */
  videos: Array<VideoDetail & { hasUnreadFeedback: boolean }>
  referenceFiles: ReferenceFile[]
  feedbacks: Feedback[]
  replies: FeedbackReply[]
  shareLinks: ShareLink[]
  recruitments: MockRecruitmentRecord[]
  applications: Application[]
  recruitmentBookmarks: Array<{ userId: number; recruitmentId: number }>
  schedules: Schedule[]
  notifications: AppNotification[]
  notices: ProjectNotice[]
  invitations: Array<{
    token: string
    projectId: number
    inviterName: string
    expiresAt: string
  }>
}

/* 기본 알림 설정 객체 생성 함수 */
function toWriter(user: MeUser) {
  return {
    id: user.id,
    nickname: user.nickname,
    profileImageUrl: user.profileImageUrl,
    primaryRole: user.primaryRole,
    locations: [user.location ?? 'SEOUL'] as UserRegion[],
  }
}

/* 모의 데이터베이스(임시 데이터) 객체 생성 */
export const db: MockDb = {
  currentUserId: completeUser.id,
  tokens: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  },
  users: [incompleteUser, completeUser, publicEditor],
  /** mock 기본 비밀번호 — 비밀번호 변경/회원탈퇴 확인 플로우 테스트용 */
  passwords: {
    [incompleteUser.id]: 'password123',
    [completeUser.id]: 'password123',
    [publicEditor.id]: 'password123',
  },
  portfolios: [
    {
      id: 10,
      title: '연애혁명',
      type: 'FILM_DRAMA',
      kind: 'EXTERNAL',
      clientName: '스튜디오 X',
      roles: ['DIRECTOR', 'EDITOR'],
      description: '대학생들의 연애와 우정을 그린 웹드라마 연출 및 편집을 담당했습니다.',
      comment: '감정선과 몰입감을 살리는 연출을 중점으로 작업했습니다.',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    },
  ],
  projects: [
    {
      id: 1,
      title: '위로, 또 위로',
      description: '다큐멘터리 프로젝트',
      type: 'DOCUMENTARY',
      lengthType: 'LONG_FORM',
      clientName: '독립제작사',
      status: 'PREPARING',
      kind: 'PERSONAL',
      startDate: '2026-06-01',
      endDate: '2026-12-31',
      ownerUserId: completeUser.id,
      isPinned: false,
      pinnedAt: null,
      createdAt: '2026-06-01T09:00:00Z',
      updatedAt: '2026-07-01T09:00:00Z',
    },
    {
      id: 2,
      title: '브랜드 필름 A',
      description: '광고 영상',
      type: 'AD_BRAND',
      lengthType: 'SHORT_FORM',
      clientName: '브랜드A',
      status: 'EDITING',
      kind: 'EXTERNAL',
      startDate: '2026-05-01',
      endDate: '2026-08-15',
      ownerUserId: completeUser.id,
      isPinned: false,
      pinnedAt: null,
      createdAt: '2026-05-01T09:00:00Z',
      updatedAt: '2026-07-05T09:00:00Z',
    },
  ],
  members: [
    {
      memberId: 1,
      userId: completeUser.id,
      nickname: completeUser.nickname,
      profileImageUrl: completeUser.profileImageUrl,
      email: completeUser.email,
      bio: completeUser.bio,
      permission: 'ADMIN',
      roleNames: ['DIRECTOR'],
      joinedAt: '2026-06-01T09:00:00Z',
    },
    {
      memberId: 2,
      userId: publicEditor.id,
      nickname: publicEditor.nickname,
      profileImageUrl: publicEditor.profileImageUrl,
      email: publicEditor.email,
      bio: publicEditor.bio,
      permission: 'MEMBER',
      roleNames: ['EDITOR'],
      joinedAt: '2026-06-02T09:00:00Z',
    },
  ],
  files: [
    {
      id: 1,
      projectId: 1,
      fileName: 'reference.pdf',
      description: '레퍼런스 자료',
      storageKey: 'projects/1/files/reference.pdf',
      contentType: 'application/pdf',
      fileSize: 1024,
      isPinned: false,
      isFinal: false,
      uploaderId: completeUser.id,
      createdAt: '2026-06-10T09:00:00Z',
      updatedAt: '2026-06-10T09:00:00Z',
    },
    {
      id: 2,
      projectId: 1,
      fileName: 'storyboard.pdf',
      description: '스토리보드',
      storageKey: 'projects/1/files/storyboard.pdf',
      contentType: 'application/pdf',
      fileSize: 2048,
      isPinned: false,
      isFinal: false,
      uploaderId: completeUser.id,
      createdAt: '2026-06-12T09:00:00Z',
      updatedAt: '2026-06-12T09:00:00Z',
    },
  ],
  videos: [
    {
      videoId: 10,
      projectId: 1,
      title: '1차 편집본',
      youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      youtubeVideoId: 'jNQXAC9IVRw',
      thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      progressStatus: 'IN_PROGRESS',
      bookmarked: true,
      hasUnreadFeedback: true,
      description: '프로젝트 소개글',
      memo: '1차 피드백 반영 예정',
      projectTags: ['다큐'],
      createdAt: '2026-05-20T00:00:00Z',
      updatedAt: '2026-05-25T00:00:00Z',
    },
    {
      videoId: 9,
      projectId: 1,
      title: '러프컷',
      youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      youtubeVideoId: '9bZkp7q19f0',
      thumbnailUrl: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      progressStatus: 'DONE',
      bookmarked: false,
      hasUnreadFeedback: false,
      description: null,
      memo: null,
      projectTags: [],
      createdAt: '2026-05-10T00:00:00Z',
      updatedAt: '2026-05-12T00:00:00Z',
    },
  ],
  referenceFiles: [
    {
      referenceFileId: 1,
      projectFileId: 1,
      fileName: 'reference.pdf',
      contentType: 'application/pdf',
      fileSize: 1024,
      isFinal: false,
      uploader: { id: 3, nickname: '박편집' },
      createdAt: '2026-06-10T09:00:00Z',
    },
  ],
  feedbacks: [
    {
      feedbackId: 1,
      videoId: 10,
      actor: { type: 'USER', id: 3, name: '박편집' },
      content: '42초 부근 컷 전환을 부드럽게 해주세요',
      startTime: 42,
      endTime: 45,
      status: false,
      createdAt: '2026-05-21T00:00:00Z',
      updatedAt: '2026-05-21T00:00:00Z',
    },
    {
      feedbackId: 2,
      videoId: 10,
      actor: { type: 'USER', id: 2, name: '슬레이투' },
      content: '로고 크기 조금만 더 키워주세요',
      startTime: 87,
      endTime: null,
      status: true,
      createdAt: '2026-05-22T00:00:00Z',
      updatedAt: '2026-05-23T00:00:00Z',
    },
  ],
  replies: [
    {
      replyId: 7,
      feedbackId: 1,
      actor: { type: 'USER', id: 2, name: '슬레이투' },
      content: '확인했습니다, 수정하겠습니다',
      startTime: null,
      endTime: null,
      status: false,
      createdAt: '2026-05-21T01:00:00Z',
      updatedAt: '2026-05-21T01:00:00Z',
    },
  ],
  shareLinks: [
    {
      shareLinkId: 5,
      videoId: 10,
      token: '3f2a1c9e-4b7d-4a1e-9c2a-8e1f2b3c4d5e',
      isActive: true,
      expiredAt: '2026-12-31T00:00:00Z',
      createdAt: '2026-05-20T00:00:00Z',
    },
  ],
  recruitments: [
    {
      id: 1,
      title: '웹드라마 편집자 모집',
      category: 'FILM_DRAMA',
      lengthType: 'SHORT_FORM',
      recruitPart: 'EDITOR',
      location: 'SEOUL',
      pay: '일 10만원',
      deadline: '2026-08-20',
      dday: 13,
      status: 'RECRUITING',
      viewCount: 120,
      isBookmarked: false,
      isMine: true,
      writer: toWriter(completeUser),
      description: '감정선을 살리는 편집이 가능하신 분을 찾습니다.',
      shootingPeriod: '2026.08.25 ~ 2026.09.10',
      contact: 'slate@example.com',
      createdAt: '2026-06-15T00:00:00Z',
      updatedAt: '2026-06-15T00:00:00Z',
    },
    {
      id: 2,
      title: '다큐 촬영 크루',
      category: 'DOCUMENTARY',
      lengthType: 'LONG_FORM',
      recruitPart: 'CINEMATOGRAPHER',
      location: 'NATIONWIDE',
      pay: '협의',
      deadline: '2026-08-25',
      dday: 18,
      status: 'RECRUITING',
      viewCount: 45,
      isBookmarked: false,
      isMine: false,
      writer: toWriter(publicEditor),
      description: '지방 촬영이 가능하신 촬영 감독을 모십니다.',
      shootingPeriod: '2026.09.01 ~ 2026.10.15',
      contact: 'park@example.com',
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z',
    },
    {
      id: 3,
      title: '뮤직비디오 연출 구합니다',
      category: 'MUSIC_VIDEO',
      lengthType: 'SHORT_FORM',
      recruitPart: 'DIRECTOR',
      location: 'SEOUL',
      pay: '건당 200만원',
      deadline: '2026-08-15',
      dday: 8,
      status: 'RECRUITING',
      viewCount: 88,
      isBookmarked: false,
      isMine: true,
      writer: toWriter(completeUser),
      description: '아이돌 그룹 신곡 뮤직비디오 연출을 맡아주실 분을 찾습니다.',
      shootingPeriod: '2026.08.20 ~ 2026.08.28',
      contact: 'slate@example.com',
      createdAt: '2026-07-03T00:00:00Z',
      updatedAt: '2026-07-03T00:00:00Z',
    },
    {
      id: 4,
      title: '예능 사운드 믹싱 엔지니어',
      category: 'YOUTUBE_CONTENT',
      lengthType: 'SHORT_FORM',
      recruitPart: 'SOUND',
      location: 'NATIONWIDE',
      pay: '일 15만원',
      deadline: '2026-08-30',
      dday: 23,
      status: 'RECRUITING',
      viewCount: 33,
      isBookmarked: false,
      isMine: false,
      writer: toWriter(publicEditor),
      description: '주말 스튜디오 작업이 가능하신 분을 우대합니다.',
      shootingPeriod: '2026.09.05 ~ 2026.09.20',
      contact: 'park@example.com',
      createdAt: '2026-07-05T00:00:00Z',
      updatedAt: '2026-07-05T00:00:00Z',
    },
    {
      id: 5,
      title: '광고 영상 미술팀 모집',
      category: 'AD_BRAND',
      lengthType: 'SHORT_FORM',
      recruitPart: 'ART',
      location: 'SEOUL',
      pay: '일 12만원',
      deadline: '2026-08-18',
      dday: 11,
      status: 'RECRUITING',
      viewCount: 61,
      isBookmarked: false,
      isMine: true,
      writer: toWriter(completeUser),
      description: '브랜드 광고 세트 디자인을 담당하실 미술팀을 모집합니다.',
      shootingPeriod: '2026.08.22 ~ 2026.09.02',
      contact: 'slate@example.com',
      createdAt: '2026-07-08T00:00:00Z',
      updatedAt: '2026-07-08T00:00:00Z',
    },
    {
      id: 6,
      title: '단편영화 PD 구합니다',
      category: 'FILM_DRAMA',
      lengthType: 'SHORT_FORM',
      recruitPart: 'PD',
      location: 'NATIONWIDE',
      pay: '협의',
      deadline: '2026-09-01',
      dday: 25,
      status: 'RECRUITING',
      viewCount: 27,
      isBookmarked: false,
      isMine: false,
      writer: toWriter(publicEditor),
      description: '독립영화 제작 경험이 있으신 분을 우대합니다.',
      shootingPeriod: '2026.09.10 ~ 2026.11.30',
      contact: 'park@example.com',
      createdAt: '2026-07-10T00:00:00Z',
      updatedAt: '2026-07-10T00:00:00Z',
    },
  ],
  applications: [
    {
      id: 1,
      recruitmentId: 1,
      userId: publicEditor.id,
      nickname: publicEditor.nickname,
      profileImageUrl: publicEditor.profileImageUrl,
      message: '관심 있습니다',
      status: 'PENDING',
      createdAt: '2026-06-16T00:00:00Z',
    },
  ],
  recruitmentBookmarks: [{ userId: completeUser.id, recruitmentId: 2 }],
  schedules: [
    {
      id: 1,
      scheduleScope: 'PROJECT',
      projectId: 1,
      title: '레퍼런스 회의',
      startAt: '2026-07-10T14:00:00',
      endAt: '2026-07-10T15:00:00',
      location: '00스튜디오',
      publicMemo: '러프한 무드보드 잡기',
      privateMemo: '개인 메모',
      participantIds: [1, 2],
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z',
    },
  ],
  notifications: [
    {
      notificationId: 1,
      projectId: 1,
      type: 'SCHEDULE_ASSIGNED',
      title: '일정 알림',
      content: '오늘 레퍼런스 회의 일정이 있습니다 (14:00)',
      groupCount: 1,
      targetType: 'SCHEDULE',
      targetId: 1,
      isRead: false,
      readAt: null,
      createdAt: '2026-07-10T08:00:00Z',
    },
    {
      notificationId: 2,
      projectId: null,
      type: 'RECRUITMENT_APPLIED',
      title: '새 지원자',
      content: '웹드라마 편집자 모집에 새 지원자가 있습니다',
      groupCount: 1,
      targetType: 'RECRUITMENT',
      targetId: 1,
      isRead: true,
      readAt: '2026-06-16T02:00:00Z',
      createdAt: '2026-06-16T01:00:00Z',
    },
  ],
  notices: [
    {
      id: 1,
      projectId: 1,
      title: '촬영 일정 공지',
      content: '다음 주 화요일 오전 촬영입니다.',
      writerId: completeUser.id,
      writerNickname: completeUser.nickname,
      isRead: false,
      createdAt: '2026-06-15T09:00:00Z',
      updatedAt: '2026-06-15T09:00:00Z',
    },
  ],
  invitations: [
    {
      token: 'invite-token-demo',
      projectId: 1,
      inviterName: '슬레이투',
      expiresAt: '2026-12-31T00:00:00Z',
    },
  ],
}

/* 현재 로그인된 유저 조회 함수 */
export function getCurrentUser(): MeUser | null {
  /* 현재 로그인된 유저가 없으면 null 반환 */
  if (db.currentUserId == null) return null
  return db.users.find((u) => u.id === db.currentUserId) ?? null
}

/* 현재 로그인된 유저 조회 함수 호출 후 없으면 에러 반환 */
export function requireUser(): MeUser {
  const user = getCurrentUser()
  if (!user || !db.tokens) {
    throw new Error('UNAUTHORIZED')
  }
  return user
}

/* GET /users/me 응답 변환 — BE는 region */
export function toMeProfile(user: MeUser) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    profileImageUrl: user.profileImageUrl,
    bio: user.bio,
    regions: user.regions ?? (user.location ? [user.location] : []),
    region: user.region ?? user.location,
    location: user.location ?? user.region,
    socialType: user.socialType,
    primaryRole: user.primaryRole,
    roles: user.roles,
    categories: user.categories,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt,
  }
}

/* 공개 프로필 데이터 변환 함수 */
export function toPublicUser(user: MeUser) {
  return {
    id: user.id,
    nickname: user.nickname,
    profileImageUrl: user.profileImageUrl,
    bio: user.bio,
    location: user.location,
    primaryRole: user.primaryRole,
    roles: user.roles,
    categories: user.categories,
    stats: user.stats,
  }
}
