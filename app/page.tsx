import Header from './components/common/Header'
import MainContainer from './components/home/MainContainer'
import RightSidebar from './components/home/RightSidebar'
import InputArea from './components/home/InputArea'

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-bg-primary">
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
