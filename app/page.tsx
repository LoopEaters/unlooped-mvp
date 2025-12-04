import { Suspense } from 'react'
import Header from './components/common/Header'
import MainContainer from './components/home/MainContainer'
import RightSidebar from './components/home/RightSidebar'
import InputArea from './components/home/InputArea'
import SearchParamsHandler from './components/home/SearchParamsHandler'

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* URL 파라미터 처리 (Suspense로 감싸기) */}
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>

      {/* Header */}
      <Header />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Main container with records */}
        <div className="flex-1 flex flex-col min-w-0">
          <MainContainer />
          <InputArea />
        </div>

        {/* Right: Timeline sidebar */}
        <RightSidebar />
      </div>
    </div>
  )
}
