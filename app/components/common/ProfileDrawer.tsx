'use client'

import BaseDrawer from './BaseDrawer'
import { User, Mail, Calendar, Tag, FileText, Camera, Link2, Unlink } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useEntities, useUpdateProfile } from '@/app/lib/queries'
import { getEntityTypeColor } from '@/app/lib/theme'
import { useState, useEffect } from 'react'

interface ProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { userProfile, refetchProfile } = useAuth()
  const { theme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)

  // Entity 목록 조회
  const { data: entities = [] } = useEntities(userProfile?.id)

  // 프로필 업데이트 mutation
  const updateProfile = useUpdateProfile(userProfile?.id || '')

  // 현재 연결된 entity 초기화
  useEffect(() => {
    if (userProfile?.profile?.my_entity_id) {
      setSelectedEntityId(userProfile.profile.my_entity_id)
    } else {
      setSelectedEntityId(null)
    }
  }, [userProfile?.profile?.my_entity_id])

  // Entity 연결/해제 핸들러
  const handleEntityLink = async () => {
    if (!userProfile?.id) return

    await updateProfile.mutateAsync({
      my_entity_id: selectedEntityId,
    })

    // 프로필 새로고침
    await refetchProfile()
  }

  // 사용자 이름
  const getDisplayName = () => {
    if (userProfile?.profile?.username) {
      return userProfile.profile.username
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0]
    }
    return 'User'
  }

  // 사용자 이름 첫 글자 (아바타용)
  const getInitials = () => {
    if (userProfile?.profile?.username) {
      return userProfile.profile.username.charAt(0).toUpperCase()
    }
    if (userProfile?.email) {
      return userProfile.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // 가입일 포맷팅
  const getJoinDate = () => {
    if (userProfile?.created_at) {
      return new Date(userProfile.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
    return 'N/A'
  }

  const footer = (
    <div className="flex items-center justify-between p-4">
      <button
        onClick={() => setIsEditing(!isEditing)}
        className={`px-4 py-2 ${theme.ui.textPrimary} ${theme.ui.cardBg} ${theme.ui.buttonHover} transition-colors rounded-lg`}
      >
        {isEditing ? '취소' : '편집'}
      </button>
      <button
        onClick={onClose}
        className={`px-4 py-2 ${theme.ui.textPrimary} ${theme.ui.interactive.primaryBg} ${theme.ui.interactive.primaryBgHover} transition-colors rounded-lg`}
      >
        닫기
      </button>
    </div>
  )

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="내 프로필"
      footer={footer}
    >
      <div className="p-4 space-y-6">
        {/* 프로필 헤더 */}
        <section>
          <div className="flex flex-col items-center gap-4 py-6">
            {/* 아바타 */}
            <div className="relative">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center ${theme.ui.textPrimary} text-3xl font-semibold`}
                style={{ backgroundColor: theme.ui.iconColors.orange }}
              >
                {userProfile?.profile?.avatar_url ? (
                  <img
                    src={userProfile.profile.avatar_url}
                    alt={getDisplayName()}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials()
                )}
              </div>
              {isEditing && (
                <button
                  className={`absolute bottom-0 right-0 p-2 rounded-full transition-colors`}
                  style={{
                    backgroundColor: theme.ui.interactive.primary,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = theme.ui.gray[600]
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = theme.ui.interactive.primary
                  }}
                >
                  <Camera className={`w-4 h-4 ${theme.ui.textPrimary}`} />
                </button>
              )}
            </div>

            {/* 이름 */}
            <div className="text-center">
              <h2 className={`text-2xl font-semibold ${theme.ui.textPrimary}`}>{getDisplayName()}</h2>
              <p className={`text-sm ${theme.ui.textMuted} mt-1`}>{userProfile?.email}</p>
            </div>
          </div>
        </section>

        {/* 기본 정보 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5" style={{ color: theme.ui.iconColors.blue }} />
            <h3 className={`text-base font-semibold ${theme.ui.textPrimary}`}>기본 정보</h3>
          </div>
          <div className={`${theme.ui.cardBg} rounded-lg p-4 space-y-4`}>
            {/* 사용자 이름 */}
            <div>
              <label className={`text-sm ${theme.ui.textMuted} mb-2 block`}>사용자 이름</label>
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={userProfile?.profile?.username || ''}
                  className={`w-full px-3 py-2 ${theme.ui.secondaryBg} ${theme.ui.textPrimary} ${theme.ui.border} rounded-lg focus:outline-none`}
                  style={{
                    borderColor: theme.ui.gray[500],
                  }}
                  placeholder="이름을 입력하세요"
                />
              ) : (
                <p className={theme.ui.textPrimary}>{userProfile?.profile?.username || '설정되지 않음'}</p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label className={`text-sm ${theme.ui.textMuted} mb-2 block`}>이메일</label>
              <div className="flex items-center gap-2">
                <Mail className={`w-4 h-4 ${theme.ui.textMuted}`} />
                <p className={theme.ui.textPrimary}>{userProfile?.email}</p>
              </div>
            </div>

            {/* 가입일 */}
            <div>
              <label className={`text-sm ${theme.ui.textMuted} mb-2 block`}>가입일</label>
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${theme.ui.textMuted}`} />
                <p className={theme.ui.textPrimary}>{getJoinDate()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 자기 소개 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5" style={{ color: theme.ui.iconColors.green }} />
            <h3 className={`text-base font-semibold ${theme.ui.textPrimary}`}>자기 소개</h3>
          </div>
          <div className={`${theme.ui.cardBg} rounded-lg p-4`}>
            {isEditing ? (
              <textarea
                defaultValue={''}
                className={`w-full px-3 py-2 ${theme.ui.secondaryBg} ${theme.ui.textPrimary} ${theme.ui.border} rounded-lg focus:outline-none resize-none`}
                style={{
                  borderColor: theme.ui.gray[500],
                }}
                rows={4}
                placeholder="자기 소개를 입력하세요"
              />
            ) : (
              <p className={`${theme.ui.textPrimary} whitespace-pre-wrap`}>
                자기 소개를 추가해보세요.
              </p>
            )}
          </div>
        </section>

        {/* Entity 연결 정보 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5" style={{ color: theme.ui.iconColors.purple }} />
            <h3 className={`text-base font-semibold ${theme.ui.textPrimary}`}>Entity 연결</h3>
          </div>
          <div className={`${theme.ui.cardBg} rounded-lg p-4 space-y-4`}>
            <div>
              <p className={`text-sm ${theme.ui.textMuted} mb-3`}>
                자신을 나타내는 Entity를 선택하세요. 향후 이 Entity와 관련된 레코드를 자동으로 추적할 수 있습니다.
              </p>

              {/* Entity 선택 */}
              <div className="space-y-2">
                <label className={`text-sm ${theme.ui.textMuted} block`}>내 Entity</label>
                <select
                  value={selectedEntityId || ''}
                  onChange={(e) => setSelectedEntityId(e.target.value || null)}
                  className={`w-full px-3 py-2 ${theme.ui.secondaryBg} ${theme.ui.textPrimary} ${theme.ui.border} rounded-lg focus:outline-none`}
                  style={{
                    borderColor: theme.ui.gray[500],
                  }}
                >
                  <option value="">연결 안 함</option>
                  {entities.map((entity) => {
                    const color = getEntityTypeColor(entity.type || 'unknown', theme)
                    return (
                      <option key={entity.id} value={entity.id}>
                        {entity.name} ({entity.type || 'Unknown'})
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* 현재 선택된 Entity 정보 */}
              {selectedEntityId && entities.find(e => e.id === selectedEntityId) && (
                <div className={`mt-3 p-3 ${theme.ui.secondaryBg} rounded-lg`}>
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" style={{
                      color: getEntityTypeColor(
                        entities.find(e => e.id === selectedEntityId)?.type || 'unknown',
                        theme
                      ).hex
                    }} />
                    <span className={`text-sm ${theme.ui.textPrimary}`}>
                      {entities.find(e => e.id === selectedEntityId)?.name}
                    </span>
                  </div>
                  {entities.find(e => e.id === selectedEntityId)?.description && (
                    <p className={`text-xs ${theme.ui.textMuted} mt-2`}>
                      {entities.find(e => e.id === selectedEntityId)?.description}
                    </p>
                  )}
                </div>
              )}

              {/* 저장 버튼 */}
              <button
                onClick={handleEntityLink}
                disabled={updateProfile.isPending || selectedEntityId === userProfile?.profile?.my_entity_id}
                className={`w-full mt-3 px-4 py-2 ${theme.ui.textPrimary} rounded-lg transition-colors ${
                  updateProfile.isPending || selectedEntityId === userProfile?.profile?.my_entity_id
                    ? `${theme.ui.secondaryBg} cursor-not-allowed opacity-50`
                    : `${theme.ui.interactive.primaryBg} ${theme.ui.interactive.primaryBgHover}`
                }`}
              >
                {updateProfile.isPending ? '저장 중...' : selectedEntityId ? 'Entity 연결' : 'Entity 연결 해제'}
              </button>
            </div>
          </div>
        </section>

        {/* 통계 - 목업 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5" style={{ color: theme.ui.iconColors.yellow }} />
            <h3 className={`text-base font-semibold ${theme.ui.textPrimary}`}>활동 통계</h3>
          </div>
          <div className={`${theme.ui.cardBg} rounded-lg p-4`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className={`text-2xl font-semibold ${theme.ui.textPrimary}`}>--</p>
                <p className={`text-xs ${theme.ui.textMuted} mt-1`}>작성한 메모</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-semibold ${theme.ui.textPrimary}`}>--</p>
                <p className={`text-xs ${theme.ui.textMuted} mt-1`}>생성한 Entity</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-semibold ${theme.ui.textPrimary}`}>--</p>
                <p className={`text-xs ${theme.ui.textMuted} mt-1`}>연결된 링크</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-semibold ${theme.ui.textPrimary}`}>--</p>
                <p className={`text-xs ${theme.ui.textMuted} mt-1`}>총 활동 일수</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </BaseDrawer>
  )
}
