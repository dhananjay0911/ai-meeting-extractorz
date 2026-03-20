import React, { useState, useMemo } from 'react'
import TaskCard from '../TaskCard/TaskCard'
import './Dashboard.css'

const PRIORITIES = ['all', 'high', 'medium', 'low']

const Dashboard = ({ tasks, totalTasks }) => {
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('id')

  const assignees = useMemo(() => {
    const names = [...new Set(tasks.map(t => t.assigned_to))]
    return ['all', ...names.sort()]
  }, [tasks])

  const filtered = useMemo(() => {
    let result = [...tasks]
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter)
    if (assigneeFilter !== 'all') result = result.filter(t => t.assigned_to === assigneeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.task.toLowerCase().includes(q) ||
        t.assigned_to.toLowerCase().includes(q) ||
        (t.deadline && t.deadline.toLowerCase().includes(q))
      )
    }
    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 }
      result.sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1))
    } else if (sortBy === 'assignee') {
      result.sort((a, b) => a.assigned_to.localeCompare(b.assigned_to))
    } else if (sortBy === 'deadline') {
      result.sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return a.deadline.localeCompare(b.deadline)
      })
    }
    return result
  }, [tasks, search, priorityFilter, assigneeFilter, sortBy])

  return (
    <div className="dashboard animate-fade-up">
      {/* Header */}
      <div className="dashboard__header">
        <div className="dashboard__title-row">
          <h2 className="dashboard__title">
            <span>📋</span>
            Extracted Tasks
            <span className="dashboard__count">{totalTasks}</span>
          </h2>
          <span className="dashboard__showing">
            Showing {filtered.length} of {tasks.length}
          </span>
        </div>

        {/* Controls */}
        <div className="dashboard__controls">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search tasks, assignees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Priority</label>
              <div className="filter-chips">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    className={`chip ${priorityFilter === p ? 'chip--active' : ''}`}
                    onClick={() => setPriorityFilter(p)}
                  >
                    {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Assignee</label>
              <select
                className="select-input"
                value={assigneeFilter}
                onChange={e => setAssigneeFilter(e.target.value)}
              >
                {assignees.map(a => (
                  <option key={a} value={a}>
                    {a === 'all' ? 'All Assignees' : a}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort by</label>
              <select
                className="select-input"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="id">Default</option>
                <option value="priority">Priority</option>
                <option value="assignee">Assignee</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      {filtered.length === 0 ? (
        <div className="dashboard__empty">
          <span>🔍</span>
          <p>No tasks match your filters.</p>
          <button onClick={() => { setSearch(''); setPriorityFilter('all'); setAssigneeFilter('all') }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="task-grid">
          {filtered.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
