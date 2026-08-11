import { useEffect, useState } from 'react'
import Input from '../components/Input'
import TextArea from '../components/TextArea'
import Select from '../components/Select'
import MultiSelect from '../components/MultiSelect'
import { Button } from '../components/Button'
import { ROLE_OPTIONS } from '../constants/roles'
import { VIDEO_CATEGORY_OPTIONS } from '../constants/videoCategories'
import { portfolioSchema, type PortfolioFormValues } from '../schemas/portfolio'
import { validateField } from '../utils/validateField'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'
import { navigate } from '../utils/navigation'
import { createPortfolio, getMyPortfolio, updatePortfolio } from '../api/users'
import type { UserRole } from '../types/user'
import type { PortfolioKind } from '../types/portfolio'

type ProjectFormMode = 'create' | 'edit'

interface ProjectFormPageProps {
  mode?: ProjectFormMode
  portfolioId?: number
}

const CREATE_VALUES: PortfolioFormValues = {
  title: '',
  clientName: '',
  type: '',
  roles: [],
  youtubeUrl: '',
  description: '',
  comment: '',
}

type FormErrors = Partial<Record<keyof PortfolioFormValues, string>>

// 유튜브 URL에서 썸네일 추출 (간단 버전). 추후 oEmbed 연동 가능.
function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/)
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null
}

const CREATE_HEADER = <HeaderTitle>프로젝트 추가</HeaderTitle>
const EDIT_HEADER = <HeaderTitle>프로젝트 수정</HeaderTitle>

function ProjectFormPage({ mode, portfolioId }: ProjectFormPageProps) {
  useHeaderSlot(mode === 'edit' ? EDIT_HEADER : CREATE_HEADER)
  const [values, setValues] = useState<PortfolioFormValues>(CREATE_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [originalKind, setOriginalKind] = useState<PortfolioKind | null>(null)

  // 수정 모드는 기존 값으로 프리필
  useEffect(() => {
    if (mode !== 'edit' || portfolioId == null) return
    let cancelled = false

    getMyPortfolio(portfolioId)
      .then((portfolio) => {
        if (cancelled) return
        setValues({
          title: portfolio.title,
          clientName: portfolio.clientName ?? '',
          type: portfolio.type,
          roles: portfolio.roles,
          youtubeUrl: portfolio.youtubeUrl,
          description: portfolio.description,
          comment: portfolio.comment ?? '',
        })
        setOriginalKind(portfolio.kind)
      })
      .catch(() => {
        if (!cancelled) setSaveError('프로젝트 정보를 불러오지 못했습니다.')
      })

    return () => {
      cancelled = true
    }
  }, [mode, portfolioId])

  const handleChange = (field: keyof PortfolioFormValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: keyof PortfolioFormValues) => () => {
    const message = validateField(portfolioSchema.shape[field], values[field])
    setErrors((prev) => ({ ...prev, [field]: message }))
  }
  const handleRolesChange = (next: string[]) => {
    setValues((prev) => ({ ...prev, roles: next }))
    setErrors((prev) => ({ ...prev, roles: undefined }))
  }

  const handleSubmit = async () => {
    const result = portfolioSchema.safeParse(values)
    if (!result.success) {
      const nextErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof PortfolioFormValues
        if (!nextErrors[key]) nextErrors[key] = issue.message
      }
      setErrors(nextErrors)
      return
    }

    setIsSaving(true)
    setSaveError(null)
    try {
      const body = {
        title: result.data.title,
        type: result.data.type,
        // 화면에 개인/외주 선택 UI가 없어, 수정 시 기존 값 유지 / 신규는 PERSONAL
        kind: originalKind ?? 'PERSONAL',
        clientName: result.data.clientName || undefined,
        roles: result.data.roles as UserRole[],
        description: result.data.description,
        comment: result.data.comment || undefined,
        youtubeUrl: result.data.youtubeUrl,
      }

      if (mode === 'edit' && portfolioId != null) {
        await updatePortfolio(portfolioId, body)
      } else {
        await createPortfolio(body)
      }
      navigate('/mypage')
    } catch {
      setSaveError('저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/mypage')
  }

  const thumbnail = getYoutubeThumbnail(values.youtubeUrl)

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        {/* 왼쪽 열 */}
        <div className="flex flex-col gap-5">
          <Input
            label="프로젝트 제목"
            required
            placeholder="프로젝트 제목을 입력하세요."
            value={values.title}
            onChange={handleChange('title')}
            error={errors.title}
          />

          <Select
            label="프로젝트 유형"
            required
            options={VIDEO_CATEGORY_OPTIONS}
            value={values.type}
            onChange={handleChange('type')}
            onBlur={handleBlur('type')}
            error={errors.type}
            placeholder="유형을 선택하거나 직접 입력하세요."
          />

          <MultiSelect
            label="맡은 역할"
            required
            options={ROLE_OPTIONS}
            selected={values.roles}
            onChange={handleRolesChange}
            error={errors.roles}
            placeholder="역할을 선택하세요."
          />

          <TextArea
            label="프로젝트 설명"
            placeholder="프로젝트에 대한 설명을 입력하세요."
            value={values.description}
            onChange={handleChange('description')}
            onBlur={handleBlur('description')}
            error={errors.description}
            maxLength={500}
            rows={4}
            className="bg-neutral-2 border-none shadow-xs"
          />

          <TextArea
            label="코멘트"
            placeholder="프로젝트를 하고 느낀점을 입력하세요."
            value={values.comment ?? ''}
            onChange={handleChange('comment')}
            onBlur={handleBlur('comment')}
            error={errors.comment}
            maxLength={500}
            rows={3}
            className="bg-neutral-2 border-none shadow-xs"
          />
        </div>

        {/* 오른쪽 열 */}
        <div className="flex flex-col gap-5">
          <Input
            label="클라이언트 (선택)"
            placeholder="클라이언트명을 입력하세요."
            value={values.clientName ?? ''}
            onChange={handleChange('clientName')}
            error={errors.clientName}
          />

          <Input
            label="프로젝트 링크"
            required
            placeholder="Youtube 또는 외부 링크를 입력하세요."
            value={values.youtubeUrl}
            onChange={handleChange('youtubeUrl')}
            error={errors.youtubeUrl}
            hint="Youtube 링크 입력 시 자동으로 썸네일이 표시됩니다."
          />

          {/* 링크 있으면 썸네일 미리보기, 없으면 파일 업로드 박스 */}
          {thumbnail ? (
            <img src={thumbnail} alt="프로젝트 썸네일" className="w-full rounded-lg object-cover" />
          ) : (
            <label className="bg-neutral-2 hover:bg-neutral-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg py-16 shadow-xs">
              <input
                type="file"
                accept=".png,.pdf,.doc,.docx,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // 파일 업로드 API 연동 필요.
                    console.log('선택된 파일:', file.name)
                  }
                }}
              />
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-neutral-5"
              >
                <path
                  d="M12 16V4M12 4L7 9M12 4l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-neutral-6 text-sm">이 곳에 파일을 추가해주세요.</p>
              <p className="text-neutral-5 text-xs">파일을 드래그하거나 클릭하여 업로드</p>
              <p className="text-neutral-5 text-xs">
                첨부가능 파일 형식 (Png, Pdf, Word, Jpg) 최대 5GB
              </p>
            </label>
          )}
        </div>
      </div>

      {/* 저장 / 취소 */}
      {saveError && <p className="text-caption-sm text-warning text-center">{saveError}</p>}

      <div className="flex justify-center gap-3">
        <Button
          variant="primary"
          onClick={() => void handleSubmit()}
          disabled={isSaving}
          className="px-24"
        >
          {isSaving ? '저장 중...' : '저장'}
        </Button>
        <Button variant="secondary" onClick={handleCancel} className="px-24">
          취소
        </Button>
      </div>
    </div>
  )
}

export default ProjectFormPage
