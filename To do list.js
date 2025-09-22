const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const addBtn = document.getElementById('addBtn');
    const pendingList = document.getElementById('pendingList');
    const completedList = document.getElementById('completedList');
    const message = document.getElementById('message');

    let tasks = JSON.parse(localStorage.getItem('tasks_v2')) || [];

    function saveTasks() {
      localStorage.setItem('tasks_v2', JSON.stringify(tasks));
    }

    function renderTasks() {
      pendingList.innerHTML = '';
      completedList.innerHTML = '';

      tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task';

        li.innerHTML = `
          <div class="task-left">
            <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
            <div class="task-text ${task.completed ? 'completed' : ''}">
              <span>${task.text}</span>
              ${task.dueDate ? `<span class="task-date">Due: ${task.dueDate}</span>` : ''}
            </div>
          </div>
          <div class="task-right">
            <button class="edit-btn" data-index="${index}">Edit</button>
            <button class="delete-btn" data-index="${index}">Delete</button>
          </div>
        `;

        if (task.completed) {
          completedList.appendChild(li);
        } else {
          pendingList.appendChild(li);
        }
      });
    }

    function addTask() {
      const text = taskInput.value.trim();
      const dueDate = taskDate.value;
      if (!text) {
        message.textContent = 'Please enter a task!';
        setTimeout(() => message.textContent = '', 2000);
        return;
      }
      tasks.push({ text, dueDate, completed: false });
      saveTasks();
      renderTasks();
      taskInput.value = '';
      taskDate.value = '';
    }

    addBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') addTask();
    });

    // Handle checkbox, edit, delete
    document.addEventListener('click', e => {
      const index = e.target.dataset.index;
      if (e.target.type === 'checkbox') {
        tasks[index].completed = e.target.checked;
        saveTasks();
        renderTasks();
      }

      if (e.target.classList.contains('delete-btn')) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      }

      if (e.target.classList.contains('edit-btn')) {
        const newText = prompt('Edit your task:', tasks[index].text);
        const newDate = prompt('Edit due date (YYYY-MM-DD):', tasks[index].dueDate || '');
        if (newText !== null && newText.trim() !== '') {
          tasks[index].text = newText.trim();
          tasks[index].dueDate = newDate ? newDate.trim() : '';
          saveTasks();
          renderTasks();
        } else if (newText !== null && newText.trim() === '') {
          message.textContent = 'Task cannot be empty!';
          setTimeout(() => message.textContent = '', 2000);
        }
      }
    });

    // Calendar popup toggle
    const calendarPopup = document.getElementById('calendarPopup');
    document.getElementById('calendarIcon').addEventListener('click', () => {
      calendarPopup.style.display = calendarPopup.style.display === 'block' ? 'none' : 'block';
    });
    document.getElementById('taskDate').addEventListener('click', () => {
      calendarPopup.style.display = calendarPopup.style.display === 'block' ? 'none' : 'block';
    });

    // Simple calendar generator
    const calendarContainer = document.getElementById('calendar');

    function generateCalendar(month, year) {
      const daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      let firstDay = new Date(year, month).getDay();
      let daysInMonth = new Date(year, month + 1, 0).getDate();
      let today = new Date();

      calendarContainer.innerHTML = `
        <div class="calendar-header">
          <button id="prevMonth">&#9664;</button>
          <span>${new Date(year,month).toLocaleString('default',{month:'long'})} ${year}</span>
          <button id="nextMonth">&#9654;</button>
        </div>
        <div class="calendar-grid" id="calendarGrid"></div>
      `;

      const grid = document.getElementById('calendarGrid');
      // Weekday headers
      daysOfWeek.forEach(d => {
        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.textContent = d;
        grid.appendChild(el);
      });
      // Empty slots before first day
      for (let i=0; i<firstDay; i++) {
        const empty = document.createElement('div');
        grid.appendChild(empty);
      }
      // Dates
      for (let d=1; d<=daysInMonth; d++) {
        const date = document.createElement('div');
        date.className = 'calendar-date';
        if (
          d === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear()
        ) {
          date.classList.add('calendar-today');
        }
        date.textContent = d;
        date.addEventListener('click', () => {
          // on click, fill your due-date input:
          document.getElementById('taskDate').value = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          calendarPopup.style.display = 'none'; // close popup after selecting date
        });
        grid.appendChild(date);
      }

      // prev/next handlers
      document.getElementById('prevMonth').onclick = () => {
        const prev = new Date(year, month - 1);
        generateCalendar(prev.getMonth(), prev.getFullYear());
      };
      document.getElementById('nextMonth').onclick = () => {
        const next = new Date(year, month + 1);
        generateCalendar(next.getMonth(), next.getFullYear());
      };
    }

    // init
    const now = new Date();
    generateCalendar(now.getMonth(), now.getFullYear());

    renderTasks();