import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
/* 배럴 파일(여러 함수들을 모아서 import 후 export 하는 파일) handlers의 index.ts에서 함수들을 배열로 한번에 받아 export*/
export const worker = setupWorker(...handlers)
