class AdminManager {
  constructor() {
    this.tasks = [];
    this.currentPage = 1;
    this.editingTask = null;
  }

  async loadTasks(page = 1) {
    try {
      const container = document.getElementById("tasks-container");
      if (container) {
        container.innerHTML = `
          <div class="text-center text-white/60 py-8">
            <i class="fas fa-spinner fa-spin text-2xl"></i>
            <p class="mt-2">Loading tasks...</p>
          </div>
        `;
      }

      const response = await api.getTasks(page);
      this.tasks = response.data || response.data.data || [];
      this.currentPage = page;

      this.renderTasks();
    } catch (error) {
      console.error("Failed to load tasks:", error);
      showToast("Failed to load tasks", "error");

      if (container) {
        container.innerHTML = `
          <div class="text-center text-white/60 py-8">
            <i class="fas fa-exclamation-triangle text-2xl"></i>
            <p class="mt-2">Failed to load tasks</p>
            <button onclick="adminManager.loadTasks()" 
                    class="mt-2 bg-white/20 text-white px-4 py-2 rounded hover:bg-white/30 transition">
              Retry
            </button>
          </div>
        `;
      }
    }
  }

  renderTasks() {
    const container = document.getElementById("tasks-container");
    if (!container) return;

    if (this.tasks.length === 0) {
      container.innerHTML = `
        <div class="text-center text-white/60 py-8">
          <i class="fas fa-tasks text-2xl"></i>
          <p class="mt-2">No tasks found</p>
          <p class="text-sm">Create your first task above!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.tasks
      .map((task) => this.renderTaskCard(task))
      .join("");
  }

  renderTaskCard(task) {
    const createdAt = new Date(task.created_at).toLocaleDateString();
    const updatedAt = new Date(task.updated_at).toLocaleDateString();

    return `
      <div class="bg-white/10 border border-white/20 rounded-lg p-6 hover:bg-white/20 transition card-hover">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h4 class="text-lg font-semibold text-white mb-2">
              <i class="fas fa-clipboard-list mr-2"></i>${escapeHtml(
                task.title
              )}
            </h4>
            <p class="text-white/80 mb-3">${escapeHtml(task.description)}</p>
            <div class="flex items-center space-x-4 text-sm text-white/60">
              <span>
                <i class="fas fa-calendar-plus mr-1"></i>Created: ${createdAt}
              </span>
              <span>
                <i class="fas fa-calendar-edit mr-1"></i>Updated: ${updatedAt}
              </span>
              <span class="bg-blue-500/20 text-blue-200 px-2 py-1 rounded">
                <i class="fas fa-list mr-1"></i>${task.lists_count || 0} lists
              </span>
            </div>
          </div>
          <div class="flex space-x-2 ml-4">
            <button onclick="authManager.editTask(${task.id}, '${escapeHtml(
      task.title
    )}', '${escapeHtml(task.description)}')" 
                    class="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="authManager.deleteTask(${task.id}, '${escapeHtml(
      task.title
    )}')" 
                    class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // delete method for onclick handlers
  async deleteTask(id) {
    // Delegate to AuthManager
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      return authManager.deleteTask(id, task.title);
    }
  }

  // edit method for onclick handlers
  editTask(id) {
    // Delegate to AuthManager
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      return authManager.editTask(id, task.title, task.description);
    }
  }
}

// Utility function for HTML escaping
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

const adminManager = new AdminManager();
