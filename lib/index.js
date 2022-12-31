import '../scss/style.scss';
import { 
    authenticate, clearCompletedTodo, 
    createTaskSocket, createTodo,
    deleteTodo, updateTodo,
    registerTaskConnectionListener, registerTasksUpdateListener,
    registerTaskFailedConnectionListener, USER_TOKEN } from './script';

import { alreadySignedInTemplate, signUpTemplate, signInTemplate,renderTodosTemplate, initiateCloseModal, taskTemplate } from './templates';

let filter = 'all';
let todos = [];

// Keep a watch over all todos, and responed to any event on them
// Features: delete todo and update todo
const listenForTasksUpdate = (payload)=>{
    // payload is the tasks
    todos = payload;
    renderTodos();
};

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

// Render all todos in DOM
// Receives all the todos to render
const renderTodos = () => {

    if (todos.length < 1) return renderTodosTemplate();

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

    document.querySelector("[data--indicator]").innerHTML = `${filteredTodo.length} item${filteredTodo.length > 1 ? 's':''} left`;

}

const renderAuthModal = (type=null, close=false) =>{    
    const modal = document.getElementById("auth_modal");
    const modal_content = document.getElementById("auth_modal--content");
    if(close){
        modal.setAttribute("data-show", "false");
        return
    }

    const AUTH_DATA = JSON.parse(localStorage.getItem(USER_TOKEN));

    if (Boolean(AUTH_DATA?.username))
    {
        modal_content.innerHTML = alreadySignedInTemplate(AUTH_DATA.username);
        modal.setAttribute("data-show", "true");
        initiateCloseModal(modal); // a working close modal
        listenForSignOut();
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

function listenForAuthSwitch (){

    document.getElementById("switchContent").addEventListener('click',(e)=>{
        e.preventDefault();
        // console.log(e.target.dataset);
        const modal_content = document.getElementById("auth_modal--content");
        const navTo = e.target.dataset.nav;        
        // Switch content
        if (navTo === 'signUp') {
            modal_content.innerHTML = signUpTemplate;
            listenForSignup();
        }
        else if (navTo === 'signIn') {
            modal_content.innerHTML = signInTemplate;
            listenForSignin();
        };

        listenForAuthSwitch();
    });
}

function listenForSignin(){
    const form = document.getElementById("authSignIn");

    form.onsubmit = (e) =>{
        e.preventDefault();
        const form_data = e.target;

        const username = form_data.usernameEmail.value;
        const password = form_data.password.value;

        const userData = {
            username,
            password
        };

        form_data.setAttribute('data-loading', 'true');
        form_data.signInButton.innerText = "Signing In..."
        form_data.signInButton.setAttribute('type','button');

        document.getElementById("form_err").innerText = "";
        
        authenticate(userData, 'signin', (res)=>{
            const {data, error} = res;

            if (error){
                console.error("Error occured:", error);
                // renderTodosError(error);
                document.getElementById("form_err").innerText = error;
                
                form_data.setAttribute('data-loading', 'false');
                form_data.signInButton.innerText = "Sign In";
                form_data.signInButton.setAttribute('type','submit');
                return;
            }

            document.getElementById("auth").innerText = data.username;

            localStorage.setItem(USER_TOKEN, JSON.stringify(data));

            renderAuthModal(null, true); // close Modal

            const {token} = data;

            createTaskSocket(token);

        });
    }
}

const listenForTodosConnectionStatus = (connecting=true)=>{
    // connected: indicate if trying to reach server (short)
    if (connecting) document.querySelector(".task-items").setAttribute('data-loading', 'true');
    else document.querySelector(".task-items").setAttribute('data-loading', 'false');
}

const listenForTodosConnectionFailed = ()=>{
    return signOut();
}




function listenForSignup(){
    const form = document.getElementById("authSignUp");

    form.onsubmit = (e) =>{
        e.preventDefault();
        const form_data = e.target;

        const username = form_data.username.value;
        const email = form_data.email.value;
        const password = form_data.password.value;

        const userData = {
            username,
            email,
            password
        };

        form_data.setAttribute('data-loading', 'true');
        form_data.signUpButton.innerText = "Signing Up..."
        form_data.signUpButton.setAttribute('type','button');

        document.getElementById("form_err").innerText = "";

        authenticate(userData, 'signup', (res)=>{

            const {data, error} = res;

            if (error){
                console.error("Error occured:", error);
                // renderTodosError(error);
                document.getElementById("form_err").innerText = error;
                form_data.setAttribute('data-loading', 'false');
                form_data.signUpButton.innerText = "Sign Up"
                form_data.signUpButton.setAttribute('type','submit');
                return;
            }

            document.getElementById("switchContent").click();
            document.querySelector('input[name="usernameEmail"]').value = data.username;

        });
    }

}

const signOut = ()=>{
    localStorage.removeItem(USER_TOKEN);
    document.getElementById("auth").innerText = "Login";
    todos = []

    renderTodos();
    renderAuthModal();
}

function listenForSignOut(){
    document.getElementById("signOut").addEventListener('click',signOut);
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

function ensureAuthentication(){
    // Check for auth
    // if user data exist, connect and fetch data
    // otherwise authenticate
    let authdata = null;

    try{
        authdata = JSON.parse(localStorage.getItem(USER_TOKEN));
    }catch{ // cannot resolve cached auth data
        // remove whatever is there
        localStorage.removeItem(USER_TOKEN);
        renderAuthModal(); // render auth
        return;
    }

    // if not authdata, render auth
    if(!authdata){
        renderAuthModal(); // render auth
        return;
    }

    // if there is authdata
     const {token} = authdata; // get user token

    if (!token ) { // if user token is absent
        localStorage.removeItem(USER_TOKEN); // remove auth data
        document.getElementById("auth").innerText = "Login";
        renderAuthModal(); // render auth
        return
    }

    // at this point, all is set from cache
    document.getElementById("auth").innerText = authdata.username;
    
    createTaskSocket(token); // try reconnect
}


// Run when the browser is done loading
window.onload = (e) => {
    // Run function when the browser loads

    renderTodos();

    document.getElementById("auth").addEventListener('click', (e)=>{
        e.preventDefault();
        
        renderAuthModal();
    });

    ensureAuthentication();

    registerTaskConnectionListener(listenForTodosConnectionStatus);
    registerTasksUpdateListener(listenForTasksUpdate);
    registerTaskFailedConnectionListener(listenForTodosConnectionFailed);

}

// =============== Tasks Feature ====================
const taskInputForm = document.getElementById("taskInput");

taskInputForm.onsubmit = (e) => {
    e.preventDefault();

    // console.log(e.form);

    const enteredTask = document.querySelector("[name='new_task']");

    const task = enteredTask.value;

    createTodo(task);

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

    clearCompletedTodo();
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

