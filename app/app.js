(() => {
  const STORAGE_KEY = "tasktrack.tasks.v1";
  const form = document.getElementById("task-form");
  const titleInput = document.getElementById("task-title");
  const priorityInput = document.getElementById("task-priority");
  const dueInput = document.getElementById("task-due");
  const message = document.getElementById("form-message");
  const list = document.getElementById("task-list");
  const emptyState = document.getElementById("empty-state");
  const totalCount = document.getElementById("total-count");
  const completedCount = document.getElementById("completed-count");
  const searchInput = document.getElementById("task-search");
  const filterInput = document.getElementById("task-filter");
  let tasks = loadTasks();

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved.filter(t => t && typeof t.id === "string" && typeof t.title === "string") : [];
    } catch {
      return [];
    }
  }
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch {
      showMessage("Could not save tasks in this browser.", false);
      return false;
    }
  }
  function showMessage(text, success) {
    message.textContent = text;
    message.className = success ? "message success" : "message";
  }
  function formatDate(date) {
    if (!date) return "";
    const parts = date.split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
  }
  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const filter = filterInput.value;
    const visible = tasks.filter(task => {
      const matchesQuery = task.title.toLowerCase().includes(query);
      const matchesFilter = filter === "all" || (filter === "active" && !task.completed) || (filter === "completed" && task.completed);
      return matchesQuery && matchesFilter;
    });
    list.replaceChildren();
    visible.forEach(task => {
      const li = document.createElement("li");
      li.className = `task-item${task.completed ? " completed" : ""}`;
      li.dataset.taskId = task.id;
      const check = document.createElement("input");
      check.type = "checkbox";
      check.className = "task-check";
      check.checked = task.completed;
      check.setAttribute("aria-label", `Mark ${task.title} completed`);
      check.addEventListener("change", () => {
        task.completed = check.checked;
        saveTasks();
        render();
      });
      const main = document.createElement("div");
      main.className = "task-main";
      const title = document.createElement("div");
      title.className = "task-title";
      title.textContent = task.title;
      const meta = document.createElement("div");
      meta.className = "task-meta";
      const priority = document.createElement("span");
      priority.className = `priority ${task.priority}`;
      priority.textContent = task.priority;
      meta.append(priority);
      if (task.due) {
        const due = document.createElement("span");
        due.textContent = `Due ${formatDate(task.due)}`;
        meta.append(due);
      }
      main.append(title, meta);
      const del = document.createElement("button");
      del.type = "button";
      del.className = "delete-btn";
      del.textContent = "Delete";
      del.setAttribute("aria-label", `Delete ${task.title}`);
      del.addEventListener("click", () => {
        tasks = tasks.filter(item => item.id !== task.id);
        saveTasks();
        render();
      });
      li.append(check, main, del);
      list.append(li);
    });
    emptyState.hidden = visible.length > 0;
    if (tasks.length > 0 && visible.length === 0) {
      emptyState.querySelector("h3").textContent = "No matching tasks";
      emptyState.querySelector("p").textContent = "Try another search or filter.";
    } else {
      emptyState.querySelector("h3").textContent = "No tasks yet";
      emptyState.querySelector("p").textContent = "Add your first task using the form above.";
    }
    totalCount.textContent = String(tasks.length);
    completedCount.textContent = String(tasks.filter(t => t.completed).length);
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    const title = titleInput.value.trim();
    if (!title) {
      showMessage("Please enter a task title.", false);
      titleInput.focus();
      return;
    }
    if (title.length > 100) {
      showMessage("Task title must be 100 characters or fewer.", false);
      return;
    }
    tasks.unshift({
      id: (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      priority: priorityInput.value,
      due: dueInput.value,
      completed: false
    });
    saveTasks();
    form.reset();
    priorityInput.value = "Medium";
    showMessage("Task added successfully.", true);
    render();
  });
  searchInput.addEventListener("input", render);
  filterInput.addEventListener("change", render);
  render();
})();
