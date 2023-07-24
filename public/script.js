document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const taskForm = document.getElementById('task-form');

    // Function to add a new task to the task list
    function addTaskToList(task) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task';
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        taskItem.innerHTML = `
            <input type="checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
            <label>${task.name}</label>
            <span class="delete-btn" data-id="${task.id}">❌</span>
        `;
        taskList.appendChild(taskItem);
    }

    // Function to fetch tasks from the server
    function fetchTasks() {
        fetch('/tasks')
            .then(response => response.json())
            .then(data => {
                data.forEach(task => {
                    addTaskToList(task);
                });
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }

    // Function to handle form submission
    function handleFormSubmit(event) {
        event.preventDefault();

        const taskNameInput = document.getElementById('task-name');
        const taskName = taskNameInput.value.trim();

        if (taskName !== '') {
            // Send the form data to the server
            fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: taskName }),
            })
            .then(response => response.json())
            .then(data => {
                addTaskToList(data);
            })
            .catch(error => {
                console.error('Error adding task:', error);
            });

            taskNameInput.value = '';
        }
    }

    // Function to handle task checkbox change (mark as completed)
    function handleTaskCheckboxChange(event) {
        const taskId = event.target.getAttribute('data-id');
        const isCompleted = event.target.checked;

        fetch(`/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: isCompleted }),
        })
        .then(response => response.json())
        .then(data => {
            // Update the task's appearance based on completion status
            const taskItem = event.target.closest('.task');
            if (data.completed) {
                taskItem.classList.add('completed');
            } else {
                taskItem.classList.remove('completed');
            }
        })
        .catch(error => {
            console.error('Error updating task status:', error);
        });
    }

    // Function to handle task deletion
    function handleTaskDeletion(event) {
        const taskId = event.target.getAttribute('data-id');

        fetch(`/tasks/${taskId}`, {
            method: 'DELETE',
        })
        .then(() => {
            const taskItem = event.target.closest('.task');
            taskItem.remove();
        })
        .catch(error => {
            console.error('Error deleting task:', error);
        });
    }

    // Add event listeners
    taskForm.addEventListener('submit', handleFormSubmit);
    taskList.addEventListener('change', handleTaskCheckboxChange);
    taskList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            handleTaskDeletion(event);
        }
    });

    // Fetch tasks when the page loads
    fetchTasks();
});
