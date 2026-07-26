/** 전역 헤더 왼쪽 기본 타이틀 */
export default function HeaderTitle({ children }: { children: string }) {
  return <h1 className="text-head-lg text-neutral-11 font-bold">{children}</h1>
}
