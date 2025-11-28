'use client'

import { useState } from 'react'
import { Bold, Italic, List } from 'lucide-react'

export default function InputArea() {
  const [content, setContent] = useState('')

  const handleSave = () => {
    // Will be implemented with React Query mutation
    console.log('Save record:', content)
  }

  return (
    <div className="border-t border-border-main p-4 bg-bg-primary">
      <div className="bg-bg-card rounded-lg p-4">
        {/* Text input area with @mention support */}
        <div
          contentEditable
          className="min-h-[80px] text-white outline-none mb-3 relative"
          onInput={(e) => setContent(e.currentTarget.textContent || '')}
          data-placeholder="Start typing... Use @ to mention entities"
        />

        {/* Toolbar and Save button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Bold */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-bg-secondary">
              <Bold className="w-4 h-4" />
            </button>
            {/* Italic */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-bg-secondary">
              <Italic className="w-4 h-4" />
            </button>
            {/* List */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-bg-secondary">
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  )
}
