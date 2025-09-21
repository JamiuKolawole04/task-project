// Main Application Script

// Global utility functions
function hideAllSections() {
  const sections = [
    "welcome-section",
    "login-form",
    "register-form",
    "admin-dashboard",
    "user-dashboard",
  ];

  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add("hidden");
    }
  });
}

function showLoading(show = true) {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    if (show) {
      overlay.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    } else {
      overlay.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  }
}

function showToast(message, type = "info", duration = 4000) {
  console.log(`TOAST [${type.toUpperCase()}]:`, message);

  const toast = document.getElementById("toast");
  const toastIcon = document.getElementById("toast-icon");
  const toastMessage = document.getElementById("toast-message");

  if (!toast || !toastIcon || !toastMessage) {
    console.error("Toast elements not found!");
    return;
  }

  // Set icon and color based on type
  let iconClass = "fas fa-info-circle";
  let colorClass = "bg-blue-500/80";

  switch (type) {
    case "success":
      iconClass = "fas fa-check-circle";
      colorClass = "bg-green-500/80";
      break;
    case "error":
      iconClass = "fas fa-exclamation-circle";
      colorClass = "bg-red-500/80";
      // Errors stay longer
      duration = Math.max(duration, 8000);
      break;
    case "warning":
      iconClass = "fas fa-exclamation-triangle";
      colorClass = "bg-yellow-500/80";
      duration = Math.max(duration, 6000);
      break;
    default:
      iconClass = "fas fa-info-circle";
      colorClass = "bg-blue-500/80";
  }

  toastIcon.className = iconClass;
  toastMessage.textContent = message;

  // Remove existing color classes and add new one
  toast.className = toast.className.replace(/bg-\w+-\d+\/\d+/g, "");
  toast.classList.add(colorClass);

  // Show toast
  toast.classList.remove("translate-x-full");
  toast.classList.add("translate-x-0");

  // For errors, also add to DOM temporarily so you can inspect it

  if (type === "error") {
    const errorDiv = document.createElement("div");
    errorDiv.id = "debug-error";
    errorDiv.style.cssText =
      "position:fixed;top:100px;right:20px;background:red;color:white;padding:20px;z-index:9999;max-width:400px;border-radius:8px;";
    errorDiv.innerHTML = `
            <strong>DEBUG ERROR:</strong><br>
            ${message}<br>
            <button onclick="document.getElementById('debug-error').remove()" 
                    style="background:white;color:black;padding:5px 10px;margin-top:10px;border:none;border-radius:4px;cursor:pointer;">
                Close
            </button>
        `;
    document.body.appendChild(errorDiv);

    // Auto remove after 15 seconds
    setTimeout(() => {
      const debugError = document.getElementById("debug-error");
      if (debugError) debugError.remove();
    }, 15000);
  }

  // Hide toast after duration
  setTimeout(() => {
    toast.classList.remove("translate-x-0");
    toast.classList.add("translate-x-full");
  }, duration);
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Escape key to close modals
  if (e.key === "Escape") {
    const modal = document.getElementById("createListModal");
    if (modal && !modal.classList.contains("hidden")) {
      hideCreateListModal();
    }
  }

  // Ctrl/Cmd + N to create new task (admin) or list (user)
  if ((e.ctrlKey || e.metaKey) && e.key === "n") {
    e.preventDefault();

    if (authManager.isAuthenticated()) {
      if (authManager.isAdmin()) {
        document.getElementById("taskTitle")?.focus();
      } else {
        showCreateListModal();
      }
    }
  }

  // Ctrl/Cmd + R to refresh data
  if ((e.ctrlKey || e.metaKey) && e.key === "r") {
    e.preventDefault();

    if (authManager.isAuthenticated()) {
      if (authManager.isAdmin()) {
        // Use authManager instead of adminManager to prevent conflicts
        authManager.loadAdminData();
      } else {
        // Only call userManager if it exists
        if (typeof userManager !== "undefined" && userManager.loadTasks) {
          userManager.loadTasks();
          userManager.loadLists();
        } else {
          authManager.loadUserData();
        }
      }
      showToast("Data refreshed", "info");
    }
  }
});

// Handle browser back/forward buttons
window.addEventListener("popstate", (e) => {
  if (!authManager.isAuthenticated()) {
    authManager.showWelcome();
  }
});

// Auto-save form data to prevent loss
function setupAutoSave() {
  const forms = ["createTaskForm", "createListForm"];

  forms.forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) {
      const inputs = form.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        input.addEventListener("input", () => {
          const key = `autosave_${formId}_${input.id}`;
          localStorage.setItem(key, input.value);
        });
      });
    }
  });
}

// Restore auto-saved data
function restoreAutoSave() {
  const forms = ["createTaskForm", "createListForm"];

  forms.forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) {
      const inputs = form.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        const key = `autosave_${formId}_${input.id}`;
        const savedValue = localStorage.getItem(key);
        if (savedValue && input.value === "") {
          input.value = savedValue;
        }
      });
    }
  });
}

// Clear auto-save data
function clearAutoSave(formId = null) {
  if (formId) {
    const form = document.getElementById(formId);
    if (form) {
      const inputs = form.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        const key = `autosave_${formId}_${input.id}`;
        localStorage.removeItem(key);
      });
    }
  } else {
    // Clear all auto-save data
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("autosave_")
    );
    keys.forEach((key) => localStorage.removeItem(key));
  }
}

// Real-time connection check
let connectionCheckInterval;

function startConnectionCheck() {
  connectionCheckInterval = setInterval(async () => {
    try {
      await api.healthCheck();
    } catch (error) {
      showToast(
        "Connection lost. Please check your internet connection.",
        "error"
      );
    }
  }, 30000); // Check every 30 seconds
}

function stopConnectionCheck() {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
}

// Handle online/offline status
window.addEventListener("online", () => {
  showToast("Connection restored", "success");
  startConnectionCheck();
});

window.addEventListener("offline", () => {
  showToast("Connection lost. Working offline.", "warning");
  stopConnectionCheck();
});

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Task Management System initialized");

  // Setup auto-save and restore
  setupAutoSave();
  restoreAutoSave();

  // Setup smooth scrolling
  setupSmoothScrolling();

  // Start connection monitoring
  startConnectionCheck();

  // Show welcome message
  setTimeout(() => {
    if (!authManager.isAuthenticated()) {
      showToast(
        "Welcome to Task Management System! Please login to continue.",
        "info"
      );
    }
  }, 1000);

  // Clear auto-save data on successful form submissions
  document.getElementById("createTaskForm")?.addEventListener("submit", () => {
    setTimeout(() => clearAutoSave("createTaskForm"), 1000);
  });

  document.getElementById("createListForm")?.addEventListener("submit", () => {
    setTimeout(() => clearAutoSave("createListForm"), 1000);
  });
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  stopConnectionCheck();
});

// Error handling for uncaught errors
window.addEventListener("error", (e) => {
  console.error("Uncaught error:", e.error);
  showToast("An unexpected error occurred. Please try again.", "error");
});

// Promise rejection handling
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
  showToast("An unexpected error occurred. Please try again.", "error");
});

// Export for debugging (only in development)
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  window.debug = {
    authManager,
    adminManager: typeof adminManager !== "undefined" ? adminManager : null,
    userManager: typeof userManager !== "undefined" ? userManager : null,
    api,
    showToast,
    showLoading,
  };
}
