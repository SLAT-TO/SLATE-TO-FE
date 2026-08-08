/**
 * 실서버(Vite proxy → api.slatto.cloud) 워크스페이스 영상 URL 스모크
 *
 *   $env:SLATE_ACCESS_TOKEN="eyJ..."
 *   $env:PLAYWRIGHT_BASE_URL="http://localhost:5174"
 *   node scripts/playwright-workspace-video.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5174'
const TOKEN = process.env.SLATE_ACCESS_TOKEN

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function main() {
  if (!TOKEN) {
    console.error('FAIL: SLATE_ACCESS_TOKEN(실서버 JWT)이 필요합니다.')
    console.error('브라우저 Application → Local Storage → slate_access_token 값을 넣어 주세요.')
    process.exit(2)
  }

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const log = []

  await page.addInitScript((token) => {
    localStorage.setItem('slate_access_token', token)
  }, TOKEN)

  const projectsRes = await page.request.get(`${BASE}/api/v1/projects`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  assert(projectsRes.ok(), `GET /projects => ${projectsRes.status()}`)
  const projects = (await projectsRes.json())?.result?.items ?? []
  assert(projects.length > 0, '실서버에 프로젝트가 없습니다')
  const projectId = projects[0].id
  log.push(`projectId=${projectId}`)

  const videosRes = await page.request.get(`${BASE}/api/v1/projects/${projectId}/videos`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  assert(videosRes.ok(), `GET /videos => ${videosRes.status()}`)
  const videos = (await videosRes.json())?.result?.items ?? []
  assert(videos.length > 0, '실서버 프로젝트에 영상이 없습니다')
  const videoId = videos[0].videoId
  const videoTitle = videos[0].title
  log.push(`videoId=${videoId} title=${videoTitle}`)

  await page.goto(`${BASE}/workspace/projects/${projectId}`, { waitUntil: 'domcontentloaded' })
  await page.waitForURL(`**/workspace/projects/${projectId}`)
  log.push(`detail: ${new URL(page.url()).pathname}`)

  await page.getByRole('tab', { name: '피드백' }).click()
  await page.getByRole('heading', { name: '영상 목록' }).waitFor({ timeout: 20000 })

  await page.getByRole('button', { name: videoTitle }).first().click()
  await page.waitForURL(`**/workspace/projects/${projectId}/videos/${videoId}`, {
    timeout: 15000,
  })
  const afterClick = new URL(page.url()).pathname
  assert(
    afterClick === `/workspace/projects/${projectId}/videos/${videoId}`,
    `클릭 후 URL: ${afterClick}`,
  )
  log.push(`video click: ${afterClick}`)

  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForURL(`**/workspace/projects/${projectId}/videos/${videoId}`)
  assert(
    new URL(page.url()).pathname === `/workspace/projects/${projectId}/videos/${videoId}`,
    `새로고침 후 URL: ${page.url()}`,
  )
  log.push(`reload: ${new URL(page.url()).pathname}`)

  // 브라우저 뒤로가기 → 프로젝트 상세
  await page.goBack()
  await page.waitForURL(`**/workspace/projects/${projectId}`, { timeout: 15000 })
  assert(!page.url().includes('/videos/'), `goBack 후 URL: ${page.url()}`)
  log.push(`goBack: ${new URL(page.url()).pathname}`)

  console.log('PASS (real API via Vite proxy)')
  for (const line of log) console.log(`- ${line}`)
  await browser.close()
}

main().catch((err) => {
  console.error('FAIL:', err.message)
  process.exit(1)
})
