import { io } from 'socket.io-client';

const authSocket = io('http://localhost:3000/auth');
let tasksSocket;

let USER_ID; // token
const USER_TOKEN = 'cpc-todo-store';

const EVENTS = {
    connection:'connection',

    // Custom events
    create_account:'create_account',
    signin_account:'signin_account',
    create_task:'create_task',
    update_task:'update_task',
    delete_task:'delete_task',
    subscribe:'subscribe',

    // Outward event
    tasks_update:"tasks_update",
    remove_task:"remove_task",
}

export const authenticate = (data, mode, cb)=>{
    // Mode is either 'signin', 'signup'
    // Data for signin include username/email, password
    // Data for signup include username, email, password

    // authSocket = io('http://localhost:3000/user', {auth:{token:'sample token'}});
    

    // authSocket.on("connect", ()=>{});
    // Send for create account and signin_account
    if (mode === 'signin') {
        authSocket.emit(EVENTS.create_account, data, (res)=> {
            cb(res);
            // Disconnect
            authSocket.disconnect();
        });
    }

    else if (mode === 'signup') {
        authSocket.emit(EVENTS.signin_account, data, (token)=> {
            // Save token
            localStorage.setItem(USER_TOKEN, toString(token));
            cb(token);
            // Disconnect
            authSocket.disconnect();
            
        });
    }
}

export const createTaskSocket = () =>{
    if(Boolean(tasksSocket)) return

    const token = localStorage.getItem(USER_TOKEN);
    tasksSocket = io('http://localhost:3000/task', { auth: { token }});

    tasksSocket.emit(EVENTS.subscribe, (payload)=>{
        const { data:tasks } = payload; // data is all the user's tasks

        console.log(tasks);
    });

    // Listen to updates
    tasksSocket.on(EVENTS.tasks_update,(payload)=>{
        console.log("Task update:", payload);
    });

    tasksSocket.on(EVENTS.delete_task,(payload)=>{
        console.log("Deleted task update:", payload);
    })
}

export const createTodo = (task) =>{
    // Create task is done on window load, so taskSocket is initialized

    tasksSocket.emit(EVENTS.create_task, task, (payload)=> {
        console.log("Created task:", payload);
    });
}

export const updateTodo = (task) =>{
    // Create task is done on window load, so taskSocket is initialized

    tasksSocket.emit(EVENTS.update_task, task, (payload)=> {
        console.log("Updated task:", payload);
    });
}

export const deleteTodo = (task_id) =>{
    // Create task is done on window load, so taskSocket is initialized

    tasksSocket.emit(EVENTS.delete_task, task_id, (payload)=> {
        console.log("Deleted task:", payload);
    });
}


// let count = 0;
// setInterval(()=>{
//   // This continues from where is stoped
//   // socket.emit("ping", ++count, (msg)=>console.log(msg));

//   // This restart discarding all previous messages
//   socket.volatile.emit("ping", ++count, (msg)=>console.log(msg));
// }, 1000);

// document.addEventListener('keydown', e=>{
//   if (e.target.matches('input')) return

//   if (e.key === 'c') socket.connect();
//   if (e.key === 'd') socket.disconnect();
// })