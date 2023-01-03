import '../scss/style.scss';
import { listenForTodosConnectionStatus, 
        listenForTodosConnectionFailed
 } from './listeners';
import { renderAuthModal, renderTodos, resetAll } from './renderer';
import { 
    createTodo,
    registerTaskConnectionListener, registerTasksUpdateListener,
    registerTaskFailedConnectionListener, handleSignOut 
} from './script';


const signOut = ()=> handleSignOut(resetAll);

// Run when the browser is done loading
window.onload = (e) => {
    // Run function when the browser loads

    renderTodos();

    document.getElementById("auth").addEventListener('click', (e)=>{
        e.preventDefault();
        
        renderAuthModal();
    });

    registerTaskConnectionListener(listenForTodosConnectionStatus);
    registerTasksUpdateListener((payload) => renderTodos(payload));
    registerTaskFailedConnectionListener((error)=> listenForTodosConnectionFailed(error, signOut));

}

// =============== Tasks Feature ====================
const taskInputForm = document.getElementById("taskInput");

taskInputForm.onsubmit = (e) => {
    e.preventDefault();

    const enteredTask = document.querySelector("[name='new_task']");

    const task = enteredTask.value;

    createTodo(task);

    enteredTask.value = '';
};
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

