'use client'

import BaseDrawer from './BaseDrawer'
import { Palette, Bell, Database, Shield, Globe, Keyboard, Moon, Sun, Monitor, Maximize2 } from 'lucide-react'
import { useLayout } from '@/app/providers/SettingsProvider'
import { useTheme } from '@/app/providers/ThemeProvider'

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { isFullWidth, toggleFullWidth, fontSize, fontFamily, setFontSize, setFontFamily } = useLayout()
  const { theme, themeName, setTheme } = useTheme()

  const footer = (
    <div className="flex items-center justify-between p-4">
      <div className="text-xs" style={{ color: theme.ui.textMuted }}>
        버전 1.0.0-beta
      </div>
      <button
        onClick={onClose}
        className="px-4 py-2 transition-colors rounded-lg"
        style={{
          color: theme.ui.textPrimary,
          backgroundColor: theme.ui.interactive.primaryBg,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBgHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBg
        }}
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
            <Maximize2 className="w-5 h-5" style={{ color: theme.ui.iconColors.indigo }} />
            <h3 className="text-base font-semibold" style={{ color: theme.ui.textPrimary }}>레이아웃</h3>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: theme.ui.cardBg }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: theme.ui.textPrimary }}>전체 너비 사용</p>
                <p className="text-xs mt-0.5" style={{ color: theme.ui.textMuted }}>
                  화면 전체 너비를 사용합니다. 끄면 중앙에 콘텐츠가 배치됩니다.
                </p>
              </div>
              <button
                onClick={toggleFullWidth}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                style={{
                  backgroundColor: isFullWidth ? theme.ui.interactive.primary : theme.ui.gray[600],
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                    isFullWidth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                  style={{ backgroundColor: '#FFFFFF' }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 외관 설정 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5" style={{ color: theme.ui.iconColors.blue }} />
            <h3 className="text-base font-semibold" style={{ color: theme.ui.textPrimary }}>외관</h3>
          </div>
          <div className="rounded-lg p-4 space-y-4" style={{ backgroundColor: theme.ui.cardBg }}>
            {/* 테마 */}
            <div>
              <label className="text-sm mb-2 block" style={{ color: theme.ui.textMuted }}>테마 스타일</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('default')}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg transition-colors border"
                  style={{
                    backgroundColor: themeName === 'default' ? theme.ui.interactive.primary : theme.ui.secondaryBg,
                    borderColor: themeName === 'default' ? theme.ui.interactive.primary : theme.ui.gray[600],
                  }}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs" style={{ color: theme.ui.textPrimary }}>Default</span>
                </button>
                <button
                  onClick={() => setTheme('claude-light')}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg transition-colors border"
                  style={{
                    backgroundColor: themeName === 'claude-light' ? theme.ui.interactive.primary : theme.ui.secondaryBg,
                    borderColor: themeName === 'claude-light' ? theme.ui.interactive.primary : theme.ui.gray[600],
                  }}
                >
                  <Palette className="w-4 h-4" />
                  <span className="text-xs" style={{ color: theme.ui.textPrimary }}>Light</span>
                </button>
                <button
                  onClick={() => setTheme('claude-dark')}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg transition-colors border"
                  style={{
                    backgroundColor: themeName === 'claude-dark' ? theme.ui.interactive.primary : theme.ui.secondaryBg,
                    borderColor: themeName === 'claude-dark' ? theme.ui.interactive.primary : theme.ui.gray[600],
                  }}
                >
                  <Palette className="w-4 h-4" />
                  <span className="text-xs" style={{ color: theme.ui.textPrimary }}>Dark</span>
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: theme.ui.textMuted }}>
                {themeName === 'default'
                  ? 'Default 다크 테마가 적용되었습니다.'
                  : themeName === 'claude-light'
                  ? 'Claude 라이트 테마가 적용되었습니다. (따뜻한 베이지 톤)'
                  : 'Claude 다크 테마가 적용되었습니다. (따뜻한 브라운 톤)'}
              </p>
            </div>

            {/* 폰트 크기 - 실제 기능 */}
            <div>
              <label className="text-sm mb-2 block" style={{ color: theme.ui.textMuted }}>폰트 크기</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none border"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  color: theme.ui.textPrimary,
                  borderColor: theme.ui.gray[500],
                }}
              >
                <option value="small">작게</option>
                <option value="medium">기본</option>
                <option value="large">크게</option>
                <option value="xlarge">매우 크게</option>
              </select>
            </div>

            {/* 폰트 종류 - 실제 기능 */}
            <div>
              <label className="text-sm mb-2 block" style={{ color: theme.ui.textMuted }}>폰트</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none border"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  color: theme.ui.textPrimary,
                  borderColor: theme.ui.gray[500],
                }}
              >
                <option value="inter">Inter (기본)</option>
                <option value="noto">Noto Sans KR (한글 최적화)</option>
                <option value="system">시스템 폰트</option>
              </select>
            </div>

            {/* 컴팩트 모드 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: theme.ui.textPrimary }}>컴팩트 모드</p>
                <p className="text-xs mt-0.5" style={{ color: theme.ui.textMuted }}>더 많은 콘텐츠를 한 화면에 표시</p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ backgroundColor: theme.ui.gray[600] }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full transition-transform translate-x-1"
                  style={{ backgroundColor: '#FFFFFF' }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 알림 설정 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5" style={{ color: theme.ui.iconColors.yellow }} />
            <h3 className="text-base font-semibold" style={{ color: theme.ui.textPrimary }}>알림</h3>
          </div>
          <div className="rounded-lg p-4 space-y-4" style={{ backgroundColor: theme.ui.cardBg }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: theme.ui.textPrimary }}>데스크톱 알림</p>
                <p className="text-xs mt-0.5" style={{ color: theme.ui.textMuted }}>브라우저 알림 받기</p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full"
                style={{ backgroundColor: theme.ui.interactive.primary }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full transition-transform translate-x-6"
                  style={{ backgroundColor: '#FFFFFF' }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: theme.ui.textPrimary }}>이메일 알림</p>
                <p className="text-xs mt-0.5" style={{ color: theme.ui.textMuted }}>중요한 업데이트 이메일 수신</p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full"
                style={{ backgroundColor: theme.ui.interactive.primary }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full transition-transform translate-x-6"
                  style={{ backgroundColor: '#FFFFFF' }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: theme.ui.textPrimary }}>사운드</p>
                <p className="text-xs mt-0.5" style={{ color: theme.ui.textMuted }}>알림 사운드 재생</p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ backgroundColor: theme.ui.gray[600] }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full transition-transform translate-x-1"
                  style={{ backgroundColor: '#FFFFFF' }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 데이터 및 저장소 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5" style={{ color: theme.ui.iconColors.green }} />
            <h3 className="text-base font-semibold" style={{ color: theme.ui.textPrimary }}>데이터 및 저장소</h3>
          </div>
          <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: theme.ui.cardBg }}>
            <button
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors"
              style={{ color: theme.ui.textPrimary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.ui.buttonHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              캐시 데이터 삭제
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors"
              style={{ color: theme.ui.textPrimary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.ui.buttonHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              데이터 내보내기
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors"
              style={{ color: theme.ui.textPrimary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.ui.buttonHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              데이터 가져오기
            </button>
          </div>
        </section>

        {/* 개인정보 및 보안 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5" style={{ color: theme.ui.iconColors.purple }} />
            <h3 className="text-base font-semibold" style={{ color: theme.ui.textPrimary }}>개인정보 및 보안</h3>
          </div>
          <div className="rounded-lg p-4 space-y-4" style={{ backgroundColor: theme.ui.cardBg }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: theme.ui.textPrimary }}>2단계 인증</p>
                <p className="text-xs mt-0.5" style={{ color: theme.ui.textMuted }}>추가 보안 레이어 활성화</p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ backgroundColor: theme.ui.gray[600] }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full transition-transform translate-x-1"
                  style={{ backgroundColor: '#FFFFFF' }}
                />
              </button>
            </div>

            <button
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors"
              style={{ color: theme.ui.textPrimary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.ui.buttonHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              비밀번호 변경
            </button>

            <button
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors"
              style={{ color: theme.ui.textPrimary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.ui.buttonHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              활성 세션 관리
            </button>
          </div>
        </section>

        {/* 언어 및 지역 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5" style={{ color: theme.ui.iconColors.cyan }} />
            <h3 className="text-base font-semibold" style={{ color: theme.ui.textPrimary }}>언어 및 지역</h3>
          </div>
          <div className="rounded-lg p-4 space-y-4" style={{ backgroundColor: theme.ui.cardBg }}>
            <div>
              <label className="text-sm mb-2 block" style={{ color: theme.ui.textMuted }}>언어</label>
              <select
                className="w-full px-3 py-2 rounded-lg focus:outline-none border"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  color: theme.ui.textPrimary,
                  borderColor: theme.ui.gray[500],
                }}
              >
                <option selected>한국어</option>
                <option>English</option>
                <option>日本語</option>
                <option>中文</option>
              </select>
            </div>

            <div>
              <label className="text-sm mb-2 block" style={{ color: theme.ui.textMuted }}>시간대</label>
              <select
                className="w-full px-3 py-2 rounded-lg focus:outline-none border"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  color: theme.ui.textPrimary,
                  borderColor: theme.ui.gray[500],
                }}
              >
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
            <Keyboard className="w-5 h-5" style={{ color: theme.ui.iconColors.orange }} />
            <h3 className="text-base font-semibold" style={{ color: theme.ui.textPrimary }}>키보드 단축키</h3>
          </div>
          <div className="rounded-lg p-4 space-y-2 text-sm" style={{ backgroundColor: theme.ui.cardBg }}>
            <div className="flex items-center justify-between py-1">
              <span style={{ color: theme.ui.textMuted }}>새 메모</span>
              <kbd
                className="px-2 py-1 rounded border"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  color: theme.ui.textPrimary,
                  borderColor: theme.ui.border,
                }}
              >
                Ctrl+N
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span style={{ color: theme.ui.textMuted }}>검색</span>
              <kbd
                className="px-2 py-1 rounded border"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  color: theme.ui.textPrimary,
                  borderColor: theme.ui.border,
                }}
              >
                Ctrl+K
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span style={{ color: theme.ui.textMuted }}>설정</span>
              <kbd
                className="px-2 py-1 rounded border"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  color: theme.ui.textPrimary,
                  borderColor: theme.ui.border,
                }}
              >
                Ctrl+,
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span style={{ color: theme.ui.textMuted }}>저장</span>
              <kbd
                className="px-2 py-1 rounded border"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  color: theme.ui.textPrimary,
                  borderColor: theme.ui.border,
                }}
              >
                Ctrl+Enter
              </kbd>
            </div>
            <button
              className="w-full text-left px-3 py-2 rounded transition-colors mt-2"
              style={{ color: theme.ui.interactive.primaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.ui.buttonHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              단축키 사용자 정의
            </button>
          </div>
        </section>
      </div>
    </BaseDrawer>
  )
}
