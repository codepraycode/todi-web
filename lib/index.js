import '../scss/style.scss';
import { authenticate, clearCompletedTodo, createTaskSocket,createTodo,deleteTodo,disconnectAuth,updateTodo,USER_TOKEN } from './script';
import { alreadySignedInTemplate, signUpTemplate, signInTemplate,renderTodosTemplate, initiateCloseModal } from './templates';

let filter = 'all';
let todos = [];
// const AUTH_DATA = {
//     username: 'codepraycode',
//     password: 'letmein'
// }

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
        
        modal_content.innerHTML = alreadySignedInTemplate;
        modal.setAttribute("data-show", "true");
        initiateCloseModal(modal); // a working close modal

        listenForSignOut();
        return
    }
    
    if (type === 'signup'){
        modal_content.innerHTML = signUpTemplate;
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
            modal_content.innerHTML = signUpTemplate
        }
        else if (navTo === 'signIn') {
            modal_content.innerHTML = signInTemplate
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
                return;
            }

            document.getElementById("auth").innerText = data.username;

            
            localStorage.setItem(USER_TOKEN, JSON.stringify(data));

            renderAuthModal(null, true); // close Modal

            const {token} = data;

            createTaskSocket(token, (previous_user_tasks)=>{
                document.querySelector(".task-items").setAttribute('data-loading', 'false');
                todos = previous_user_tasks;
                all_filter.click();
            });

        });
    }

}

function listenForSignOut(){
    document.getElementById("signOut").addEventListener('click',(e)=>{
        localStorage.removeItem(USER_TOKEN);
        document.getElementById("auth").innerText = "Login";
        renderTodosTemplate();
        renderAuthModal();
        
    })
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

    renderTodosTemplate();

    document.getElementById("auth").addEventListener('click', (e)=>{
        e.preventDefault();
        
        renderAuthModal();
    });

    let data;

    try{
        data = JSON.parse(localStorage.getItem(USER_TOKEN));
    }catch{
        localStorage.removeItem(USER_TOKEN);
        data = null;
    }

    if (data){

        const {token} = data;
        disconnectAuth();
        document.getElementById("auth").innerText = data.username;

        createTaskSocket(token, (previous_user_tasks)=>{
            document.querySelector(".task-items").setAttribute('data-loading', 'false');

            todos = previous_user_tasks;
            all_filter.click();
        });

        return
    }

    // Otherwise
    document.getElementById("auth").innerText = "Login";
    renderAuthModal();

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

