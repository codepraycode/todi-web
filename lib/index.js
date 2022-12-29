import '../scss/style.scss';
import { authenticate, clearCompletedTodo, createTaskSocket,createTodo,deleteTodo,disconnectAuth,updateTodo,USER_TOKEN } from './script';
import { alreadySignedInTemplate, signUpTemplate, signInTemplate } from './templates';

let filter = 'all';
let todos = [];
const AUTH_DATA = {
    // username: 'codepraycode',
    password: 'letmein'
}

// Keep a watch over all todos, and responed to any event on them
// Features: delete todo and update todo
function trackTodos() {
    const cancels = document.querySelectorAll('[data-cancel_id]');

    cancels.forEach((each) => each.addEventListener('click', (e) => {

        let todoId = parseInt(e.target.dataset.cancel_id);
        deleteTodo(todoId,(payload)=>{
            // console.log("Deleted task:", payload);
            const {data, error} = payload;

            if(error){
                console.error(error);
                return
            }

            todos = data;
            renderTodos();
        });
    }));


    const todoItems = document.querySelectorAll('[data-todo_index]');
    
    // Update check and uncheck
    todoItems.forEach((each) => each.addEventListener('click', (e) => {

        const elem = e.target.parentElement;
        let todoId = elem.id;
        let completed = elem.dataset.completed === 'true' || false;

        const data = {
            _id: todoId,
            completed: !completed,
        };
        
        updateTodo(data, (payload)=>{
            // console.log("Created task:", payload);
            const {data, error} = payload;

            if(error){
                console.error(error);
                return
            }

            todos = data;
            renderTodos();
        });

    }));
}

// Render all todos in DOM
// Receives all the todos to render
const renderTodos = () => {

    const todoListContainer = document.querySelector('[data-task_lists]');
    let content = '';

    // filter content based on keyword
    let filteredTodo = todos;

    if (filter === 'active') filteredTodo = todos.filter((t) => !t.completed);
    else if (filter === 'completed') filteredTodo = todos.filter((t) => t.completed);


    filteredTodo.forEach((each, index) => {
        content += `

        <div class="task" id=${each._id} data-completed=${each.completed ? 'true': 'false'} draggable="true">
            <span class="checker" data-todo_index="${index}">
                <img src="/images/icon-check.svg" alt="checker"/>
            </span>

            <p data-todo_index="${index}">${each.task}</p>

            <span class="canceler" data-cancel_id="${each._id}"></span>
        </div>

        `
    });

    todoListContainer.innerHTML = content;
    trackTodos();


    document.querySelector("[data--indicator]").innerHTML = `${filteredTodo.length} item${filteredTodo.length > 1 ? 's':''} left`;

}

// Render loading template
const renderTodosTemplete = () => {

    const todoListContainer = document.querySelector('[data-task_lists]');
    let content = '';

    for (let i = 0; i <= 4; i++) {
        content += `

        <div class="task loading">
            <span class="checker"></span>

            <p></p>
        </div>

        `
    };

    todoListContainer.innerHTML = content;

    document.querySelector("[data--indicator]").innerHTML = `loading tasks...`;

}

// Render loading template
const renderTodosError = (message) => {

    const todoListContainer = document.querySelector('[data-task_lists]');
    let content = `

        <div class="task-error">

            <p>Could not load your tasks</p>

            <button> Try again </button>
        </div>

    `

    todoListContainer.innerHTML = content;

    document.querySelector("[data--indicator]").innerHTML = `...`;

}

const renderAuthModal = (type=null, close=false) =>{    
    const modal = document.getElementById("auth_modal");
    const modal_content = document.getElementById("auth_modal--content");
    if(close){
        modal.setAttribute("data-show", "false");
        return
    }

    const initiateCloseModal = (functional=true) =>{
        const closeBtn = document.getElementById("closeModal");
        
        closeBtn.addEventListener('click',(e)=>{
            e.preventDefault();

            modal.setAttribute("data-show", "false");
        })

    }

    if (Boolean(AUTH_DATA?.username))
    {
        
        modal_content.innerHTML = alreadySignedInTemplate;
        modal.setAttribute("data-show", "true");
        initiateCloseModal(); // a working close modal
        return
    }
    
    if (type === 'signin'){
        modal_content.innerHTML = signInTemplate;
    }
    else if (type === 'signup'){
        modal_content.innerHTML = signUpTemplate;
    }
    else {
        // Default to sign in
        modal_content.innerHTML = signInTemplate;
    }

    modal.setAttribute("data-show", "true");
    listenForAuthSwitch();
    
}

function listenForAuthSwitch (){

    document.getElementById("switchContent").addEventListener('click',(e)=>{
        e.preventDefault();
        // console.log(e.target.dataset);
        const modal_content = document.getElementById("auth_modal--content");
        const navTo = e.target.dataset.nav;        
        // Switch content
        if (navTo === 'signUp') modal_content.innerHTML = signUpTemplate;
        else if (navTo === 'signIn') modal_content.innerHTML = signInTemplate;

        listenForAuthSwitch();
    });
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

    renderTodosTemplete();

    document.getElementById("auth").addEventListener('click', (e)=>{
        e.preventDefault();
        
        renderAuthModal();
    })

    

    const token = localStorage.getItem(USER_TOKEN);

    if (token){
        disconnectAuth();

        createTaskSocket(token, (previous_user_tasks)=>{
            document.getElementById("auth").innerText = AUTH_DATA.username;

            document.querySelector(".task-items").setAttribute('data-loading', 'false');

            todos = previous_user_tasks;
            all_filter.click();
        });

        return
    }

    // Otherwise
    authenticate(AUTH_DATA, 'signin', (res)=>{
        // console.log(res);
        const {data, error} = res;

        if (error){
            console.error("Error occured:", error);
            renderTodosError(error);
            return;
        }

        document.getElementById("auth").innerText = AUTH_DATA.username;

        const {token} = data;
        localStorage.setItem(USER_TOKEN, String(token));

        createTaskSocket(token, (previous_user_tasks)=>{
            document.querySelector(".task-items").setAttribute('data-loading', 'false');
            todos = previous_user_tasks;
            all_filter.click();
        });



    });

}

// =============== Tasks Feature ====================
const taskInputForm = document.getElementById("taskInput");

taskInputForm.onsubmit = (e) => {
    e.preventDefault();

    // console.log(e.form);

    const enteredTask = document.querySelector("[name='new_task']");

    const task = enteredTask.value;

    createTodo(task, (payload)=>{
        // console.log("Created task:", payload);
        const {data, error} = payload;

        if(error){
            console.error(error);
            return
        }

        todos = data;
        renderTodos();
    });

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
    clearCompletedTodo((payload)=>{
        // console.log("Deleted task:", payload);
        const {data, error} = payload;

        if(error){
            console.error(error);
            return
        }

        todos = data;
        renderTodos();
    });
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

