import React from 'react'
import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header__bg-grid" />
      <div className="header__glow" />
      <div className="header__content">
        <div className="header__icon-wrap">
          <span className="header__icon">🤖</span>
        </div>
        <div className="header__text">
          <h1 className="header__title">
            AI Meeting Action
            <span className="header__title-accent"> Extractor</span>
          </h1>
          <p className="header__subtitle">
            Upload any meeting transcript — AI extracts tasks, owners & deadlines instantly
          </p>
        </div>
        <div className="header__tags">
          <span className="tag">Gemini  AI</span>
          <span className="tag"> NLP</span>
          <span className="tag">FastAPI</span>
        </div>
      </div>
    </header>
  )
}

export default Header
