/** Notion API 명세서 DB 기준. url 끝 공백은 trim. */

export const API_PREFIX = '/api/v1'

export const paths = {
  auth: {
    googleLogin: `${API_PREFIX}/auth/login/google`,
    logout: `${API_PREFIX}/auth/logout`,
    refresh: `${API_PREFIX}/auth/refresh`,
  },
  users: {
    /** GET/PATCH만 BE 구현. DELETE(회원탈퇴)는 BE 미구현 — FE mock 전용 */
    me: `${API_PREFIX}/users/me`,
    /** Notion DB에 GET /users/me 중복 등록 — 통계는 임시 path 분리
     * FE mock 전용 — BE에 활동 통계 API 미구현 (Swagger에 없음) */
    activityStats: `${API_PREFIX}/users/me/activity-stats`,
    onboarding: `${API_PREFIX}/users/onboarding`,
    byId: (userId: number | string) => `${API_PREFIX}/users/${userId}`,
    portfolios: (userId: number | string) => `${API_PREFIX}/users/${userId}/portfolios`,
    notificationSettings: `${API_PREFIX}/users/me/notification-settings`,
    /** FE mock 전용 — BE 비밀번호 변경 API 미구현 */
    changePassword: `${API_PREFIX}/users/me/password`,
    myPortfolios: `${API_PREFIX}/users/me/portfolios`,
    myPortfolio: (portfolioId: number | string) =>
      `${API_PREFIX}/users/me/portfolios/${portfolioId}`,
    /** FE mock 전용 — BE에 Recruitment 컨트롤러 자체가 없음 (엔티티만 존재, Swagger에 미노출) */
    myRecruitments: `${API_PREFIX}/users/me/recruitments`,
    myApplications: `${API_PREFIX}/users/me/applications`,
    myRecruitmentBookmarks: `${API_PREFIX}/users/me/recruitment-bookmarks`,
  },
  projects: {
    root: `${API_PREFIX}/projects`,
    byId: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}`,
    pin: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/pin`,
    videos: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/videos`,
    video: (projectId: number | string, videoId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/videos/${videoId}`,
    videoBookmark: (projectId: number | string, videoId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/videos/${videoId}/bookmark`,
    /** BE: /projects/{projectId}/videos/{videoId}/reference-files */
    referenceFiles: (projectId: number | string, videoId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/videos/${videoId}/reference-files`,
    referenceFile: (
      projectId: number | string,
      videoId: number | string,
      referenceFileId: number | string,
    ) =>
      `${API_PREFIX}/projects/${projectId}/videos/${videoId}/reference-files/${referenceFileId}`,
    files: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/files`,
    file: (projectId: number | string, fileId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/files/${fileId}`,
    download: (projectId: number | string, fileId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/files/${fileId}/download`,
    filePin: (projectId: number | string, fileId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/files/${fileId}/pin`,
    invitations: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/invitations`,
    members: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/members`,
    member: (projectId: number | string, memberId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/members/${memberId}`,
    leave: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/members/me`,
    /** BE Recent Activity */
    activities: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/activities`,
    activityRead: (projectId: number | string, activityId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/activities/${activityId}/read`,
    activitiesReadAll: (projectId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/activities/read-all`,
    notices: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/notices`,
    notice: (projectId: number | string, noticeId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/notices/${noticeId}`,
    noticeRead: (projectId: number | string, noticeId: number | string) =>
      `${API_PREFIX}/projects/${projectId}/notices/${noticeId}/read`,
  },
  projectInvitations: {
    byToken: (token: string) => `${API_PREFIX}/project-invitations/${token}`,
    accept: (token: string) => `${API_PREFIX}/project-invitations/${token}/accept`,
  },
  videos: {
    validateYoutube: `${API_PREFIX}/videos/youtube/validate`,
    feedbacks: (videoId: number | string) => `${API_PREFIX}/videos/${videoId}/feedbacks`,
    shareLinks: (videoId: number | string) => `${API_PREFIX}/videos/${videoId}/share-links`,
  },
  feedbacks: {
    byId: (feedbackId: number | string) => `${API_PREFIX}/feedbacks/${feedbackId}`,
    status: (feedbackId: number | string) => `${API_PREFIX}/feedbacks/${feedbackId}/status`,
    replies: (feedbackId: number | string) => `${API_PREFIX}/feedbacks/${feedbackId}/replies`,
  },
  replies: {
    byId: (replyId: number | string) => `${API_PREFIX}/replies/${replyId}`,
    status: (replyId: number | string) => `${API_PREFIX}/replies/${replyId}/status`,
  },
  shareLinks: {
    byToken: (token: string) => `${API_PREFIX}/share-links/${token}`,
    guests: (token: string) => `${API_PREFIX}/share-links/${token}/guests`,
    byId: (shareLinkId: number | string) => `${API_PREFIX}/share-links/${shareLinkId}`,
  },
  /** FE mock 전용 — BE에 Recruitment 컨트롤러 자체가 없음 (엔티티만 존재, Swagger에 미노출)
   * BE 엔티티 필드(recruitPart/shootingPeriod/pay/contact/location/deadline)가 FE 모델과 구조가
   * 많이 달라서, 컨트롤러가 실제로 나오기 전까지는 아래 타입/mock을 엔티티에 맞춰 미리 바꾸지 않음 */
  recruitments: {
    root: `${API_PREFIX}/recruitments`,
    recommended: `${API_PREFIX}/recruitments/recommended`,
    byId: (recruitmentId: number | string) => `${API_PREFIX}/recruitments/${recruitmentId}`,
    bookmark: (recruitmentId: number | string) =>
      `${API_PREFIX}/recruitments/${recruitmentId}/bookmark`,
    applications: (recruitmentId: number | string) =>
      `${API_PREFIX}/recruitments/${recruitmentId}/applications`,
    application: (recruitmentId: number | string, applicationId: number | string) =>
      `${API_PREFIX}/recruitments/${recruitmentId}/applications/${applicationId}`,
  },
  schedules: {
    root: `${API_PREFIX}/schedules`,
    /** FE mock 전용 — BE에 일정 요약 API 없음 */
    summary: `${API_PREFIX}/schedules/summary`,
    daily: `${API_PREFIX}/schedules/daily`,
    byId: (scheduleId: number | string) => `${API_PREFIX}/schedules/${scheduleId}`,
    privateMemo: (scheduleId: number | string) =>
      `${API_PREFIX}/schedules/${scheduleId}/private-memo`,
  },
  briefings: {
    today: `${API_PREFIX}/briefings/today`,
  },
  notifications: {
    root: `${API_PREFIX}/notifications`,
    /** FE mock 전용 — BE에 안읽음 개수 API 없음 (목록 조회로 계산 필요) */
    unreadCount: `${API_PREFIX}/notifications/unread-count`,
    read: (notificationId: number | string) => `${API_PREFIX}/notifications/${notificationId}/read`,
    readAll: `${API_PREFIX}/notifications/read-all`,
  },
  /** FE mock 전용 — BE 문의하기 API 미구현 */
  inquiries: {
    root: `${API_PREFIX}/inquiries`,
  },
} as const
