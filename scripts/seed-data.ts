/**
 * 테스트 데이터 생성 스크립트 (수정됨)
 * 시나리오: 초기 스타트업의 'AI 서비스 런칭' 및 '팀 빌딩' 과정
 *
 * 실행: npx tsx scripts/seed-data.ts
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// 1. 엔티티 타입 제한 (Project, Person)
const ENTITY_TYPES = ['project', 'person']

// 2. 시나리오 데이터: 구체적인 프로젝트와 팀원 설정
const SCENARIO_DATA = {
  project: [
    'AI 추천 알고리즘 고도화',     // 핵심 기술
    '모바일 앱 MVP 출시',          // 마일스톤
    '투자 유치용 IR 데크 작성',    // 비즈니스
    '사내 어드민 대시보드 개발',   // 운영
    '브랜드 디자인 리뉴얼'         // 디자인
  ],
  person: [
    '강민우 (CTO)',
    '서지현 (Lead Designer)',
    '박동훈 (Backend Dev)',
    '이채원 (PM)',
    '정호석 (Frontend Dev)'
  ]
}

// 3. 업무 템플릿: 조금 더 '일기'나 '회고' 같은 느낌으로 수정
const MEMO_TEMPLATES = [
  (names: string) => `오늘 ${names} 건으로 긴급 회의를 했다. 방향성을 다시 잡아야 할 것 같다.`,
  (names: string) => `${names} 작업이 생각보다 더디다. 리소스를 좀 더 투입해야 할지 고민이다.`,
  (names: string) => `드디어 ${names} 관련 1차 배포를 완료했다! 반응이 기대된다.`,
  (names: string) => `${names}에 대해 꽤 괜찮은 아이디어가 떠올랐다. 내일 데일리 때 공유해야지.`,
  (names: string) => `주말 동안 ${names} 관련 레퍼런스를 좀 찾아봤는데, 적용해볼 만한 게 많다.`,
  (names: string) => `${names} 이슈 때문에 밤을 샜다... 그래도 해결해서 다행이다.`,
  (names: string) => `${names} 건은 일단 보류하기로 결정했다. 지금은 우선순위가 아니다.`,
  (names: string) => `${names} 진행 상황 공유받음. 아주 순조롭게 진행되고 있다.`,
  (names: string) => `${names} 관련해서 외부 미팅을 다녀왔다. 긍정적인 피드백을 받았다.`,
  (names: string) => `오늘 ${names} 집중 코딩 시간. 방해받지 않고 많이 처리해서 뿌듯하다.`
]

// 날짜 생성 헬퍼
function getRandomDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  // 시간도 랜덤하게 (9시 ~ 18시 사이)
  date.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60))
  return date.toISOString()
}

// 배열에서 랜덤 선택
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function seedData() {
  console.log('🌱 스타트업 시나리오 데이터 시딩 시작...\n')

  // 1. 사용자 확인

  const userId = '3323af92-e630-430d-b4a4-80a5357b3ec6'
  console.log(`✅ 타겟 사용자: 3323af92-e630-430d-b4a4-80a5357b3ec6`)

  // 2. 엔티티 생성 (Project 5개, Person 5명)
  console.log('\n📦 엔티티 생성 중...')
  const createdEntities: Array<{ id: string; name: string; type: string }> = []

  for (const type of ENTITY_TYPES) {
    const names = SCENARIO_DATA[type as keyof typeof SCENARIO_DATA]
    
    for (const name of names) {
      // 생성일: 프로젝트는 보통 30일 전부터 시작되었다고 가정
      const daysAgo = Math.floor(Math.random() * 30)
      
      const { data, error } = await supabase
        .from('entity')
        .insert({
          name,
          type, // 'project' or 'person'
          user_id: userId,
          description: type === 'person' 
            ? `${name.split(' ')[0]}님과 함께하는 업무 기록` 
            : `${name} 프로젝트 진행 상황 및 아이디어 노트`,
          created_at: getRandomDate(daysAgo),
          updated_at: getRandomDate(0), // 최근 업데이트
        })
        .select('id, name, type')
        .single()

      if (error) {
        console.error(`❌ 엔티티 생성 실패 (${name}):`, error.message)
      } else if (data && data.type) {
        createdEntities.push(data as { id: string; name: string; type: string })
      }
    }
  }

  console.log(`✅ 총 ${createdEntities.length}개 엔티티(Person 5, Project 5) 생성 완료`)

  // 3. 메모 생성 (최근 30일간의 업무 일지 시뮬레이션)
  console.log('\n📝 업무 일지(메모) 생성 중...')
  let memoCount = 0
  const TARGET_MEMO_COUNT = 50 // 메모 개수 적절히 조절

  // 날짜별로 순차적으로 생성하여 타임라인 느낌을 줌
  for (let day = 30; day >= 0; day--) {
    // 주말(토,일)은 일을 적게 하거나 안 함 (랜덤 스킵)
    const isWeekend = (new Date(getRandomDate(day)).getDay() % 6 === 0)
    if (isWeekend && Math.random() > 0.3) continue; 

    // 하루에 1~3개의 메모 작성
    const memosToday = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < memosToday; i++) {
      if (memoCount >= TARGET_MEMO_COUNT) break;

      // 시나리오 로직: 보통 '사람'과 '프로젝트'가 같이 엮임
      // 예: "이채원(PM)님과 앱 MVP 출시 회의"
      const peopleEntities = createdEntities.filter(e => e.type === 'person')
      const projectEntities = createdEntities.filter(e => e.type === 'project')
      
      const selectedEntities = []
      
      // 50% 확률로 사람 포함
      if (Math.random() > 0.5) selectedEntities.push(randomChoice(peopleEntities))
      // 80% 확률로 프로젝트 포함
      if (Math.random() > 0.2) selectedEntities.push(randomChoice(projectEntities))

      // 만약 아무것도 선택 안됐으면 프로젝트 하나 강제 선택
      if (selectedEntities.length === 0) selectedEntities.push(randomChoice(projectEntities))

      // 중복 제거 (혹시 모를)
      const uniqueEntities = [...new Set(selectedEntities)]
      
      // 메모 내용 생성
      const entityNames = uniqueEntities.map(e => e.name).join(', ')
      const template = randomChoice(MEMO_TEMPLATES)
      const content = template(entityNames)
      const createdAt = getRandomDate(day)

      // 메모 Insert
      const { data: memo, error: memoError } = await supabase
        .from('memo')
        .insert({
          content,
          user_id: userId,
          created_at: createdAt,
          updated_at: createdAt,
        })
        .select('id')
        .single()

      if (memoError) {
        console.error('❌ 메모 저장 실패:', memoError.message)
        continue
      }

      // 관계(Relation) 연결
      if (memo && uniqueEntities.length > 0) {
        const relations = uniqueEntities.map(entity => ({
          memo_id: memo.id,
          entity_id: entity.id,
          created_at: createdAt
        }))

        const { error: relError } = await supabase
          .from('memo_entity')
          .insert(relations)

        if (relError) console.error('❌ 관계 연결 실패:', relError.message)
      }

      memoCount++
    }
  }

  console.log(`✅ ${memoCount}개 메모 생성 완료`)
  console.log('\n🎉 시나리오 데이터 시딩 완료!')
  console.log(`  - 팀원: 5명 (CTO, PM, 디자이너 등)`)
  console.log(`  - 프로젝트: 5개 (AI, 앱, IR 등)`)
}

seedData()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })