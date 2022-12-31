import io from 'socket.io-client';

const url = import.meta.env.VITE_SOCKET_URL;

if(!url){
    console.error("No Url specified");
}

const authSocket = io(`${url}/auth`);
const tasksSocket = io(`${url}/task`, {query:{ token: "sample"}});

export const USER_TOKEN = 'cpc-todi-token'; // locator on local storage
const PLATFORM = 'web';

const EVENTS = {
    connection:'connect',
    disconnection:'disconnect',
    connection_error:"connect_error",
    error:'error',
    reconnecting:"reconnecting",

    // Outgoing events
    create_account:'account:create',
    signin_account:'account:signin',
    create_task:'task:create',
    update_task:'task:update',
    delete_task:'task:delete',
    subscribe:'task:subscribe',
    subscribe:'task:unsubscribe',
    clear_completed_task:"task:clear-completed",

    // Incoming event
    incoming_tasks:"incoming:tasks",
    
}

// authSocket.on(EVENTS.connection, ()=>{
//     console.log("Auth socket Connected");
// })

// authSocket.on(EVENTS.connection_error, (error)=>{
//     console.log(error.stack)
//     console.log("Error in connection");
// })

// authSocket.on("disconnect", ()=>{
//     console.log("Auth socket Disonnected");
// })

// Task connection
tasksSocket.on(EVENTS.connection, ()=>{
    // console.log("Task socket Connected");

    tasksSocket.emit(EVENTS.subscribe);
    // console.log("Subscribed");
});


// Listen to task failed connection
export const registerTaskFailedConnectionListener = (cb)=>{
    // when just unable to connect
    tasksSocket.on(EVENTS.error, (err)=>{
        // console.log("Task socket error", err)
        cb()
    });
}

// Listen to task reconnection
export const registerTaskConnectionListener = (cb)=>{
    tasksSocket.on(EVENTS.connection_error, (err)=>{
        console.log("Tsk:connection error", err.message);
        cb(true);
    });

    tasksSocket.on(EVENTS.reconnecting, (count)=>{
        console.log("Tsk:reconnecting", count);
        cb(true)
    });
    tasksSocket.on(EVENTS.connection, ()=>{
        cb(false)
    });
}

// Listen to task updates
export const registerTasksUpdateListener = (cb)=>{
    tasksSocket.on(EVENTS.incoming_tasks, (payload)=>{
        cb(payload)
    });
}



export const authenticate = (data, mode, cb)=>{
    // Mode is either 'signin', 'signup'
    // Data for signin include username/email, password
    // Data for signup include username, email, password

    // authSocket = io('http://localhost:3000/user', {auth:{token:'sample token'}});
    

    // authSocket.on("connect", ()=>{});
    // Send for create account and signin_account
    if (mode === 'signup') {
        authSocket.emit(EVENTS.create_account, data, (payload)=> {
            cb({...payload, mode});
        });
    }

    else if (mode === 'signin') {
        authSocket.emit(EVENTS.signin_account, data, (payload)=> {
            cb({...payload, mode});
            // Disconnect
            // authSocket.disconnect();
        });
    }
}

// Reconnect maybe after signin
export const createTaskSocket = (token) =>{

    if(!token) return tasksSocket.disconnect();

    tasksSocket.query.token = token;
    // console.log(tasksSocket);
    tasksSocket.connect();
}

export const createTodo = (task) =>{
    // Create task is done on window load, so taskSocket is initialized

    tasksSocket.emit(EVENTS.create_task, task, PLATFORM);
}

export const updateTodo = (task, cb) =>{
    
    tasksSocket.emit(EVENTS.update_task, task, PLATFORM);
}

export const deleteTodo = (task_id, cb) =>{
    // Delete task
    tasksSocket.emit(EVENTS.delete_task, task_id);
}

export const clearCompletedTodo = (cb) =>{
    // Delete completed tasks

    tasksSocket.emit(EVENTS.clear_completed_task);
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