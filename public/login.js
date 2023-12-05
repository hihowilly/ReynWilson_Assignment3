
let params = (new URL(document.location)).searchParams;
let order = [];

// For each prod, push the value to the array
params.forEach((value, key) => {
    if (key.startsWith('prod')) {
        order.push(parseInt(value));
    }
});
let error = params.get('error');
//gets the error from the url and checks to see if its empty or null, if not, fill in the message
if(error !== null && error !== ''){
    document.getElementById('errorMessages').innerHTML += `<div id="errorMessages" class="alert alert-danger">${error}</div>`;
}

//get the username from the url
let username = params.get('username');
//make it sticky
document.getElementById('username').value = username;
// Set the value of the hidden input field 
document.getElementById('orderInput').value = JSON.stringify(order);
document.getElementById('orderReg').value = JSON.stringify(order);
