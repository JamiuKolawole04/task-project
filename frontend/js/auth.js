class AuthManager {
  constructor() {
    this.currentUser = null;
    this.token = localStorage.getItem("token");
    this.editingTaskId = null;
    this.initializeAuth();
  }

  async initializeAuth() {
    if (this.token) {
      try {
        const response = await api.getMe();
        this.currentUser = response.data.user;
        this.showDashboard();
      } catch (error) {
        console.log("Token invalid, logging out");
        this.logout();
      }
    }
  }

  async login(credentials) {
    try {
      console.log("Login attempt:", credentials.email);
      showLoading(true);

      const response = await api.login(credentials);
      console.log("Login response:", response);

      this.currentUser = response.data.user;
      this.token = response.data.token;
      api.setToken(this.token);

      showToast("Login successful!", "success", 6000);
      this.showDashboard();
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.message || error.toString() || "Login failed";
      showToast(errorMessage, "error", 8000);
    } finally {
      showLoading(false);
    }
  }

  async register(userData) {
    try {
      console.log("Register attempt:", userData.email);
      showLoading(true);

      const response = await api.register(userData);
      console.log("Register response:", response);

      this.currentUser = response.data.user;
      this.token = response.data.token;
      api.setToken(this.token);

      showToast("Registration successful!", "success", 6000);
      this.showDashboard();
    } catch (error) {
      console.error("Register error:", error);
      const errorMessage =
        error.message || error.toString() || "Registration failed";
      showToast(errorMessage, "error", 8000);
    } finally {
      showLoading(false);
    }
  }

  async logout() {
    try {
      if (this.token) {
        await api.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.currentUser = null;
      this.token = null;
      this.editingTaskId = null;
      api.removeToken();
      this.showWelcome();
      showToast("Logged out successfully", "info", 4000);
    }
  }

  showDashboard() {
    console.log("=== DASHBOARD LOADING ===");
    console.log("Current user:", this.currentUser);
    console.log("User role:", this.currentUser?.role);

    hideAllSections();

    if (this.currentUser.role === "admin") {
      console.log("Loading ADMIN dashboard");
      document.getElementById("admin-dashboard").classList.remove("hidden");
      document.getElementById(
        "admin-welcome"
      ).textContent = `Welcome, ${this.currentUser.name}!`;

      // Load admin data - ONLY ONCE
      setTimeout(() => {
        this.loadAdminData();
      }, 200);
    } else {
      console.log("Loading USER dashboard");
      document.getElementById("user-dashboard").classList.remove("hidden");
      document.getElementById(
        "user-welcome"
      ).textContent = `Welcome, ${this.currentUser.name}!`;

      // Load user data - ONLY ONCE
      setTimeout(() => {
        this.loadUserData();
      }, 200);
    }

    this.updateNavigation();
  }

  // Admin data loading
  async loadAdminData() {
    console.log("Loading admin data...");

    try {
      const tasksResponse = await api.getTasks();

      const tasks = tasksResponse.data || [];

      this.updateAdminTasksUI(tasks);
    } catch (error) {
      showToast("Failed to load tasks: " + error.message, "error", 8000);
    }
  }

  // User data loading
  async loadUserData() {
    console.log("Loading user data...");

    try {
      // Load tasks
      const tasksResponse = await api.getTasks();
      console.log("User tasks response:", tasksResponse);

      // Load lists
      const listsResponse = await api.getLists();
      console.log("User lists response:", listsResponse);

      const tasks = tasksResponse.data || [];
      const lists = listsResponse.data || [];

      console.log("Parsed tasks:", tasks);
      console.log("Parsed lists:", lists);

      this.updateUserTasksUI(tasks);
      this.updateUserListsUI(lists);
    } catch (error) {
      console.error("Failed to load user data:", error);
      showToast(
        "Failed to load dashboard data: " + error.message,
        "error",
        8000
      );
    }
  }

  // Admin tasks UI
  updateAdminTasksUI(tasks) {
    const container = document.getElementById("tasks-container");
    if (!container) return;

    if (!tasks || tasks.length === 0) {
      container.innerHTML = `
                <div class="text-center text-white/60 py-8">
                    <i class="fas fa-tasks text-2xl"></i>
                    <p class="mt-2">No tasks found</p>
                    <p class="text-sm">Create your first task above!</p>
                </div>
            `;
      return;
    }

    container.innerHTML = tasks
      .map(
        (task) => `
            <div class="bg-white/10 border border-white/20 rounded-lg p-6 hover:bg-white/20 transition card-hover">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h4 class="text-lg font-semibold text-white mb-2">
                            <i class="fas fa-clipboard-list mr-2"></i>${this.escapeHtml(
                              task.title
                            )}
                        </h4>
                        <p class="text-white/80 mb-3">${this.escapeHtml(
                          task.description
                        )}</p>
                        <div class="flex items-center space-x-4 text-sm text-white/60">
                            <span>
                                <i class="fas fa-calendar-plus mr-1"></i>Created: ${new Date(
                                  task.created_at
                                ).toLocaleDateString()}
                            </span>
                            <span class="bg-blue-500/20 text-blue-200 px-2 py-1 rounded">
                                <i class="fas fa-list mr-1"></i>${
                                  task.lists_count || 0
                                } lists
                            </span>
                        </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                        <button onclick="authManager.editTask(${
                          task.id
                        }, '${this.escapeHtml(task.title)}', '${this.escapeHtml(
          task.description
        )}')" 
                                class="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="authManager.deleteTask(${
                          task.id
                        }, '${this.escapeHtml(task.title)}')" 
                                class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  // User tasks UI
  updateUserTasksUI(tasks) {
    const container = document.getElementById("user-tasks-container");
    if (!container) return;

    if (!tasks || tasks.length === 0) {
      container.innerHTML = `
      <div class="text-center text-white/60 py-8">
        <i class="fas fa-tasks text-2xl"></i>
        <p class="mt-2">No tasks available</p>
        <p class="text-sm">Contact an admin to create tasks</p>
      </div>
    `;
      return;
    }

    // Store tasks for later use in modals
    this.availableTasks = tasks;

    container.innerHTML = tasks
      .map(
        (task) => `
        <div class="bg-white/10 border border-white/20 rounded-lg p-6 hover:bg-white/20 transition card-hover">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-white mb-2">
                <i class="fas fa-clipboard-list mr-2"></i>${this.escapeHtml(
                  task.title
                )}
              </h4>
              <p class="text-white/80 mb-3">${this.escapeHtml(
                task.description
              )}</p>
              <div class="flex items-center space-x-4 text-sm text-white/60">
                <span>
                  <i class="fas fa-calendar-plus mr-1"></i>Created: ${new Date(
                    task.created_at
                  ).toLocaleDateString()}
                </span>
                <span class="bg-blue-500/20 text-blue-200 px-2 py-1 rounded">
                  <i class="fas fa-users mr-1"></i>${
                    task.lists_count || 0
                  } total lists
                </span>
              </div>
            </div>
            <div class="flex space-x-2 ml-4">
              <button onclick="showCreateListModalForTask(${task.id})" 
                      class="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition">
                <i class="fas fa-plus mr-1"></i>Add List
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }
  // User lists UI
  updateUserListsUI(lists) {
    const container = document.getElementById("user-lists-container");
    if (!container) return;

    if (!lists || lists.length === 0) {
      container.innerHTML = `
      <div class="text-center text-white/60 py-8">
        <i class="fas fa-list text-2xl"></i>
        <p class="mt-2">No lists found</p>
        <p class="text-sm">Create your first list!</p>
      </div>
    `;
      return;
    }

    // Store lists for later use
    this.availableLists = lists;

    container.innerHTML = lists
      .map(
        (list) => `
        <div class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3 flex-1">
              <button 
                onclick="userManager.toggleListCompletion(${list.id}, ${
          list.completed
        })"
                class="mt-1 transition-colors duration-200 hover:scale-110"
              >
                <i class="fas ${
                  list.completed
                    ? "fa-check-circle text-green-400 hover:text-green-300"
                    : "fa-circle text-gray-400 hover:text-gray-300"
                } text-lg"></i>
              </button>
              <div class="flex-1 ${list.completed ? "opacity-60" : ""}">
                <div class="flex items-center space-x-2 mb-1">
                  <h5 class="text-white font-medium ${
                    list.completed ? "line-through" : ""
                  }">${this.escapeHtml(list.title)}</h5>
                  ${
                    list.completed
                      ? '<span class="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">✓ Completed</span>'
                      : '<span class="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">• Pending</span>'
                  }
                </div>
                ${
                  list.description
                    ? `<p class="text-white/70 text-sm mt-1 ${
                        list.completed ? "line-through" : ""
                      }">${this.escapeHtml(list.description)}</p>`
                    : ""
                }
                <div class="flex items-center space-x-4 text-xs text-white/50 mt-2">
                  <span>
                    <i class="fas fa-calendar mr-1"></i>${new Date(
                      list.created_at
                    ).toLocaleDateString()}
                  </span>
                  ${
                    list.task
                      ? `<span class="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                           <i class="fas fa-tasks mr-1"></i>${this.escapeHtml(
                             list.task.title
                           )}
                         </span>`
                      : ""
                  }
                </div>
              </div>
            </div>
            <div class="flex space-x-1 ml-2">
              <button 
                onclick="userManager.editList(${list.id})"
                class="bg-blue-500/80 hover:bg-blue-500 text-white p-2 rounded transition"
                title="Edit list"
              >
                <i class="fas fa-edit text-sm"></i>
              </button>
              <button 
                onclick="userManager.deleteList(${list.id}, '${this.escapeHtml(
          list.title
        )}')"
                class="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded transition"
                title="Delete list"
              >
                <i class="fas fa-trash text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }

  // Task operations
  async editTask(taskId, currentTitle, currentDescription) {
    console.log("Edit task:", taskId, currentTitle);

    const titleInput = document.getElementById("taskTitle");
    const descInput = document.getElementById("taskDescription");

    if (!titleInput || !descInput) {
      showToast("Form elements not found", "error");
      return;
    }

    // Pre-fill form
    titleInput.value = currentTitle;
    descInput.value = currentDescription;

    // Change to edit mode
    this.editingTaskId = taskId;

    // Update button
    const submitBtn = document.querySelector(
      '#createTaskForm button[type="submit"]'
    );
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Task';
      submitBtn.classList.remove("bg-green-500", "hover:bg-green-600");
      submitBtn.classList.add("bg-blue-500", "hover:bg-blue-600");
    }

    // Add cancel button
    if (!document.getElementById("cancelEditBtn")) {
      const cancelBtn = document.createElement("button");
      cancelBtn.id = "cancelEditBtn";
      cancelBtn.type = "button";
      cancelBtn.className =
        "bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition";
      cancelBtn.innerHTML = '<i class="fas fa-times mr-2"></i>Cancel';
      cancelBtn.onclick = () => this.cancelEditTask();
      submitBtn.parentNode.appendChild(cancelBtn);
    }

    titleInput.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => titleInput.focus(), 300);
    showToast("Edit mode activated", "info");
  }

  async deleteTask(taskId, taskTitle) {
    if (!confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      return;
    }

    try {
      showLoading(true);
      await api.deleteTask(taskId);
      showToast("Task deleted successfully!", "success");

      // Reload data after delete
      await this.loadAdminData();
    } catch (error) {
      console.error("Delete task failed:", error);
      showToast("Failed to delete task: " + error.message, "error");
    } finally {
      showLoading(false);
    }
  }

  cancelEditTask() {
    this.editingTaskId = null;

    // Reset form
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";

    // Reset button
    const submitBtn = document.querySelector(
      '#createTaskForm button[type="submit"]'
    );
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Create Task';
      submitBtn.classList.remove("bg-blue-500", "hover:bg-blue-600");
      submitBtn.classList.add("bg-green-500", "hover:bg-green-600");
    }

    // Remove cancel button
    const cancelBtn = document.getElementById("cancelEditBtn");
    if (cancelBtn) {
      cancelBtn.remove();
    }

    showToast("Edit cancelled", "info");
  }

  // Handle BOTH create and update
  async handleTaskSubmit(title, description) {
    if (this.isSubmitting) {
      console.log("Already submitting, ignoring");
      return;
    }

    this.isSubmitting = true;

    try {
      showLoading(true);

      if (this.editingTaskId) {
        // Update existing task
        console.log("Updating task:", this.editingTaskId);
        await api.updateTask(this.editingTaskId, { title, description });
        showToast("Task updated successfully!", "success");
        this.cancelEditTask();
      } else {
        // Create new task
        console.log("Creating new task");
        await api.createTask({ title, description });
        showToast("Task created successfully!", "success");

        // Reset form
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDescription").value = "";
      }

      // Reload data after operation
      await this.loadAdminData();
    } catch (error) {
      console.error("Task operation failed:", error);
      showToast(error.message || "Operation failed", "error");
    } finally {
      showLoading(false);
      this.isSubmitting = false; // Reset submission flag
    }
  }

  // HTML escaping
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showWelcome() {
    hideAllSections();
    document.getElementById("welcome-section").classList.remove("hidden");
    this.updateNavigation();
  }

  updateNavigation() {
    const navButtons = document.getElementById("nav-buttons");

    if (this.currentUser) {
      navButtons.innerHTML = `
                <div class="flex items-center space-x-4">
                    <span class="text-white/80">
                        <i class="fas fa-user mr-1"></i>${this.currentUser.name}
                        <span class="ml-2 px-2 py-1 bg-white/20 rounded text-xs">
                            ${this.currentUser.role.toUpperCase()}
                        </span>
                    </span>
                    <button onclick="authManager.logout()" 
                            class="bg-red-500/80 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition">
                        <i class="fas fa-sign-out-alt mr-1"></i>Logout
                    </button>
                </div>
            `;
    } else {
      navButtons.innerHTML = `
                <div class="flex space-x-4">
                    <button onclick="showLogin()" 
                            class="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition">
                        <i class="fas fa-sign-in-alt mr-2"></i>Login
                    </button>
                    <button onclick="showRegister()" 
                            class="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition">
                        <i class="fas fa-user-plus mr-2"></i>Register
                    </button>
                </div>
            `;
    }
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === "admin";
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

const authManager = new AuthManager();

// Form handlers
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, setting up forms");

  // Login form handler
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const newLoginForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newLoginForm, loginForm);

    newLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const credentials = {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value.trim(),
      };

      if (!credentials.email || !credentials.password) {
        showToast("Please fill in all fields", "warning", 6000);
        return;
      }

      await authManager.login(credentials);
    });
  }

  // Register form handler
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    // Remove any existing listeners to prevent duplicates
    const newRegisterForm = registerForm.cloneNode(true);
    registerForm.parentNode.replaceChild(newRegisterForm, registerForm);

    newRegisterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const password = document.getElementById("registerPassword").value.trim();
      const passwordConfirm = document
        .getElementById("registerPasswordConfirm")
        .value.trim();

      if (password !== passwordConfirm) {
        showToast("Passwords do not match", "error", 6000);
        return;
      }

      const userData = {
        name: document.getElementById("registerName").value.trim(),
        email: document.getElementById("registerEmail").value.trim(),
        password: password,
        password_confirmation: passwordConfirm,
        role: document.getElementById("registerRole").value,
      };

      if (
        !userData.name ||
        !userData.email ||
        !userData.password ||
        !userData.role
      ) {
        showToast("Please fill in all fields", "warning", 6000);
        return;
      }

      await authManager.register(userData);
    });
  }

  // Task form handler - SINGLE HANDLER TO PREVENT DUPLICATES
  const taskForm = document.getElementById("createTaskForm");
  if (taskForm) {
    // Remove any existing listeners to prevent duplicates
    const newTaskForm = taskForm.cloneNode(true);
    taskForm.parentNode.replaceChild(newTaskForm, taskForm);

    newTaskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const title = document.getElementById("taskTitle").value.trim();
      const description = document
        .getElementById("taskDescription")
        .value.trim();

      if (!title || !description) {
        showToast("Please fill in all fields", "warning", 6000);
        return;
      }

      await authManager.handleTaskSubmit(title, description);
    });
  }
});

// Navigation functions
function showLogin() {
  hideAllSections();
  document.getElementById("login-form").classList.remove("hidden");
}

function showRegister() {
  hideAllSections();
  document.getElementById("register-form").classList.remove("hidden");
}

function showWelcome() {
  authManager.showWelcome();
}

function logout() {
  authManager.logout();
}
