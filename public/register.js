let params = (new URL(document.location)).searchParams;
let order = [];

// For each prod, push the value to the array
params.forEach((value, key) => {
    if (key.startsWith('prod')) {
        order.push(parseInt(value));
    }
});
//console.log(JSON.stringify(order));

//gets the error from the url and checks to see if its empty or null, if not, fill in the message
let error = params.get('error');
if(error !== null && error !== ''){
    document.getElementById('errorMessages').innerHTML += `<div id="errorMessages" class="alert alert-danger">${error}</div>`;
}

//gets the params from url
let fullName = params.get('fullName');
let username = params.get('username');

//makes values sticky
if(username !== null){
    document.getElementById('email').value = username;
}

if(fullName !== null){
    document.getElementById('fullName').value = fullName;
}


// Set the value of the hidden input field to the JSON representation of the order array
document.getElementById('orderParams').value = JSON.stringify(order);
document.getElementById('orderReg').value = JSON.stringify(order);

//console.log(document.getElementById('orderParams').value);
