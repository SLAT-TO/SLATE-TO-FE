import { useState } from 'react'
import Input from '../components/Input'
import TextArea from '../components/TextArea'
import FileInput from '../components/FileInput'
import { Button } from '../components/Button'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'
import { createInquiry } from '../api/inquiries'
import { navigate } from '../utils/navigation'
import { CARD_BASE } from '../styles/card'

const HEADER = <HeaderTitle>문의하기</HeaderTitle>

function SettingsInquiryPage() {
  useHeaderSlot(HEADER)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      return
    }
    await createInquiry({
      title,
      content,
      attachmentFileNames: files.map((file) => file.name),
    })
    navigate('/settings')
  }

  const handleCancel = () => {
    navigate('/settings')
  }

  return (
    <div className="p-6">
      <section className={`flex flex-col gap-7 p-10 ${CARD_BASE}`}>
        <Input
          label="문의 제목"
          placeholder="문의 제목을 입력해주세요."
          value={title}
          onChange={setTitle}
        />
        <TextArea
          label="문의 내용"
          placeholder="문의 내용을 입력해주세요."
          value={content}
          onChange={setContent}
          rows={1}
          className="bg-neutral-2"
        />
        <FileInput
          label="첨부파일 (선택)"
          value={files}
          onChange={setFiles}
          multiple
          hint="첨부가능 파일 형식 (png, pdf, word, jpg) 최대 5GB"
        />
        {error && <p className="text-caption-sm text-warning">{error}</p>}
        <div className="flex justify-center gap-4 pt-2">
          <Button variant="primary" onClick={handleSubmit} className="px-24">
            등록
          </Button>
          <Button variant="secondary" onClick={handleCancel} className="px-24">
            취소
          </Button>
        </div>
      </section>
    </div>
  )
}

export default SettingsInquiryPage
