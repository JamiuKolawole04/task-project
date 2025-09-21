class ApiService {
  constructor() {
    this.baseURL = "http://localhost:8000/api";
    this.token = localStorage.getItem("token");
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`API Request: ${options.method || "GET"} ${url}`); // Debug log

    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
      console.log("Request body:", config.body); // Debug log
    }

    try {
      const response = await fetch(url, config);
      console.log(`API Response: ${response.status} ${response.statusText}`); // Debug log

      // Try to get response text first
      const responseText = await response.text();
      console.log("Raw response:", responseText); // Debug log

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error(
          `Invalid JSON response: ${responseText.substring(0, 200)}`
        );
      }

      if (!response.ok) {
        console.error("API Error Response:", data); // Debug log

        // Handle Laravel validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(", "));
        }

        throw new Error(
          data.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      console.log("API Success Response:", data); // Debug log
      return data;
    } catch (error) {
      console.error("API request failed:", error);

      // Network errors
      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error: Please check if the backend server is running on http://localhost:8000"
        );
      }

      throw error;
    }
  }
  // Auth endpoints
  async register(userData) {
    return this.request("/register", {
      method: "POST",
      body: userData,
    });
  }

  async login(credentials) {
    return this.request("/login", {
      method: "POST",
      body: credentials,
    });
  }

  async logout() {
    return this.request("/logout", {
      method: "POST",
    });
  }

  async getMe() {
    return this.request("/me");
  }

  // Task endpoints
  async getTasks(page = 1) {
    return this.request(`/tasks?page=${page}`);
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.request("/tasks", {
      method: "POST",
      body: taskData,
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: "PUT",
      body: taskData,
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: "DELETE",
    });
  }

  // List endpoints
  async getLists(taskId = null, page = 1) {
    const query = taskId ? `?task_id=${taskId}&page=${page}` : `?page=${page}`;
    return this.request(`/lists${query}`);
  }

  async getList(id) {
    return this.request(`/lists/${id}`);
  }

  async createList(listData) {
    return this.request("/lists", {
      method: "POST",
      body: listData,
    });
  }

  async updateList(id, listData) {
    return this.request(`/lists/${id}`, {
      method: "PUT",
      body: listData,
    });
  }

  async deleteList(id) {
    return this.request(`/lists/${id}`, {
      method: "DELETE",
    });
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }
}

// Global API instance
const api = new ApiService();
