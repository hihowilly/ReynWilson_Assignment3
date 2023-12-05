//set up params from headder, order array, and error value
let params = (new URL(document.location)).searchParams;
let error;
let order = [];

//get if there was an error before
error = params.get('error');
//gets username from url
let username = params.get('username');
//console.log(username);
//fill order array with item ammounts from previous attempts
params.forEach((value,key) => {
    if (key.startsWith('prod')) {
            order.push(parseInt(value));
        }
});

//gets params from url
let fullName = params.get('fullName');
let totalOnline = params.get('totalOnline');
let thankYouMessage = params.get('thankYou');

//if the thankyoumessage appears, that means they finalized the purchase. show the modal
if(thankYouMessage == 'true'){
    console.log(thankYouMessage);
    $(document).ready(function(){
        $("#thanksModal").modal('show');
    });
}

//puts the fullName in the field
document.getElementById('fullNameHere').value = fullName;

//checks if username is not empty, if there is a username, populate it all and disable buttons
if(username !== null && fullName !== ''){
    //disable buttons
    document.getElementById('toIndex').addEventListener('click', function (event) {
        event.preventDefault();
      });
    document.getElementById('toStore').addEventListener('click', function (event) {
        event.preventDefault();
    });

    //sets the welcomeDiv, and adds the image and message depending on size 
    document.getElementById('WelcomeDiv').innerHTML += `<h3 class="text">Welcome ${fullName}!</h3>`;
    if(Number(totalOnline) == 1)
    {
        document.getElementById('WelcomeDiv').innerHTML += `<h5 class ="text">You are the only one shopping right now!</h5><br>`;
        document.getElementById('percyImage').innerHTML += `<img src="./images/PercyStore.png" alt="Product Image" width="250" height="250">`;
    }
    else{
        document.getElementById('WelcomeDiv').innerHTML += `<h5 class ="text">There are ${totalOnline} users shopping right now!</h5><br>`;
        document.getElementById('percyImage').innerHTML += `<img src="./images/PercyStore.png" alt="Product Image" width="250" height="250">`;
    }
    //fill hidden value
    document.getElementById('usernameEntered').value = username;

}

//if there is an error submitted, then show the error text in errorDiv
if(error == 'true'){
    
    document.getElementById('errorDiv').innerHTML += `<h2 class="text-danger">Input Error - Please Fix!</h2><br>`;
}

/*
For every product in the array:
    Create a card with the image on top
    Fill the card body with the title of the card found in products[i], so with price, aval, and total sold

    Create an input that oninput validates the quantity, a placeholder value of 0 
        The initial value found in the box can be populated if there is anything but 0 or undefined in order array for that position
    Create an area to define errors
    Run the validation to populate errors just incase an initial value is passed
*/
for (let i = 0; i < products.length; i++) {
    document.querySelector('.row').innerHTML += 
        `<div class="col-md-6 product_card mb-4">
        <div class="card">
            <div class="text-center">
                <img src="${products[i].image}" class="card-img-top border-top" alt="Product Image">
            </div>
            <div class="card-body">
                <h5 class="card-title">${products[i].card}</h5>
                <p class="card-text">
                    Price: $${(products[i].price).toFixed(2)}<br>
                    Available: ${products[i].qty_available}<br>
                    Total Sold: ${products[i].total_sold}
                </p>
                
                <input type="text" placeholder="0" name="quantity_textbox" id="${[i]}" class="form-control mb-2" oninput="validateQuantity(this)" value="${order[i] !== 0 && order[i] !== undefined ? order[i] : ''}" onload="validateQuantity(this)" style="border-color: black;">
                <p id="invalidQuantity${[i]}" class="text-danger"></p>
                </div>
            </div>
        </div>`
        validateQuantity(document.getElementById(`${[i]}`));
 ;}
//runs to generate a validation message
function validateQuantity(quantity) {
    // Set variables and grab the number from the quantity and set it to a number
    let valMessage = '';
    let quantityNumber = Number(quantity.value);
    let inputElement = document.getElementById(quantity.id);

    // Reset the border color to black before performing validation
    inputElement.style.borderColor = "black";


    // Check for validation errors and set the border color to red if an error is found
    if (isNaN(quantityNumber)) {
        valMessage = "Please Enter a Number";
        inputElement.style.borderColor = "red";
    } else if (quantityNumber < 0 && !Number.isInteger(quantityNumber)) {
        valMessage = "Please Enter a Positive Integer";
        inputElement.style.borderColor = "red";
    } else if (quantityNumber < 0) {
        valMessage = "Please Enter a Positive Value";
        inputElement.style.borderColor = "red";
    } else if (!Number.isInteger(quantityNumber)) {
        valMessage = "Please Enter an Integer";
        inputElement.style.borderColor = "red";
    } else if (quantityNumber > products[quantity.id]['qty_available']) {
        valMessage = "We Do Not Have " + quantityNumber + " Available!";
        inputElement.style.borderColor = "red";
        inputElement.value = products[quantity.id]['qty_available'];
    } else {
        valMessage = '';
    }

    // Set the valMessage to the innerHTML of the section
    document.getElementById(`invalidQuantity${quantity.id}`).innerHTML = valMessage;
}