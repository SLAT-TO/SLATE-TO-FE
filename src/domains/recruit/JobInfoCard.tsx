import type { RecruitmentDetailResponse } from '../../types/recruitment'
import { roleLabel } from '../../constants/roles'
import { regionLabel } from '../../constants/regions'
import { PROJECT_TYPE_LABEL, PROJECT_LENGTH_TYPE_LABEL } from '../../constants/projectLabels'

interface JobInfoCardProps {
  detail: RecruitmentDetailResponse
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-caption-lg text-neutral-11 w-20 shrink-0 font-medium">{label}</span>
      <span className="text-caption-lg text-neutral-6">{value}</span>
    </div>
  )
}

function JobInfoCard({ detail }: JobInfoCardProps) {
  return (
    <section className="bg-bg-primary shadow-card flex flex-1 flex-col gap-4 rounded-xl p-6">
      <h3 className="text-body-sm text-neutral-11 font-bold">프로젝트 정보</h3>

      <InfoField label="모집 기간" value={`~ ${detail.deadline}`} />

      <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        <InfoField label="모집파트" value={roleLabel(detail.recruitPart)} />
        <InfoField label="촬영 지역" value={regionLabel(detail.location)} />
        <InfoField
          label="영상 유형"
          value={PROJECT_TYPE_LABEL[detail.category] ?? detail.category}
        />
        <InfoField
          label="영상 길이"
          value={
            detail.lengthType
              ? (PROJECT_LENGTH_TYPE_LABEL[detail.lengthType] ?? detail.lengthType)
              : '-'
          }
        />
        <InfoField label="보수" value={detail.pay} />
        <InfoField label="참여기간" value={detail.shootingPeriod || '-'} />
      </div>
    </section>
  )
}

export default JobInfoCard
