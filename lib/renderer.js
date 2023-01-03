// Handles manipulation of Dom

import {
    clearCompletedTodo,
    deleteTodo, handleSignOut, updateTodo, USER_TOKEN
} from './script';
import { alreadySignedInTemplate, signUpTemplate, signInTemplate, initiateCloseModal, taskTemplate, taskLoadingTemplate } from './templates';
import { listenForAuthSwitch, listenForSignin, 
        listenForSignOut, listenForSignup,
 } from './listeners';

export const signOut = ()=> handleSignOut(resetAll);

// ================== Tasks Actions =================================
// Filters
const undone_filter = document.querySelector('[data-filter--undone]');
const all_filter = document.querySelector('[data-filter--all]');
const completed_filter = document.querySelector('[data-filter--completed]');
const clear_completed = document.querySelector('[data-filter--clear]');


let filter = 'all';
let todos = [];

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

    clearCompletedTodo();
});

// ==================================================================
// Render loading template
export const renderTodosTemplate = (amount=4) => {

    const todoListContainer = document.querySelector('[data-task_lists]');
    let content = '';

    for (let i = 0; i <= amount; i++) content += taskLoadingTemplate;

    todoListContainer.innerHTML = content;

    document.querySelector("[data--indicator]").innerHTML = `loading tasks...`;
    // document.querySelector(".task-items").setAttribute('data-loading', 'true');

}

// Render loading template
export const renderTodosError = (message) => {

    const todoListContainer = document.querySelector('[data-task_lists]');
    let content = `

        <div class="task-error">

            <p>${message}</p>
        </div>

    `

    todoListContainer.innerHTML = content;

    document.querySelector("#task__actions").style.display = "none";

}

// Render all todos in DOM
// Receives all the todos to render
export const renderTodos = (incoming_tasks = null) => {

    todos = incoming_tasks;

    if (!Boolean(todos)) return renderTodosTemplate();

    if (todos.length < 1) return renderTodosError("Your created task will show here");

    const todoListContainer = document.querySelector('[data-task_lists]');
    let content = '';
    // filter content based on keyword
    let filteredTodo = todos;

    if (filter === 'active') filteredTodo = todos.filter((t) => !t.completed);
    else if (filter === 'completed') filteredTodo = todos.filter((t) => t.completed);

    filteredTodo.forEach((each, index) => {        
        content += taskTemplate(each, index);
    });

    todoListContainer.innerHTML = content;
    trackTodos();

    document.querySelector("#task__actions").style.display = "flex";
    document.querySelector("[data--indicator]").innerHTML = `${filteredTodo.length} item${filteredTodo.length > 1 ? 's':''} left`;

}

function trackTodos() {
    const cancels = document.querySelectorAll('[data-cancel_id]');

    cancels.forEach((each) => each.addEventListener('click', (e) => {
        let todoId = e.target.dataset.cancel_id;
        deleteTodo(todoId);
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

        updateTodo(data);
    }));
}

export const renderAuthModal = (type=null, toClose=false) =>{    
    const modal = document.getElementById("auth_modal");
    const modal_content = document.getElementById("auth_modal--content");
    
    if(toClose){
        modal.setAttribute("data-show", "false");
        return
    }

    const AUTH_DATA = JSON.parse(localStorage.getItem(USER_TOKEN));

    // if user data is still valid
    if (Boolean(AUTH_DATA?.username))
    {
        modal_content.innerHTML = alreadySignedInTemplate(AUTH_DATA.username);
        modal.setAttribute("data-show", "true");
        initiateCloseModal(modal); // a working close modal
        listenForSignOut(signOut);
        return
    }
    
    if (type === 'signup'){
        modal_content.innerHTML = signUpTemplate;
        listenForSignup();
    }
    else {
        // Default to sign in
        modal_content.innerHTML = signInTemplate;
        listenForSignin();
    }

    modal.setAttribute("data-show", "true");
    listenForAuthSwitch();
}

export const resetAll = () =>{
    // localStorage.removeItem(USER_TOKEN);
    document.getElementById("auth").innerText = "Login";

    renderTodos(); // clear todos
    renderAuthModal();
}
