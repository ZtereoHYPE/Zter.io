document.querySelector('#submitButton').addEventListener('click', () => {
    if (!document.querySelector('#usernameField').value) {
        alert('Please fill in the username field');
        return;
    }
    let username = document.querySelector('#usernameField').value;
    document.querySelector('#form').style.display = 'none';
    let mainScript = document.createElement('script');
    mainScript.type = 'text/javascript';
    mainScript.src = 'main.js';
    document.getElementsByTagName('body')[0].appendChild(mainScript);
})