import '../scss/style.scss';
// import { loadFromStore, saveToStore } from './script';


let filter = 'all';

// Keep a watch over all todos, and responed to any event on them
// Features: delete todo and update todo
function trackTodos() {
    const cancels = document.querySelectorAll('[data-cancel_id]');

    cancels.forEach((each) => each.addEventListener('click', (e) => {

        let todoId = parseInt(e.target.dataset.cancel_id);
        // removeTodo(todoId);
    }));


    const todoItems = document.querySelectorAll('[data-todo_index]');

    todoItems.forEach((each) => each.addEventListener('click', (e) => {

        let todoIndex = parseInt(e.target.dataset.todo_index);

        // updateTodo(todoIndex);
    }));
}


// Render all todos in DOM
// Receives all the todos to render
const renderTodos = (todos = []) => {
    const todoListContainer = document.querySelector('[data-task_lists]');
    let content = '';

    // filter content based on keyword
    let filteredTodo = todos;

    if (filter === 'active') filteredTodo = todos.filter((t) => !t.completed);
    else if (filter === 'completed') filteredTodo = todos.filter((t) => t.completed);


    filteredTodo.forEach((each, index) => {
        content += `

        <div class="task" data-completed=${each.completed ? 'true': 'false'} draggable="true">
            <span class="checker" data-todo_index="${index}">
                <img src="/images/icon-check.svg" alt="checker"/>
            </span>

            <p data-todo_index="${index}">${each.task}</p>

            <span class="canceler" data-cancel_id="${each.id}"></span>
        </div>

        `
    });

    todoListContainer.innerHTML = content;
    trackTodos();


    document.querySelector("[data--indicator]").innerHTML = `${filteredTodo.length} item${filteredTodo.length > 1 ? 's':''} left`;

}


// Update by filter
const updateByFilter = () => {

    // keyword is either -> all, active, completed

    if (filter === 'all') {
        all_filter.classList.add('active');
    } else {
        all_filter.classList.remove('active');
    }

    if (filter === 'active') {
        undone_filter.classList.add('active');
    } else {
        undone_filter.classList.remove('active');
    }

    if (filter === 'completed') {
        completed_filter.classList.add('active');
    } else {
        completed_filter.classList.remove('active');
    }

    renderTodos();
}

// Run when the browser is done loading
window.onload = (e) => {
    // Run function when the browser loads
    // renderTodos();
    all_filter.click();
}


// =============== Tasks Feature ====================
const taskInputForm = document.getElementById("taskInput");

taskInputForm.onsubmit = (e) => {
    e.preventDefault();

    // console.log(e.form);

    const enteredTask = document.querySelector("[name='new_task']");

    const task = enteredTask.value;

    // todos.push({
    //     id: todos.length > 0 ? todos.length + 1 : 1,
    //     task,
    //     completed: false
    // });

    // todos = saveToStore(todos);

    // renderTodos();
    enteredTask.value = '';
};
// ==================================================================

// ================== Tasks Actions =================================
// Filters
const undone_filter = document.querySelector('[data-filter--undone]');
const all_filter = document.querySelector('[data-filter--all]');
const completed_filter = document.querySelector('[data-filter--completed]');
const clear_completed = document.querySelector('[data-filter--clear]');

undone_filter.addEventListener('click', (e) => {
    e.preventDefault();

    filter = 'active';
    updateByFilter();
})

all_filter.addEventListener('click', (e) => {
    e.preventDefault();
    filter = 'all';
    updateByFilter();
});

completed_filter.addEventListener('click', (e) => {
    e.preventDefault();
    filter = 'completed';
    updateByFilter();
});

clear_completed.addEventListener('click', (e) => {
    e.preventDefault();


    // todos = saveToStore(todos.filter((t) => !t.completed));
    // renderTodos();
});

// ==================================================================

// =========== Dark and Light Mode Feature ====================

document.getElementById("theme-cog").addEventListener('click', (e) => {
    const prev = document.body.dataset.theme;

    document.body.dataset.theme = prev === "light" ? "dark" : "light";

});

// ============================================================


// =============== Drag and drop Feature ========================

// Handle drag and drop
const container = document.getElementById("task__container");
const draggables = document.querySelectorAll("[draggable='true']");

draggables.forEach((draggable) => {

    draggable.addEventListener("dragstart", (e) => {
        draggable.classList.add('dragging');
    });

    draggable.addEventListener("dragend", (e) => {
        draggable.classList.remove('dragging');
    });

});

container.addEventListener("dragover", (e) => {
    e.preventDefault();

    const afterElement = getDragAfterElement(container, e.clientY);

    // print(afterElement);
    const dragedElement = document.querySelector('.dragging');

    if (!Boolean(afterElement)) container.appendChild(afterElement);
    else container.insertBefore(dragedElement, afterElement);

})

function getDragAfterElement(container, y) {

    const draggableElements = [...container.querySelectorAll('[draggable]:not(.dragging)')];


    return draggableElements.reduce((closest, child) => {

        const box = child.getBoundingClientRect();

        const offset = y - box.top - box.height / 2;


        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest
        }

    }, { offset: Number.NEGATIVE_INFINITY }).element;

}
// ==================================================================

