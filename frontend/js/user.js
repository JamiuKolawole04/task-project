class UserManager {
  constructor() {
    this.tasks = [];
    this.lists = [];
    this.selectedTaskId = null;
    this.editingList = null;
  }

  async loadTasks() {
    // Delegate to AuthManager
    return authManager.loadUserData();
  }

  async loadLists() {
    // Delegate to AuthManager
    return authManager.loadUserData();
  }

  populateTaskSelect() {
    const select = document.getElementById("listTaskSelect");
    if (!select) return;

    // Get tasks from AuthManager or make API call
    api.getTasks().then((response) => {
      const tasks = response.data || [];
      select.innerHTML =
        '<option value="" class="text-gray-800">Select a task</option>' +
        tasks
          .map(
            (task) =>
              `<option value="${task.id}" class="text-gray-800">${escapeHtml(
                task.title
              )}</option>`
          )
          .join("");
    });
  }
}

// Modal functions
function showCreateListModal() {
  document.getElementById("createListModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Populate task select
  if (window.userManager) {
    userManager.populateTaskSelect();
  }

  setTimeout(() => {
    document.getElementById("listTitle").focus();
  }, 100);
}

function hideCreateListModal() {
  document.getElementById("createListModal").classList.add("hidden");
  document.body.style.overflow = "auto";
}

// Utility function
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initialize user manager
const userManager = new UserManager();
