let username;
document.querySelector('#submitButton').addEventListener('click', playGame)

function playGame() {
    if (!document.querySelector('#usernameField').value) {
        alert('Please fill in the username field');
        return;
    }
    username = document.querySelector('#usernameField').value;
    document.querySelector('.container').style.display = 'none';
    let mainScript = document.createElement('script');
    mainScript.type = 'text/javascript';
    mainScript.src = 'main.js';
    document.getElementsByTagName('body')[0].appendChild(mainScript);
}