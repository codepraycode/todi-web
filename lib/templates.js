export const alreadySignedInTemplate = `
        <span id="closeModal">+</span>

        <!-- Sign Out of account -->
        <div class="alsin">

            <h2>codepraycode</h2>

            <p class="info">You are already signed in</p>

            <button>
                Sign Out
            </button>
            
        </div>
    `

export const signUpTemplate = `
    <div>
        <h2>Sign in to account</h2>

        <div>
            <form id="auth_signin" action="">

                <div class="form_group">
                    <label 
                        for="usernameEmail"
                    >
                        Username/Email
                    </label>

                    <input 
                        type="text" 
                        name="usernameEmail" 
                        autocomplete="off" 
                    />
                </div>

                <div class="form_group">
                    <label 
                        for="password"
                    >
                        Password
                    </label>

                    <input 
                        type="password" 
                        name="password"
                    />
                </div>

                <button type="submit">
                    Sign In
                </button>

            </form>
        </div>

        <span class="alternative">
            Dont have an account? <a href="#" id="switchContent" data-nav="signIn">Create an account</a>
        </span>
    </div>
`

export const signInTemplate = `
    <div>
        <h2>Create an account</h2>
        <div class="authentication__content--signup">
            <form id="auth_signup" action="">

                <div class="form_group">
                    <label 
                        for="username"
                    >
                        Username
                    </label>

                    <input 
                        type="text" 
                        name="username" 
                        autocomplete="off" 
                    />
                </div>

                <div class="form_group">
                    <label 
                        for="email"
                    >
                        Email
                    </label>

                    <input 
                        type="email" 
                        name="email" 
                        autocomplete="off" 
                    />
                </div>

                <div class="form_group">
                    <label 
                        for="password"
                    >
                        Password
                    </label>

                    <input 
                        type="password" 
                        name="password"
                    />
                </div>

                <button type="submit">
                    Sign up
                </button>

            </form>
        </div>

        <span class="alternative">
            Already have an account? <a href="#" id="switchContent" data-nav="signUp">Sign in to account</a>
        </span>
    </div>
`
