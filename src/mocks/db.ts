import type { AuthTokens } from '../types/auth'
import type { Feedback, FeedbackReply, ShareLink } from '../types/feedback'
import type { ProjectFile } from '../types/file'
import type { AppNotification } from '../types/notification'
import type { Portfolio } from '../types/portfolio'
import type { Project, ProjectActivity, ProjectMember } from '../types/project'
import type { Application, Recruitment } from '../types/recruitment'
import type { Schedule } from '../types/schedule'
import type { ProjectNotice } from '../types/notice'
import type { MeUser, NotificationSettings } from '../types/user'
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
  location: '서울시',
  categories: ['DRAMA', 'MUSIC_VIDEO'],
  bio: '사랑의 이야기를 영상으로 담아내는 것을 좋아합니다.',
  createdAt: '2026-06-01T10:00:00Z',
  stats: {
    projectTypes: [
      { type: 'COMMERCIAL', label: '브랜드 영상', count: 8 },
      { type: 'MUSIC_VIDEO', label: '뮤직 비디오', count: 4 },
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
  location: '서울시',
  categories: ['DOCUMENTARY'],
  bio: '디테일에 강한 편집자입니다.',
  createdAt: '2026-05-01T10:00:00Z',
  stats: {
    projectTypes: [{ type: 'DOCUMENTARY', label: '다큐/시사/교양', count: 5 }],
    roles: [{ role: 'EDITOR', label: '편집', count: 5 }],
  },
}

let nextId = 100
/* 다음 id 할당 함수 프로젝트나 유저와 안겹치게 넉넉히 100부터 시작 */
export function allocId(): number {
  nextId += 1
  return nextId
}

/* 모의 데이터베이스 타입 정의 */
export type MockDb = {
  currentUserId: number | null
  tokens: AuthTokens | null
  users: MeUser[]
  notificationSettings: Record<number, NotificationSettings>
  portfolios: Portfolio[]
  projects: Project[]
  members: ProjectMember[]
  files: ProjectFile[]
  videos: VideoDetail[]
  referenceFiles: ReferenceFile[]
  feedbacks: Feedback[]
  replies: FeedbackReply[]
  shareLinks: ShareLink[]
  recruitments: Recruitment[]
  applications: Application[]
  recruitmentBookmarks: Array<{ userId: number; recruitmentId: number }>
  schedules: Schedule[]
  notifications: AppNotification[]
  activities: ProjectActivity[]
  notices: ProjectNotice[]
  invitations: Array<{
    token: string
    projectId: number
    inviterName: string
    expiresAt: string
    /** 서버가 명시적으로 관리하는 상태. 만료 여부는 expiresAt 기준으로 별도 계산 */
    status: 'PENDING' | 'ACCEPTED'
  }>
}

/* 기본 알림 설정 객체 생성 함수 */
function defaultNotificationSettings(): NotificationSettings {
  return {
    emailAllEnabled: true,
    emailDeadlineReminder: true,
    emailAssigned: true,
    emailNewApplicant: true,
    emailMissedSummary: true,
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
  notificationSettings: {
    [incompleteUser.id]: defaultNotificationSettings(),
    [completeUser.id]: defaultNotificationSettings(),
    [publicEditor.id]: defaultNotificationSettings(),
  },
  portfolios: [
    {
      id: 10,
      title: '연애혁명',
      type: 'DRAMA',
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
      customTypeName: null,
      lengthType: 'LONG_FORM',
      clientName: '독립제작사',
      status: 'PREPARING',
      endDate: '2026-12-31',
      createdAt: '2026-06-01T09:00:00Z',
      updatedAt: '2026-07-01T09:00:00Z',
    },
    {
      id: 2,
      title: '브랜드 필름 A',
      description: '광고 영상',
      type: 'COMMERCIAL',
      customTypeName: null,
      lengthType: null,
      clientName: '브랜드A',
      status: 'IN_PROGRESS',
      endDate: '2026-08-15',
      createdAt: '2026-05-01T09:00:00Z',
      updatedAt: '2026-07-05T09:00:00Z',
    },
  ],
  members: [
    {
      id: 1,
      userId: completeUser.id,
      name: completeUser.nickname,
      profileImageUrl: completeUser.profileImageUrl,
      email: completeUser.email,
      region: '서울시',
      jobRole: 'DIRECTOR',
      isAdmin: true,
    },
    {
      id: 2,
      userId: publicEditor.id,
      name: publicEditor.nickname,
      profileImageUrl: publicEditor.profileImageUrl,
      email: publicEditor.email,
      region: '서울시',
      jobRole: 'EDITOR',
      isAdmin: false,
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
      unreadCommentCount: 3,
      description: '프로젝트 소개글',
      memo: '1차 피드백 반영 예정',
      categories: ['다큐'],
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
      unreadCommentCount: 0,
      description: null,
      memo: null,
      categories: [],
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
      description: '감정선 살리는 편집 가능하신 분',
      roles: ['EDITOR'],
      categories: ['DRAMA'],
      regions: ['SEOUL'],
      status: 'OPEN',
      viewCount: 120,
      bookmarkCount: 8,
      applicationCount: 3,
      authorId: completeUser.id,
      authorNickname: completeUser.nickname,
      createdAt: '2026-06-15T00:00:00Z',
      updatedAt: '2026-06-15T00:00:00Z',
    },
    {
      id: 2,
      title: '다큐 촬영 크루',
      description: '지방 촬영 가능',
      roles: ['CINEMATOGRAPHER'],
      categories: ['DOCUMENTARY'],
      regions: ['NATIONWIDE'],
      status: 'OPEN',
      viewCount: 45,
      bookmarkCount: 2,
      applicationCount: 1,
      authorId: publicEditor.id,
      authorNickname: publicEditor.nickname,
      createdAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-01T00:00:00Z',
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
      id: 1,
      type: 'SCHEDULE',
      title: '오늘 일정이 있습니다',
      body: '레퍼런스 회의 14:00',
      isRead: false,
      createdAt: '2026-07-10T08:00:00Z',
      link: '/calendar',
    },
    {
      id: 2,
      type: 'APPLICATION',
      title: '새 지원자가 있습니다',
      body: '웹드라마 편집자 모집',
      isRead: true,
      createdAt: '2026-06-16T01:00:00Z',
      link: '/jobs/1',
    },
  ],
  activities: [
    {
      id: 1,
      projectId: 1,
      type: 'FILE_UPLOADED',
      content: 'reference.pdf 파일이 업로드되었습니다',
      actor: { type: 'USER', id: completeUser.id, name: completeUser.nickname },
      groupCount: 1,
      metadata: { fileName: 'reference.pdf' },
      createdAt: '2026-06-10T09:00:00Z',
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
      status: 'PENDING',
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

/* GET /users/me 응답 변환 */
export function toMeProfile(user: MeUser) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    profileImageUrl: user.profileImageUrl,
    bio: user.bio,
    location: user.location,
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
