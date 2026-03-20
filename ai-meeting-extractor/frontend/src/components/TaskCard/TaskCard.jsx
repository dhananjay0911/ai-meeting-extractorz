import React, { useState } from 'react'
import './TaskCard.css'

const PRIORITY_CONFIG = {
  high: { label: 'High', color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', icon: '🔴' },
  medium: { label: 'Medium', color: '#ffd93d', bg: 'rgba(255,217,61,0.1)', icon: '🟡' },
  low: { label: 'Low', color: '#6bcb77', bg: 'rgba(107,203,119,0.1)', icon: '🟢' },
}

const AVATAR_COLORS = [
  '#6c63ff', '#ff6b6b', '#ffd93d', '#6bcb77',
  '#a78bfa', '#f472b6', '#60a5fa', '#34d399'
]

const getAvatarColor = (name) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const TaskCard = ({ task, index }) => {
  const [expanded, setExpanded] = useState(false)
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const avatarColor = getAvatarColor(task.assigned_to)

  return (
    <div
      className="task-card"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Top bar: assignee + confidence */}
      <div className="task-card__top">
        <div className="task-card__assignee">
          <div
            className="task-card__avatar"
            style={{ background: avatarColor + '22', color: avatarColor, borderColor: avatarColor + '44' }}
          >
            {getInitials(task.assigned_to)}
          </div>
          <span className="task-card__name">{task.assigned_to}</span>
        </div>
        <div className="task-card__confidence">
          <span className="task-card__conf-value">{task.confidence}%</span>
          <div
            className="task-card__conf-bar"
            style={{ '--conf': task.confidence + '%', '--conf-color': avatarColor }}
          />
        </div>
      </div>

      {/* Task description */}
      <p className="task-card__task">{task.task}</p>

      {/* Metadata row */}
      <div className="task-card__meta">
        {task.deadline && (
          <div className="task-card__pill task-card__pill--deadline">
            <span>📅</span>
            <span>{task.deadline}</span>
          </div>
        )}
        <div
          className="task-card__pill task-card__pill--priority"
          style={{ color: priority.color, background: priority.bg, borderColor: priority.color + '33' }}
        >
          <span>{priority.icon}</span>
          <span>{priority.label}</span>
        </div>
        <div className="task-card__id">#{task.id}</div>
      </div>

      {/* Expandable raw text */}
      {task.raw_text && (
        <div className="task-card__raw-wrap">
          <button
            className="task-card__raw-toggle"
            onClick={() => setExpanded(!expanded)}
          >
            <span>{expanded ? '▲' : '▼'}</span>
            <span>Source quote</span>
          </button>
          {expanded && (
            <blockquote className="task-card__raw">
              "{task.raw_text}"
            </blockquote>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskCard
