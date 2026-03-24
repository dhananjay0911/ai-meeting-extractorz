import React, { useState } from 'react'
import Header from './components/Header/Header'
import UploadSection from './components/UploadSection/UploadSection'
import Stats from './components/Stats/Stats'
import Dashboard from './components/Dashboard/Dashboard'
import Footer from './components/Footer/Footer'
import { extractTasks } from './api/meetingApi'
import './App.css'

const App = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleExtract = async (file) => {
    setLoading(true)
    setResult(null)
    setError('')

    try {
      const data = await extractTasks(file)
      setResult(data)
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="layout">
          {/* Left / Top: Upload */}
          <div className="layout__upload">
            <UploadSection onExtract={handleExtract} loading={loading} />

            {/* API error */}
            {error && (
              <div className="app-error animate-fade-up">
                <span>⚠️</span>
                <div>
                  <strong>Extraction Failed</strong>
                  <p>{error}</p>
                </div>
                <button onClick={() => setError('')}>✕</button>
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="app-loading animate-fade-up">
                <div className="app-loading__bar" />
                <div className="app-loading__steps">
                  <Step text="Parsing file..." done />
                  <Step text="Running NLP analysis..." done={false} active />
                  <Step text="Extracting tasks with Gemini AI..." done={false} />
                  <Step text="Building results..." done={false} />
                </div>
              </div>
            )}
          </div>

          {/* Right / Bottom: Results */}
          {result && !loading && (
            <div className="layout__results">
              <Stats
                tasks={result.tasks}
                filename={result.filename}
                fileType={result.file_type}
              />
              <Dashboard tasks={result.tasks} totalTasks={result.total_tasks} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

const Step = ({ text, done, active }) => (
  <div className={`loading-step ${done ? 'loading-step--done' : ''} ${active ? 'loading-step--active' : ''}`}>
    <span className="loading-step__dot" />
    <span className="loading-step__text">{text}</span>
  </div>
)

export default App
