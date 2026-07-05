import { useState } from 'react'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (key: string) => void
}

export default function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.key)

  // activeTab이 현재 tabs 목록에 없으면, 렌더링 시점에 안전한 값으로 대체
  const safeActiveTab = tabs.some((tab) => tab.key === activeTab) ? activeTab : tabs[0]?.key

  const handleClick = (key: string) => {
    setActiveTab(key)
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
