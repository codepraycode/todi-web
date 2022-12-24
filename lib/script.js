import { io } from 'socket.io-client';

const authSocket = io('http://localhost:3000/auth');
let tasksSocket;

export const USER_TOKEN = 'cpc-todi-token'; // locator on local storage


const EVENTS = {
    connection:'connect',
    disconnection:'disconnect',
    connection_error:"connect_error",

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
    clear_completed_task:"clear_completed_task",
}

// authSocket.on(EVENTS.connection, ()=>{
//     console.log("Auth socket Connected");
// })

// authSocket.on("disconnect", ()=>{
//     console.log("Auth socket Disonnected");
// })

export const disconnectAuth = () =>{
    if(!authSocket) return;

    authSocket.disconnect();
}

export const authenticate = (data, mode, cb)=>{
    // Mode is either 'signin', 'signup'
    // Data for signin include username/email, password
    // Data for signup include username, email, password

    // authSocket = io('http://localhost:3000/user', {auth:{token:'sample token'}});
    

    // authSocket.on("connect", ()=>{});
    // Send for create account and signin_account
    if (mode === 'signup') {
        authSocket.emit(EVENTS.create_account, data, (res)=> {
            cb(res);
            // Disconnect
            authSocket.disconnect();
        });
    }

    else if (mode === 'signin') {
        authSocket.emit(EVENTS.signin_account, data, (payload)=> {            
            cb(payload);
            // Disconnect
            authSocket.disconnect();
            
        });
    }
}

export const createTaskSocket = (token, cb) =>{

    

    tasksSocket = io('http://localhost:3000/task', { auth: { token }});

    // tasksSocket.on(EVENTS.connection, ()=>{
    //     console.log("Task socket Connected");
    // })

    // tasksSocket.on(EVENTS.connection_error, (err)=>{
    //     console.error(err);
    // })

    tasksSocket.emit(EVENTS.subscribe, (payload)=>{
        const { data:tasks } = payload; // data is all the user's tasks

        cb(tasks);
    });

    // // Listen to updates
    // tasksSocket.on(EVENTS.tasks_update,(payload)=>{
    //     console.log("Task update:", payload);
    // });

    // tasksSocket.on(EVENTS.delete_task,(payload)=>{
    //     console.log("Deleted task update:", payload);
    // })
}

export const createTodo = (task, cb) =>{
    // Create task is done on window load, so taskSocket is initialized
    const data = {
        task,
        platform:'web',
    }

    tasksSocket.emit(EVENTS.create_task, data, (payload)=> {
        cb(payload);
    });
}

export const updateTodo = (task, cb) =>{
    // Create task is done on window load, so taskSocket is initialized

    tasksSocket.emit(EVENTS.update_task, task, (payload)=> {
        // console.log("Updated task:", payload);
        cb(payload);
    });
}

export const deleteTodo = (task_id, cb) =>{
    // Delete task

    tasksSocket.emit(EVENTS.delete_task, task_id, (payload)=> {
        cb(payload);
    });
}

export const clearCompletedTodo = (cb) =>{
    // Delete task

    tasksSocket.emit(EVENTS.clear_completed_task, (payload)=> {
        cb(payload);
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