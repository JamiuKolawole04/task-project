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

  populateTaskSelect(tasks = null) {
    const select = document.getElementById("listTaskSelect");
    if (!select) return;

    // Use provided tasks or try to get them from authManager
    let availableTasks = tasks;

    if (!availableTasks) {
      // Try to get tasks from a recent API call or make a new one
      api
        .getTasks()
        .then((response) => {
          console.log("Task API response:", response);
          const tasks = response.data || [];
          this.populateTaskSelectOptions(select, tasks);
        })
        .catch((error) => {
          console.error("Failed to load tasks for select:", error);
          select.innerHTML =
            '<option value="" class="text-gray-800">Failed to load tasks</option>';
        });
      return;
    }

    this.populateTaskSelectOptions(select, availableTasks);
  }

  populateTaskSelectOptions(select, tasks) {
    console.log("Populating select with tasks:", tasks);

    if (!tasks || tasks.length === 0) {
      select.innerHTML =
        '<option value="" class="text-gray-800">No tasks available</option>';
      return;
    }

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
  }

  async createList(formData) {
    try {
      showLoading(true);
      const response = await api.createList(formData);
      showToast("List created successfully!", "success");

      // Refresh the user data
      await authManager.loadUserData();

      // Close modal and reset form
      hideCreateListModal();
      document.getElementById("createListForm").reset();

      return response;
    } catch (error) {
      console.error("Create list failed:", error);
      showToast("Failed to create list: " + error.message, "error");
      throw error;
    } finally {
      showLoading(false);
    }
  }
}

// Modal functions
function showCreateListModal() {
  document.getElementById("createListModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Populate task select - try to get tasks from recent data
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

  // Reset form
  const form = document.getElementById("createListForm");
  if (form) {
    form.reset();
  }
}

// Utility function
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

const userManager = new UserManager();

//form handler for creating lists
document.addEventListener("DOMContentLoaded", function () {
  const createListForm = document.getElementById("createListForm");
  if (createListForm) {
    // Remove any existing listeners
    const newCreateListForm = createListForm.cloneNode(true);
    createListForm.parentNode.replaceChild(newCreateListForm, createListForm);

    newCreateListForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const taskId = document.getElementById("listTaskSelect").value;
      const title = document.getElementById("listTitle").value.trim();
      const description = document
        .getElementById("listDescription")
        .value.trim();

      if (!taskId) {
        showToast("Please select a task", "warning");
        return;
      }

      if (!title) {
        showToast("Please enter a list title", "warning");
        return;
      }

      const formData = {
        task_id: parseInt(taskId),
        title: title,
        description: description || "",
      };

      await userManager.createList(formData);
    });
  }
});

function showCreateListModalForTask(taskId) {
  showCreateListModal();

  // Pre-select the task
  setTimeout(() => {
    const select = document.getElementById("listTaskSelect");
    if (select) {
      select.value = taskId;
    }
  }, 200);
}

function showCreateListModal() {
  document.getElementById("createListModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (authManager && authManager.availableTasks) {
    // Use cached tasks if available
    userManager.populateTaskSelect(authManager.availableTasks);
  } else {
    userManager.populateTaskSelect();
  }

  setTimeout(() => {
    document.getElementById("listTitle").focus();
  }, 100);
}
