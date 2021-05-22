let username;

function playGame() {
    username = document.querySelector('#usernameField').value
    if (!username) {
        alert('Please fill in the username field');
        return;
    }
    if (username.length > 16) {
        alert('Please enter a username between 1 and 16 characters.');
        return;
    }
    // username = document.querySelector('#usernameField').value;
    document.querySelector('.container').style.display = 'none';
    let mainScript = document.createElement('script');
    mainScript.type = 'text/javascript';
    mainScript.src = 'main.js';
    document.getElementsByTagName('body')[0].appendChild(mainScript);
}