// Scheduled Todo List Application - JavaScript
// Advanced todo list with time scheduling and filtering capabilities

class ScheduledTodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.taskIdCounter = 1;
        this.initialized = false;
        
        // DOM elements
        this.elements = {};
        
        // Initialize the application
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        if (this.initialized) return;
        this.initialized = true;
        
        console.log('Scheduled Todo List initialized!');
        
        // Get DOM elements
        this.cacheElements();
        
        // Verify critical elements are found
        if (!this.elements.taskInput || !this.elements.addTaskBtn) {
            console.error('Critical elements not found');
            return;
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize UI
        this.updateUI();
        this.updateStats();
        this.showEmptyState();
        
        // Set default date to today
        this.setDefaultDate();
    }

    cacheElements() {
        this.elements = {
            // Input elements
            taskInput: document.getElementById('taskInput'),
            dueDateInput: document.getElementById('dueDateInput'),
            dueTimeInput: document.getElementById('dueTimeInput'),
            addTaskBtn: document.getElementById('addTaskBtn'),
            clearDateTimeBtn: document.getElementById('clearDateTimeBtn'),
            
            // Filter elements
            filterBtns: document.querySelectorAll('.filter-btn'),
            clearCompletedBtn: document.getElementById('clearCompletedBtn'),
            
            // Task list
            tasksList: document.getElementById('tasksList'),
            emptyState: document.getElementById('emptyState'),
            
            // Statistics
            totalCount: document.getElementById('totalCount'),
            activeCount: document.getElementById('activeCount'),
            completedCount: document.getElementById('completedCount'),
            overdueCount: document.getElementById('overdueCount'),
            todayCount: document.getElementById('todayCount'),
            
            // Modal elements
            editModal: document.getElementById('editModal'),
            editTaskText: document.getElementById('editTaskText'),
            editDueDate: document.getElementById('editDueDate'),
            editDueTime: document.getElementById('editDueTime'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            cancelEditBtn: document.getElementById('cancelEditBtn'),
            saveEditBtn: document.getElementById('saveEditBtn')
        };

        console.log('Elements cached successfully');
    }

    setupEventListeners() {
        // Prevent multiple event listener attachments
        if (this.elements.addTaskBtn.hasAttribute('data-listeners-added')) {
            return;
        }

        // Add task with proper event handling
        this.elements.addTaskBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.addTask();
        });
        this.elements.addTaskBtn.setAttribute('data-listeners-added', 'true');
        
        // Enter key in task input
        this.elements.taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                this.addTask();
            }
        });
        
        // Clear date/time
        if (this.elements.clearDateTimeBtn) {
            this.elements.clearDateTimeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearDateTime();
            });
        }
        
        // Filter buttons
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Clear completed tasks
        if (this.elements.clearCompletedBtn) {
            this.elements.clearCompletedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearCompleted();
            });
        }
        
        // Modal events
        if (this.elements.closeModalBtn) {
            this.elements.closeModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeEditModal();
            });
        }
        
        if (this.elements.cancelEditBtn) {
            this.elements.cancelEditBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeEditModal();
            });
        }
        
        if (this.elements.saveEditBtn) {
            this.elements.saveEditBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveEdit();
            });
        }
        
        // Close modal on backdrop click
        if (this.elements.editModal) {
            this.elements.editModal.addEventListener('click', (e) => {
                if (e.target === this.elements.editModal) {
                    this.closeEditModal();
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        console.log('Event listeners set up successfully');
    }

    setDefaultDate() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        if (this.elements.dueDateInput) {
            this.elements.dueDateInput.setAttribute('min', today);
        }
        if (this.elements.editDueDate) {
            this.elements.editDueDate.setAttribute('min', today);
        }
    }

    addTask() {
        console.log('addTask method called');
        
        if (!this.elements.taskInput) {
            console.error('Task input element not found');
            return;
        }

        const text = this.elements.taskInput.value.trim();
        console.log('Input text:', text);
        
        if (!text) {
            console.log('No text entered, focusing input');
            this.elements.taskInput.focus();
            return;
        }

        const dueDate = this.elements.dueDateInput ? this.elements.dueDateInput.value || null : null;
        const dueTime = this.elements.dueTimeInput ? this.elements.dueTimeInput.value || null : null;

        const task = {
            id: this.taskIdCounter++,
            text: text,
            completed: false,
            dueDate: dueDate,
            dueTime: dueTime,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(task);
        console.log('Task added:', task);
        console.log('Total tasks now:', this.tasks.length);
        
        // Clear inputs
        this.elements.taskInput.value = '';
        if (this.elements.dueDateInput) this.elements.dueDateInput.value = '';
        if (this.elements.dueTimeInput) this.elements.dueTimeInput.value = '';
        
        // Update UI
        this.updateUI();
        this.updateStats();
        
        // Focus back to input
        setTimeout(() => {
            this.elements.taskInput.focus();
        }, 100);

        console.log('Task addition completed successfully');
    }

    toggleTask(taskId) {
        console.log('Toggle task:', taskId);
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;

        // Add completion animation
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('completing');
            setTimeout(() => taskElement.classList.remove('completing'), 250);
        }

        this.updateUI();
        this.updateStats();

        console.log('Task toggled successfully:', task);
    }

    deleteTask(taskId) {
        console.log('Delete task:', taskId);
        const originalLength = this.tasks.length;
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        
        if (this.tasks.length < originalLength) {
            console.log('Task deleted successfully');
            this.updateUI();
            this.updateStats();
        } else {
            console.error('Task not found for deletion:', taskId);
        }
    }

    editTask(taskId) {
        console.log('Edit task:', taskId);
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            console.error('Task not found for editing:', taskId);
            return;
        }

        this.editingTaskId = taskId;
        
        // Populate modal
        if (this.elements.editTaskText) this.elements.editTaskText.value = task.text;
        if (this.elements.editDueDate) this.elements.editDueDate.value = task.dueDate || '';
        if (this.elements.editDueTime) this.elements.editDueTime.value = task.dueTime || '';
        
        // Show modal
        if (this.elements.editModal) {
            this.elements.editModal.classList.remove('hidden');
            if (this.elements.editTaskText) {
                setTimeout(() => {
                    this.elements.editTaskText.focus();
                    this.elements.editTaskText.select();
                }, 100);
            }
        }
    }

    saveEdit() {
        if (!this.editingTaskId) return;

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (!task) return;

        const newText = this.elements.editTaskText ? this.elements.editTaskText.value.trim() : '';
        if (!newText) {
            if (this.elements.editTaskText) this.elements.editTaskText.focus();
            return;
        }

        task.text = newText;
        task.dueDate = this.elements.editDueDate ? this.elements.editDueDate.value || null : null;
        task.dueTime = this.elements.editDueTime ? this.elements.editDueTime.value || null : null;

        this.closeEditModal();
        this.updateUI();
        this.updateStats();

        console.log('Task edited successfully:', task);
    }

    closeEditModal() {
        if (this.elements.editModal) {
            this.elements.editModal.classList.add('hidden');
        }
        this.editingTaskId = null;
    }

    clearDateTime() {
        if (this.elements.dueDateInput) this.elements.dueDateInput.value = '';
        if (this.elements.dueTimeInput) this.elements.dueTimeInput.value = '';
        if (this.elements.taskInput) this.elements.taskInput.focus();
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) return;

        if (confirm(`Are you sure you want to delete ${completedCount} completed task${completedCount !== 1 ? 's' : ''}?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.updateUI();
            this.updateStats();
            console.log('Completed tasks cleared');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        console.log('Setting filter to:', filter);
        
        // Update filter buttons
        this.elements.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.updateUI();
    }

    getFilteredTasks() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        return this.tasks.filter(task => {
            switch (this.currentFilter) {
                case 'active':
                    return !task.completed;
                
                case 'completed':
                    return task.completed;
                
                case 'overdue':
                    if (!task.dueDate || task.completed) return false;
                    const dueDateTime = this.getTaskDueDateTime(task);
                    return dueDateTime < now;
                
                case 'today':
                    if (!task.dueDate) return false;
                    const taskDate = new Date(task.dueDate);
                    return taskDate.toDateString() === today.toDateString();
                
                case 'thisweek':
                    if (!task.dueDate) return false;
                    const taskDueDate = new Date(task.dueDate);
                    return taskDueDate >= today && taskDueDate < nextWeek;
                
                case 'all':
                default:
                    return true;
            }
        });
    }

    getTaskDueDateTime(task) {
        if (!task.dueDate) return null;
        
        const dateStr = task.dueTime ? 
            `${task.dueDate}T${task.dueTime}:00` : 
            `${task.dueDate}T23:59:59`;
        
        return new Date(dateStr);
    }

    getTaskPriority(task) {
        if (!task.dueDate || task.completed) return 'nodate';
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const dueDateTime = this.getTaskDueDateTime(task);
        
        if (dueDateTime < now) return 'overdue';
        if (dueDateTime <= today) return 'today';
        if (dueDateTime <= tomorrow) return 'tomorrow';
        if (dueDateTime <= nextWeek) return 'thisweek';
        return 'future';
    }

    getPriorityLabel(priority) {
        const labels = {
            overdue: 'Overdue',
            today: 'Due Today',
            tomorrow: 'Due Tomorrow',
            thisweek: 'Due This Week',
            future: 'Future',
            nodate: 'No Due Date'
        };
        return labels[priority] || labels.nodate;
    }

    formatTaskDateTime(task) {
        if (!task.dueDate) return '';
        
        const date = new Date(task.dueDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let dateStr = '';
        
        if (date.toDateString() === today.toDateString()) {
            dateStr = 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            dateStr = 'Tomorrow';
        } else {
            dateStr = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
        
        if (task.dueTime) {
            const timeStr = new Date(`1970-01-01T${task.dueTime}:00`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            return `${dateStr} at ${timeStr}`;
        }
        
        return dateStr;
    }

    renderTask(task) {
        const priority = this.getTaskPriority(task);
        const priorityLabel = this.getPriorityLabel(priority);
        const dateTimeStr = this.formatTaskDateTime(task);
        
        return `
            <div class="task-item priority-${priority} ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    data-task-id="${task.id}"
                >
                <div class="task-content" data-task-id="${task.id}" tabindex="0" role="button" aria-label="Edit task">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    ${dateTimeStr ? `
                        <div class="task-datetime">
                            <span class="priority-badge ${priority}">${priorityLabel}</span>
                            <span>📅 ${dateTimeStr}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions">
                    <button 
                        class="task-action-btn edit" 
                        data-task-id="${task.id}"
                        data-action="edit"
                        title="Edit task"
                        aria-label="Edit task"
                    >✏️</button>
                    <button 
                        class="task-action-btn delete" 
                        data-task-id="${task.id}"
                        data-action="delete"
                        title="Delete task"
                        aria-label="Delete task"
                    >🗑️</button>
                </div>
            </div>
        `;
    }

    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            // Completed tasks go to bottom
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Sort by due date/time
            const aDue = this.getTaskDueDateTime(a);
            const bDue = this.getTaskDueDateTime(b);
            
            // Tasks with no due date go to bottom
            if (!aDue && !bDue) return new Date(b.createdAt) - new Date(a.createdAt);
            if (!aDue) return 1;
            if (!bDue) return -1;
            
            // Sort by due date/time
            return aDue - bDue;
        });
    }

    updateUI() {
        console.log('Updating UI, total tasks:', this.tasks.length);
        
        if (!this.elements.tasksList) {
            console.error('Tasks list element not found');
            return;
        }
        
        const filteredTasks = this.getFilteredTasks();
        const sortedTasks = this.sortTasks([...filteredTasks]);
        
        console.log('Filtered tasks:', filteredTasks.length, 'Current filter:', this.currentFilter);
        
        if (sortedTasks.length === 0) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
            this.elements.tasksList.innerHTML = sortedTasks.map(task => this.renderTask(task)).join('');
            this.attachTaskEventListeners();
        }
        
        // Update clear completed button
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (this.elements.clearCompletedBtn) {
            this.elements.clearCompletedBtn.disabled = completedCount === 0;
            this.elements.clearCompletedBtn.textContent = completedCount > 0 ? 
                `Clear Completed (${completedCount})` : 'Clear Completed';
        }
    }

    attachTaskEventListeners() {
        // Attach event listeners to task elements
        const taskItems = this.elements.tasksList.querySelectorAll('.task-item');
        
        taskItems.forEach(taskItem => {
            const taskId = parseInt(taskItem.getAttribute('data-task-id'));
            
            // Checkbox toggle
            const checkbox = taskItem.querySelector('.task-checkbox');
            if (checkbox && !checkbox.hasAttribute('data-listener-added')) {
                checkbox.addEventListener('change', () => this.toggleTask(taskId));
                checkbox.setAttribute('data-listener-added', 'true');
            }
            
            // Task content click for editing
            const taskContent = taskItem.querySelector('.task-content');
            if (taskContent && !taskContent.hasAttribute('data-listener-added')) {
                taskContent.addEventListener('click', () => this.editTask(taskId));
                taskContent.setAttribute('data-listener-added', 'true');
            }
            
            // Action buttons
            const editBtn = taskItem.querySelector('[data-action="edit"]');
            const deleteBtn = taskItem.querySelector('[data-action="delete"]');
            
            if (editBtn && !editBtn.hasAttribute('data-listener-added')) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editTask(taskId);
                });
                editBtn.setAttribute('data-listener-added', 'true');
            }
            
            if (deleteBtn && !deleteBtn.hasAttribute('data-listener-added')) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteTask(taskId);
                });
                deleteBtn.setAttribute('data-listener-added', 'true');
            }
        });
    }

    showEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.classList.remove('hidden');
        }
        
        // Update empty state message based on filter
        const messages = {
            all: 'No tasks yet',
            active: 'No active tasks',
            completed: 'No completed tasks',
            overdue: 'No overdue tasks',
            today: 'No tasks due today',
            thisweek: 'No tasks due this week'
        };
        
        const descriptions = {
            all: 'Add your first task above to get started with scheduling!',
            active: 'All your tasks are completed! 🎉',
            completed: 'Complete some tasks to see them here.',
            overdue: 'Great! You\'re on top of your schedule.',
            today: 'No tasks are due today. Take a break! ☀️',
            thisweek: 'Your week looks clear so far.'
        };
        
        if (this.elements.emptyState) {
            const emptyTitle = this.elements.emptyState.querySelector('h3');
            const emptyDesc = this.elements.emptyState.querySelector('p');
            
            if (emptyTitle) emptyTitle.textContent = messages[this.currentFilter] || messages.all;
            if (emptyDesc) emptyDesc.textContent = descriptions[this.currentFilter] || descriptions.all;
        }
    }

    hideEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.classList.add('hidden');
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const active = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const overdue = this.tasks.filter(t => {
            if (!t.dueDate || t.completed) return false;
            const dueDateTime = this.getTaskDueDateTime(t);
            return dueDateTime < now;
        }).length;
        
        const todayTasks = this.tasks.filter(t => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate);
            return taskDate.toDateString() === today.toDateString();
        }).length;
        
        // Update statistics with animation
        this.animateNumber(this.elements.totalCount, total);
        this.animateNumber(this.elements.activeCount, active);
        this.animateNumber(this.elements.completedCount, completed);
        this.animateNumber(this.elements.overdueCount, overdue);
        this.animateNumber(this.elements.todayCount, todayTasks);
        
        console.log('Stats updated:', { total, active, completed, overdue, todayTasks });
    }

    animateNumber(element, newValue) {
        if (!element) return;
        
        const currentValue = parseInt(element.textContent) || 0;
        if (currentValue === newValue) return;
        
        element.style.transform = 'scale(1.1)';
        element.textContent = newValue;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }

    handleKeyboard(event) {
        // Global keyboard shortcuts
        if (event.key === 'Escape') {
            if (this.elements.editModal && !this.elements.editModal.classList.contains('hidden')) {
                event.preventDefault();
                this.closeEditModal();
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
let todoApp = null;

function initializeTodoApp() {
    if (todoApp) return; // Prevent multiple initializations
    
    console.log('Initializing Scheduled Todo List...');
    todoApp = new ScheduledTodoApp();
    
    // Expose to global scope
    window.todoApp = todoApp;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTodoApp);
} else {
    initializeTodoApp();
}

console.log('Scheduled Todo List script loaded successfully!');