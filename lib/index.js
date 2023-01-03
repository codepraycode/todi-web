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

import('./drag_n_drop');

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

