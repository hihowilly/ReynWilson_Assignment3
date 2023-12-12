//initializes variables
let extendedPrices = [];
let extendedPrice = 0;
let subtotal = 0;
let taxAmount = 0;
let shipping = 0;



//opens the url params
let params = (new URL(document.location)).searchParams;
        //initializes empty order array

//for each prod, push the value to the array
/*params.forEach((value,key) => {
    if (key.startsWith('prod')) {
            order.push(parseInt(value));
        }
});*/

//Sets the parameters from the url

//gets params from cookies stored, if logged in, replace sign in with sign out
let signin = decodeURIComponent(getCookieValue('signIn'));
let username = decodeURIComponent(getCookieValue('username')); // Replace with your logic to get the username
let fullName = decodeURIComponent(getCookieValue('fName'));

document.addEventListener("DOMContentLoaded", function() {
    

    if (signin == 'true') {
        
        document.getElementById("loginPlaceholder").innerHTML = 
            `<form id="signOutForm" action="signOutKeepCart" method="POST">
            <button type="submit" class="text-button">Sign Out</button>
            </form>`;
    }
});

//gets the cookies for the products, if they are null fill in with 0's
let cards = decodeURIComponent(getCookieValue('card'));
let mat = decodeURIComponent(getCookieValue('mat'));
let boxes = decodeURIComponent(getCookieValue('box'));

if(cards == 'null'){
    console.log('here');
    cards = '0,0,0,0,0,0';
}
if(boxes == 'null'){
    boxes = '0,0,0,0,0,0';
}
if(mat == 'null'){
    mat = '0,0,0,0,0,0';
}

//append and create array to generate rows with
let totalString = boxes + ","+cards+","+mat;
let arrayString = totalString.split(",");
var order = arrayString.map(function(item) {
    return +item;
});
console.log(order);
//if the username is not empty or null, give them a welcome message depending on the total online
if(username !== null && username !== ''){
    document.getElementById('WelcomeDiv').innerHTML += `<br><br><br><h3 class="text">Welcome ${fullName}!</h3>`;

}



//fill the hidden values for the post to complete purchase
document.getElementById('orderInputComplete').value = JSON.stringify(order);


        //console.log(order);
    var numInCart = order.reduce(function(accumulator, currentValue) {
        return accumulator + currentValue;
    }, 0);
    

    document.getElementById('cartText').innerHTML = `View Cart (${numInCart})`;
//generate all the item rows
if(numInCart == 0){
    let table = document.getElementById("invoiceTable");
    table.innerHTML = '<h1>Cart Empty! Get Shopping!</h1>'

}
else{
    generateItemRows();
    

//validates textboxes
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('input[name="quantity_textbox"]').forEach(item => {
        item.addEventListener('input', function() {
            validateQuantityBox(this);
        });
    });
});

// calculate subtotal

//calculate tax
 let tax = (subtotal*0.0575);



 //checks the shipping price
 if(subtotal <= 50)
 {
     shipping = 2;
 }else if(subtotal <=100)
 {
     shipping = 5;
 }
 else{
     shipping = subtotal*.05;
 }
 
 //calculates total
 let total = tax+subtotal+shipping;
 
 
 //insert footer row values
 document.getElementById("subtotal_cell").innerHTML = "$" + subtotal.toFixed(2);
 document.getElementById("tax_cell").innerHTML = "$" + tax.toFixed(2);
 document.getElementById("shipping_cell").innerHTML = "$"+shipping.toFixed(2);
 document.getElementById("total_cell").innerHTML = "$"+total.toFixed(2);
 
 
}



//function to validate the quantity, returns a string if not a number, negative, not an integer, or a combination of both
//if no errors in quantity, returns empty string
function validateQuantity(quantity){
    if(isNaN(quantity)){
        return "Please Enter a Number";
    }else if (quantity<0 && !Number.isInteger(quantity)){
        return "Please Enter a Positive Integer";
    }else if (quantity <0){
        return "Please Enter a Positive Number";
    }else if(!Number.isInteger(quantity)){
        return "Please Enter an Integer";
    }else{
        return"";
    }

}


//generate all the item rows
function generateItemRows() {
    // Sets table to the invoice table on the HTML
    let table = document.getElementById("invoiceTable");

    // Initialize counters for each category
    let boxCount = 0, matCount = 0, cardCount = 0;

    // Initialize a variable to track if there are any errors
    let hasErrors = false;

    // Loop through each product
    for (let i = 0; i < products.length; i++) {
        let item = products[i];
        let itemQuantity = order[i];

        // Validate the quantity
        let validationMessage = validateQuantity(itemQuantity);

        let originalPosition;
            switch (item.type) {
                case 'box':
                    originalPosition = boxCount++;
                    break;
                case 'mat':
                    originalPosition = matCount++;
                    break;
                case 'card':
                    originalPosition = cardCount++;
                    break;
                default:
                    originalPosition = -1; // Handle unknown types if necessary
            }
            
        // If there is an error, skip this item
        if (validationMessage !== "") {
            hasErrors = true;
            let row = table.insertRow();
            row.insertCell(0).innerHTML = item.card;
            row.insertCell(1).innerHTML = validationMessage;
        } else if (itemQuantity > 0) {
            // Calculate the extended price and update subtotal
            extendedPrice = item.price * itemQuantity;
            subtotal += extendedPrice;

            // Determine the original position based on the item's type
            
            console.log(`${item.card}` + `${originalPosition}`);
            // Create a new row and insert the info
            let row = table.insertRow();
            row.insertCell(0).innerHTML = `<img src="${item.image}" class="img-small" name="img" data-toggle="popover" data-trigger="hover" data-content="${item.content}" data-placement="left">`;
            row.insertCell(1).innerHTML = item.card;
            row.insertCell(2).innerHTML = itemQuantity;
            row.insertCell(3).innerHTML = "$" + item.price.toFixed(2);
            row.insertCell(4).innerHTML = "$" + extendedPrice.toFixed(2);
            row.insertCell(5).innerHTML = `<div class="container mt-4 d-flex justify-content-center">
            <form action="updateCart" method="post" class="d-flex align-items-center">
                <!-- Hidden input for 'position/type' -->
                <input type="hidden" name="position" value="${originalPosition}" />
                <input type="hidden" name="type" value="${item.type}" />
        
                <p id="invalidQuantity${[i]}" class="text-danger"></p>
        
                <!-- Textbox -->
                <input type="text" value='${itemQuantity}' name="quantity_textbox" id="${[i]}" class="form-control" style="border-color: black; width: 60px; text-align: center;">
        
                <!-- Update Cart Button -->
                <button type="submit" class="btn btn-primary btn-sm" style="margin-left: 10px;">Update Cart</button>
            </form>
        </div>`;
        }
    }

    // Additional code if needed for handling errors or other logic
    if (hasErrors) {
        // Handle any actions required when there are errors
    }
}
function validateQuantityBox(quantity) {
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
    } else if ((quantityNumber) > products[quantity.id]['qty_available']) {
        valMessage = "We Do Not Have " + quantityNumber + " Available!";
        inputElement.style.borderColor = "red";
        inputElement.value = products[quantity.id]['qty_available'];
    } else {
        valMessage = '';
    }

    // Set the valMessage to the innerHTML of the section
    document.getElementById(`invalidQuantity${quantity.id}`).innerHTML = valMessage;
}

function getCookieValue(cookieName){
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++){
        let cookiePair = cookies[i].trim().split('=');
        if(cookiePair[0] === cookieName){
            return cookiePair[1]
        }
        
    }
    return null;
}