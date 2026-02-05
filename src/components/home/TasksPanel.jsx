/**
 * Tasks Panel Component
 * Displays and manages daily objectives/tasks
 */
export default function TasksPanel({
  filteredTasks,
  taskFilter,
  setTaskFilter,
  taskSort,
  setTaskSort,
  progressPercentage,
  showTaskInput,
  setShowTaskInput,
  newTask,
  setNewTask,
  newTaskTimeEstimate,
  setNewTaskTimeEstimate,
  editingTaskId,
  editingTaskTitle,
  setEditingTaskTitle,
  editingTaskDueDate,
  setEditingTaskDueDate,
  editingTaskTimeEstimate,
  setEditingTaskTimeEstimate,
  editingTaskTimeSpent,
  setEditingTaskTimeSpent,
  onAddTask,
  onToggleTask,
  onEditTask,
  onUpdateTask,
  onDeleteTask,
  onCancelEditTask
}) {
  return (
    <div 
      className="rounded-lg p-6 border transition-colors"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium uppercase tracking-wide transition-colors" style={{ color: 'var(--text-primary)' }}>
          Daily Objectives
        </h2>
        <span className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
          {progressPercentage}%
        </span>
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center gap-2 mb-4">
        <select
          value={taskFilter}
          onChange={(e) => setTaskFilter(e.target.value)}
          className="text-xs px-2 py-1 border rounded transition-colors focus:outline-none"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          value={taskSort}
          onChange={(e) => setTaskSort(e.target.value)}
          className="text-xs px-2 py-1 border rounded transition-colors focus:outline-none"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="due-date">Due Date</option>
          <option value="created">Created</option>
        </select>
      </div>
      
      <div className="space-y-3 mb-4">
        {filteredTasks.length === 0 ? (
          <p className="text-sm text-center py-4 transition-colors" style={{ color: 'var(--text-muted)' }}>
            {taskFilter === 'all' ? 'No objectives yet' : `No ${taskFilter} objectives`}
          </p>
        ) : (
          filteredTasks.map((task) => {
            const timeSpent = task.time_spent ? Math.round(task.time_spent / 60) : 0;
            const timeEstimate = task.time_estimate ? Math.round(task.time_estimate / 60) : null;
            const isCompleted = task.status === 'completed' || task.status === 'done';
            
            return editingTaskId === task.id ? (
              <div key={task.id} className="p-3 rounded border space-y-2 transition-colors" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <input
                  type="text"
                  value={editingTaskTitle}
                  onChange={(e) => setEditingTaskTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full px-3 py-2 border rounded text-sm transition-colors focus:outline-none"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={editingTaskDueDate}
                    onChange={(e) => setEditingTaskDueDate(e.target.value)}
                    className="px-3 py-2 border rounded text-sm transition-colors focus:outline-none"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input
                    type="number"
                    value={editingTaskTimeEstimate}
                    onChange={(e) => setEditingTaskTimeEstimate(e.target.value)}
                    placeholder="Est. (hours)"
                    min="0"
                    step="0.5"
                    className="px-3 py-2 border rounded text-sm transition-colors focus:outline-none"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <input
                  type="number"
                  value={editingTaskTimeSpent}
                  onChange={(e) => setEditingTaskTimeSpent(e.target.value)}
                  placeholder="Time spent (hours)"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border rounded text-sm transition-colors focus:outline-none"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={onUpdateTask}
                    className="px-3 py-1.5 text-xs rounded transition-colors"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--bg-base)'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={onCancelEditTask}
                    className="px-3 py-1.5 text-xs transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={task.id} className="group flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => onToggleTask(task.id, e.target.checked)}
                  className="w-4 h-4 rounded transition-colors"
                  style={{ borderColor: 'var(--border-subtle)' }}
                />
                <span className={`flex-1 text-sm transition-colors ${isCompleted ? 'line-through' : ''}`} style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {task.title}
                </span>
                {timeEstimate && (
                  <span className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
                    {timeSpent}h / {timeEstimate}h
                  </span>
                )}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    title="Edit task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 transition-colors text-red-600"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showTaskInput ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newTask.trim()) {
              onAddTask(newTask, newTaskTimeEstimate || null);
            }
          }}
          className="space-y-2"
        >
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Type an objective..."
            className="w-full px-3 py-2 border-b transition-colors focus:outline-none text-sm"
            style={{
              borderColor: 'var(--border-mid)',
              color: 'var(--text-primary)'
            }}
            autoFocus
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newTaskTimeEstimate}
              onChange={(e) => setNewTaskTimeEstimate(e.target.value)}
              placeholder="Time (hours)"
              min="0"
              step="0.5"
              className="w-24 px-3 py-2 border-b transition-colors focus:outline-none text-sm"
              style={{
                borderColor: 'var(--border-mid)',
                color: 'var(--text-primary)'
              }}
            />
            <span className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>hours</span>
            <div className="flex-1"></div>
            <button
              type="button"
              onClick={() => {
                setShowTaskInput(false);
                setNewTask('');
                setNewTaskTimeEstimate('');
              }}
              className="text-xs px-2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs px-3 py-1.5 rounded transition-colors"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-base)'
              }}
            >
              Add
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowTaskInput(true)}
          className="text-sm transition-colors flex items-center gap-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>+</span>
          <span>ADD OBJECTIVE</span>
        </button>
      )}
    </div>
  );
}
