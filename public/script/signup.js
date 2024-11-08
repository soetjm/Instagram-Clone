   
function id(elemnt){
    return document.getElementById(elemnt);
}
let form=id("signupForm");
let sign_up=id("signup");
sign_up.disabled=true;
let inputs=form.querySelectorAll('input');
function checkForm(){
    let allFilled=true;
    inputs.forEach(input=>{
        if(input.value === ''){
            allFilled=false;
        }
    });
    if(allFilled){
        sign_up.style.opacity=1;
        sign_up.style.cursor="pointer"
        sign_up.disabled=false;
    }else{
        sign_up.style.opacity=0.8; 
        sign_up.style.cursor=""  
    }
}

inputs.forEach(input=>{
    input.addEventListener('input',checkForm);
})

checkForm();


  
        