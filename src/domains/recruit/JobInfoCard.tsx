import type { RecruitmentDetail } from '../../types/Recruit.types'

interface JobInfoCardProps {
  detail: RecruitmentDetail
}

/* 공고 정보 카드 */

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption-lg text-neutral-11 font-medium">{label}</span>
      <span className="text-caption-lg text-neutral-6">{value}</span>
    </div>
  )
}

function JobInfoCard({ detail }: JobInfoCardProps) {
  return (
    <section className="bg-bg-primary shadow-card flex flex-1 flex-col gap-6 rounded-xl p-6">
      <h3 className="text-body-sm text-neutral-11 font-bold">프로젝트 정보</h3>

      <InfoField label="모집 기간" value={`~ ${detail.deadline}`} />

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        <InfoField label="모집파트" value={detail.recruitPart} />
        <InfoField label="촬영 지역" value={detail.shootingRegion} />
        <InfoField label="영상 유형" value={detail.videoType} />
        <InfoField label="영상 길이" value={detail.videoLength} />
        <InfoField label="보수" value={detail.pay} />
        <InfoField label="참여기간" value={detail.participationPeriod} />
      </div>
    </section>
  )
}

export default JobInfoCard
