import { useState } from 'react'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  /** 지정하면 controlled로 동작 — 부모가 탭 상태를 소유할 때 사용(예: 화면 전환 후 되돌아와도 선택 유지) */
  activeTab?: string
  onChange?: (key: string) => void
}

export default function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab ?? tabs[0]?.key)
  const activeTab = controlledActiveTab ?? internalActiveTab

  const safeActiveTab = tabs.some((tab) => tab.key === activeTab) ? activeTab : tabs[0]?.key

  const handleClick = (key: string) => {
    if (controlledActiveTab === undefined) setInternalActiveTab(key)
    onChange?.(key)
  }

  return (
    <div className="border-border flex border-b" role="tablist">
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.key}
          role="tab"
          aria-selected={safeActiveTab === tab.key}
          onClick={() => handleClick(tab.key)}
          className={`text-body-sm px-6 py-3 transition-colors ${
            safeActiveTab === tab.key
              ? 'border-neutral-11 text-neutral-11 border-b-2 font-semibold'
              : 'text-neutral-5 hover:text-neutral-7'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
