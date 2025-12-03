'use client'

import BaseDrawer from './BaseDrawer'
import { Palette, Bell, Database, Shield, Globe, Keyboard, Moon, Sun, Monitor, Maximize2 } from 'lucide-react'
import { useLayout } from '@/app/providers/SettingsProvider'

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { isFullWidth, toggleFullWidth, fontSize, fontFamily, setFontSize, setFontFamily } = useLayout()

  const footer = (
    <div className="flex items-center justify-between p-4">
      <div className="text-xs text-text-muted">
        버전 1.0.0-beta
      </div>
      <button
        onClick={onClose}
        className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 transition-colors rounded-lg"
      >
        닫기
      </button>
    </div>
  )

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="설정"
      footer={footer}
    >
      <div className="p-4 space-y-6">
        {/* Full Width 설정 - 실제 기능 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Maximize2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">레이아웃</h3>
          </div>
          <div className="bg-bg-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">전체 너비 사용</p>
                <p className="text-xs text-text-muted mt-0.5">
                  화면 전체 너비를 사용합니다. 끄면 중앙에 콘텐츠가 배치됩니다.
                </p>
              </div>
              <button
                onClick={toggleFullWidth}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isFullWidth ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isFullWidth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 외관 설정 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">외관</h3>
          </div>
          <div className="bg-bg-card rounded-lg p-4 space-y-4">
            {/* 테마 */}
            <div>
              <label className="text-sm text-text-muted mb-2 block">테마</label>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-bg-primary border border-border-main rounded-lg transition-colors">
                  <Sun className="w-4 h-4" />
                  <span className="text-sm text-white">라이트</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 border border-blue-500 rounded-lg transition-colors">
                  <Moon className="w-4 h-4" />
                  <span className="text-sm text-white">다크</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-bg-primary border border-border-main rounded-lg transition-colors">
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm text-white">시스템</span>
                </button>
              </div>
            </div>

            {/* 폰트 크기 - 실제 기능 */}
            <div>
              <label className="text-sm text-text-muted mb-2 block">폰트 크기</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as any)}
                className="w-full px-3 py-2 bg-bg-secondary text-white border border-border-main rounded-lg focus:border-gray-500 focus:outline-none"
              >
                <option value="small">작게</option>
                <option value="medium">기본</option>
                <option value="large">크게</option>
                <option value="xlarge">매우 크게</option>
              </select>
            </div>

            {/* 폰트 종류 - 실제 기능 */}
            <div>
              <label className="text-sm text-text-muted mb-2 block">폰트</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="w-full px-3 py-2 bg-bg-secondary text-white border border-border-main rounded-lg focus:border-gray-500 focus:outline-none"
              >
                <option value="inter">Inter (기본)</option>
                <option value="noto">Noto Sans KR (한글 최적화)</option>
                <option value="system">시스템 폰트</option>
              </select>
            </div>

            {/* 컴팩트 모드 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">컴팩트 모드</p>
                <p className="text-xs text-text-muted mt-0.5">더 많은 콘텐츠를 한 화면에 표시</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors hover:bg-gray-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        {/* 알림 설정 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h3 className="text-base font-semibold text-white">알림</h3>
          </div>
          <div className="bg-bg-card rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">데스크톱 알림</p>
                <p className="text-xs text-text-muted mt-0.5">브라우저 알림 받기</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">이메일 알림</p>
                <p className="text-xs text-text-muted mt-0.5">중요한 업데이트 이메일 수신</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">사운드</p>
                <p className="text-xs text-text-muted mt-0.5">알림 사운드 재생</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors hover:bg-gray-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        {/* 데이터 및 저장소 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-green-400" />
            <h3 className="text-base font-semibold text-white">데이터 및 저장소</h3>
          </div>
          <div className="bg-bg-card rounded-lg p-4 space-y-3">
            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-bg-secondary rounded transition-colors">
              캐시 데이터 삭제
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-bg-secondary rounded transition-colors">
              데이터 내보내기
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-bg-secondary rounded transition-colors">
              데이터 가져오기
            </button>
          </div>
        </section>

        {/* 개인정보 및 보안 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-semibold text-white">개인정보 및 보안</h3>
          </div>
          <div className="bg-bg-card rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">2단계 인증</p>
                <p className="text-xs text-text-muted mt-0.5">추가 보안 레이어 활성화</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors hover:bg-gray-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>

            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-bg-secondary rounded transition-colors">
              비밀번호 변경
            </button>

            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-bg-secondary rounded transition-colors">
              활성 세션 관리
            </button>
          </div>
        </section>

        {/* 언어 및 지역 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">언어 및 지역</h3>
          </div>
          <div className="bg-bg-card rounded-lg p-4 space-y-4">
            <div>
              <label className="text-sm text-text-muted mb-2 block">언어</label>
              <select className="w-full px-3 py-2 bg-bg-secondary text-white border border-border-main rounded-lg focus:border-gray-500 focus:outline-none">
                <option selected>한국어</option>
                <option>English</option>
                <option>日本語</option>
                <option>中文</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-text-muted mb-2 block">시간대</label>
              <select className="w-full px-3 py-2 bg-bg-secondary text-white border border-border-main rounded-lg focus:border-gray-500 focus:outline-none">
                <option selected>Asia/Seoul (UTC+9)</option>
                <option>America/New_York (UTC-5)</option>
                <option>Europe/London (UTC+0)</option>
                <option>Asia/Tokyo (UTC+9)</option>
              </select>
            </div>
          </div>
        </section>

        {/* 키보드 단축키 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Keyboard className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-semibold text-white">키보드 단축키</h3>
          </div>
          <div className="bg-bg-card rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between py-1">
              <span className="text-text-muted">새 메모</span>
              <kbd className="px-2 py-1 bg-bg-secondary text-white rounded border border-border-main">Ctrl+N</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-text-muted">검색</span>
              <kbd className="px-2 py-1 bg-bg-secondary text-white rounded border border-border-main">Ctrl+K</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-text-muted">설정</span>
              <kbd className="px-2 py-1 bg-bg-secondary text-white rounded border border-border-main">Ctrl+,</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-text-muted">저장</span>
              <kbd className="px-2 py-1 bg-bg-secondary text-white rounded border border-border-main">Ctrl+Enter</kbd>
            </div>
            <button className="w-full text-left px-3 py-2 text-blue-400 hover:bg-bg-secondary rounded transition-colors mt-2">
              단축키 사용자 정의
            </button>
          </div>
        </section>
      </div>
    </BaseDrawer>
  )
}
