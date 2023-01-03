// UI displayed in DOM

export const alreadySignedInTemplate = (username) => `
        <span id="closeModal">+</span>

        <!-- Sign Out of account -->
        <div class="alsin">

            <h2>${username.toLowerCase()}</h2>

            <p class="info">You are already signed in</p>

            <button id="signOut">
                Sign Out
            </button>
            
        </div>
    `

export const taskTemplate = (task, index) => `
    <div class="task" id=${task._id} data-completed=${task.completed ? 'true': 'false'} draggable="true">
        <span class="checker" data-todo_index="${index}">
            <img src="/images/icon-check.svg" alt="checker"/>
        </span>

        <p data-todo_index="${index}">${task.task}</p>

        <span class="platform" title="This task was last updated on ${task.platform}">${task.platform || ''}</span>
        <span class="canceler" data-cancel_id="${task._id}"></span>
    </div>
`

export const signInTemplate = `
    <div>
        <h2>Sign in to account</h2>

        <div>
            <form id="authSignIn" action="">
                <p class="err" id="form_err"></p>
                <div class="form_group">                    

                    <input 
                        type="text" 
                        name="usernameEmail" 
                        autocomplete="off"
                        placeholder="enter your username or email"
                    />

                    <label 
                        for="usernameEmail"
                    >
                        Username/Email
                    </label>
                </div>

                <div class="form_group">

                    <input 
                        type="password" 
                        name="password"
                        placeholder="enter password"
                    />
                    <label 
                        for="password"
                    >
                        Password
                    </label>
                </div>

                <button type="submit" name="formButton">
                    Sign In
                </button>

            </form>
        </div>

        <span class="alternative">
            Dont have an account? <a href="#" id="switchContent" data-nav="signUp">Create an account</a>
        </span>
    </div>
`

export const signUpTemplate = `
    <div>
        <h2>Create an account</h2>
        <div class="authentication__content--signup">
            <form id="authSignUp">
                <p class="err" id="form_err"></p>
                <div class="form_group">
                    <input 
                        type="text" 
                        name="username" 
                        autocomplete="off" 
                        placeholder="Enter username"
                        required="true"
                    />
                    <label 
                        for="username"
                    >
                        Username
                    </label>
                </div>

                <div class="form_group">
                    <input 
                        type="email" 
                        name="email" 
                        autocomplete="off" 
                        placeholder="Enter Email"
                        required="true"
                    />
                    <label 
                        for="email"
                    >
                        Email
                    </label>
                </div>

                <div class="form_group">
                    <input 
                        type="password" 
                        name="password"
                        placeholder="Enter password"
                        required="true"
                    />
                    <label 
                        for="password"
                    >
                        Password
                    </label>
                </div>

                <button type="submit" name="formButton">
                    Sign up
                </button>

            </form>
        </div>

        <span class="alternative">
            Already have an account? <a href="#" id="switchContent" data-nav="signIn">Sign in to account</a>
        </span>
    </div>
`

// Render loading template
export const renderTodosTemplate = () => {

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
    // document.querySelector(".task-items").setAttribute('data-loading', 'true');

}

// Render loading template
export const renderTodosError = (message) => {

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

// Take a event watch over close modal when it is rendered to DOM
export const initiateCloseModal = (modal) =>{
    const closeBtn = document.getElementById("closeModal");
    
    closeBtn.addEventListener('click',(e)=>{
        e.preventDefault();

        modal.setAttribute("data-show", "false");
    })

}