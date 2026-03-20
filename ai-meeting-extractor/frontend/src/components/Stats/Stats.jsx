import React from 'react'
import './Stats.css'

const Stats = ({ tasks, filename, fileType }) => {
  const total = tasks.length
  const high = tasks.filter(t => t.priority === 'high').length
  const withDeadline = tasks.filter(t => t.deadline).length
  const uniquePeople = [...new Set(tasks.map(t => t.assigned_to))].length
  const avgConfidence = total
    ? Math.round(tasks.reduce((sum, t) => sum + (t.confidence || 0), 0) / total)
    : 0

  const stats = [
    { label: 'Total Tasks', value: total, icon: '✅', color: '#6c63ff' },
    { label: 'Assignees', value: uniquePeople, icon: '👥', color: '#a78bfa' },
    { label: 'Has Deadline', value: withDeadline, icon: '📅', color: '#ffd93d' },
    { label: 'High Priority', value: high, icon: '🔴', color: '#ff6b6b' },
    { label: 'Avg Confidence', value: avgConfidence + '%', icon: '🎯', color: '#6bcb77' },
  ]

  return (
    <div className="stats animate-fade-up">
      <div className="stats__meta">
        <span className="stats__file">
          <span className="stats__file-icon">📁</span>
          {filename}
        </span>
        <span className="stats__badge">{fileType}</span>
      </div>
      <div className="stats__grid">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="stat-card__icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Stats
