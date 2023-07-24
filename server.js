const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const tasksFilePath = path.join(__dirname, 'tasks.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Function to read tasks from the tasks.json file
function readTasksFromFile() {
  try {
    const tasksData = fs.readFileSync(tasksFilePath, 'utf8');
    return JSON.parse(tasksData);
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return [];
  }
}

// Function to write tasks to the tasks.json file
function writeTasksToFile(tasks) {
  try {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error writing tasks to file:', error);
  }
}

app.get('/tasks', (req, res) => {
  const tasks = readTasksFromFile();
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid task name' });
  }

  const tasks = readTasksFromFile();

  const newTask = {
    id: tasks.length + 1,
    name: name,
    completed: false,
  };

  tasks.push(newTask);
  writeTasksToFile(tasks);

  res.status(201).json(newTask);
});

app.patch('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { completed } = req.body;

  const tasks = readTasksFromFile();

  const task = tasks.find(task => task.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.completed = completed;
  writeTasksToFile(tasks);

  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);

  let tasks = readTasksFromFile();
  tasks = tasks.filter(task => task.id !== taskId);
  writeTasksToFile(tasks);

  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
