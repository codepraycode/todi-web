// Authentication Listeners

import { authenticate,createTaskSocket, USER_TOKEN } from "./script";

export function listenForAuthSwitch (){

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

export function listenForSignin(){
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
        
        handleAuth(userData, 'signin', form_data);
    }
}

export function listenForSignup(){
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

        handleAuth(userData, 'signup', form_data);
    }

}

export function listenForSignOut(signOutHandler){
    document.getElementById("signOut").addEventListener('click',signOutHandler);
}

const handleAuth = (userData, mode, form_data)=>{
    form_data.setAttribute('data-loading', 'true');
    form_data.formButton.innerText = mode === 'signin' ? "Signing In..." : "Signing Up...";
    form_data.formButton.setAttribute('type','button');

    document.getElementById("form_err").innerText = "";
    
    authenticate(userData, mode, handleAuthAcknowledgement);
}

const handleAuthAcknowledgement = (payload)=>{
    const {data, error, mode} = payload;

    if (error){
        console.error("Error occured:", error);
        // renderTodosError(error);
        document.getElementById("form_err").innerText = error;
        
        const form_data = document.getElementById(mode === 'signin' ? "authSignIn" : "authSignUp");
        form_data.setAttribute('data-loading', 'false');
        form_data.formButton.innerText = mode === 'signin' ? "Sign In" : "Sign Up";
        form_data.formButton.setAttribute('type','submit');
        return;
    }


    if(mode === 'signin'){
        document.getElementById("auth").innerText = data.username;

        localStorage.setItem(USER_TOKEN, JSON.stringify(data));

        // renderAuthModal(null, true); // close Modal
        document.getElementById("auth_modal").setAttribute("data-show", "false"); // close modal

        createTaskSocket();
    }
    else { // signup
        document.getElementById("switchContent").click();
        document.querySelector('input[name="usernameEmail"]').value = data.username;
    }

}


// Tasks Listeners

export const listenForTodosConnectionStatus = (connecting=true)=>{
    // connected: indicate if trying to reach server (short)
    if (connecting) document.querySelector(".task-items").setAttribute('data-loading', 'true');
    else document.querySelector(".task-items").setAttribute('data-loading', 'false');
}

export const listenForTodosConnectionFailed = (error, signOutHandler)=>{
    if (error === 'auth_error') return signOutHandler();
};


