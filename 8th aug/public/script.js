document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:8080/api/tasks" // Ensure this matches your Spring Boot port

  const taskForm = document.getElementById("task-form")
  const taskTitleInput = document.getElementById("task-title")
  const taskDescriptionInput = document.getElementById("task-description")
  const taskList = document.getElementById("task-list")
  const loadingIndicator = document.getElementById("loading-indicator")
  const noTasksMessage = document.getElementById("no-tasks-message")

  // --- Utility Functions ---
  function showLoading() {
    loadingIndicator.classList.remove("hidden")
    taskList.classList.add("hidden")
    noTasksMessage.classList.add("hidden")
  }

  function hideLoading() {
    loadingIndicator.classList.add("hidden")
    taskList.classList.remove("hidden")
  }

  function showNoTasksMessage() {
    noTasksMessage.classList.remove("hidden")
    taskList.innerHTML = "" // Clear any existing tasks
  }

  function hideNoTasksMessage() {
    noTasksMessage.classList.add("hidden")
  }

  // --- API Interaction Functions ---
  async function fetchTasks() {
    showLoading()
    try {
      const response = await fetch(API_BASE_URL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const tasks = await response.json()
      renderTasks(tasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      alert("Failed to load tasks. Please ensure the backend is running.")
      showNoTasksMessage() // Show message even on error if no tasks can be loaded
    } finally {
      hideLoading()
    }
  }

  async function addTask(task) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const newTask = await response.json()
      console.log("Task added:", newTask)
      fetchTasks() // Re-fetch all tasks to update the list
    } catch (error) {
      console.error("Error adding task:", error)
      alert("Failed to add task.")
    }
  }

  async function updateTask(id, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const updatedTask = await response.json()
      console.log("Task updated:", updatedTask)
      fetchTasks() // Re-fetch all tasks to update the list
    } catch (error) {
      console.error("Error updating task:", error)
      alert("Failed to update task.")
    }
  }

  async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      console.log("Task deleted:", id)
      fetchTasks() // Re-fetch all tasks to update the list
    } catch (error) {
      console.error("Error deleting task:", error)
      alert("Failed to delete task.")
    }
  }

  // --- UI Rendering Functions ---
  function renderTasks(tasks) {
    taskList.innerHTML = "" // Clear current list
    if (tasks.length === 0) {
      showNoTasksMessage()
      return
    }
    hideNoTasksMessage()

    tasks.forEach((task) => {
      const taskItem = document.createElement("div")
      taskItem.classList.add("task-item")
      if (task.completed) {
        taskItem.classList.add("completed")
      }
      taskItem.dataset.id = task.id

      taskItem.innerHTML = `
                <div class="task-item-header">
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-actions">
                        <button class="btn btn-success toggle-complete-btn">
                            ${task.completed ? "Unmark" : "Complete"}
                        </button>
                        <button class="btn btn-danger delete-btn">Delete</button>
                    </div>
                </div>
                ${task.description ? `<p class="task-description">${task.description}</p>` : ""}
            `

      taskList.appendChild(taskItem)
    })
  }

  // --- Event Listeners ---
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const title = taskTitleInput.value.trim()
    const description = taskDescriptionInput.value.trim()

    if (title) {
      await addTask({ title, description, completed: false })
      taskTitleInput.value = ""
      taskDescriptionInput.value = ""
    } else {
      alert("Task title cannot be empty!")
    }
  })

  taskList.addEventListener("click", async (e) => {
    const target = e.target
    const taskItem = target.closest(".task-item")
    if (!taskItem) return

    const taskId = taskItem.dataset.id
    const currentTask = await (await fetch(`${API_BASE_URL}/${taskId}`)).json()

    if (target.classList.contains("toggle-complete-btn")) {
      await updateTask(taskId, { ...currentTask, completed: !currentTask.completed })
    } else if (target.classList.contains("delete-btn")) {
      await deleteTask(taskId)
    }
  })

  // Initial load of tasks
  fetchTasks()
})
