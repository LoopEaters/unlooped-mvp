import Header from './components/Header'
import MainContainer from './components/MainContainer'
import RightSidebar from './components/RightSidebar'
import InputArea from './components/InputArea'

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <Header />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Main container with records */}
        <div className="flex-1 flex flex-col">
          <MainContainer />
          <InputArea />
        </div>

        {/* Right: Timeline sidebar */}
        <RightSidebar />
      </div>
    </div>
  )
}
