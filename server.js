// Importing the Express.js framework 
const express = require('express');
// Create an instance of the Express application called "app"
// app will be used to define routes, handle requests, etc
const app = express();
const fs = require('fs');
//gets crypto for password
const crypto = require('crypto');
app.use(express.urlencoded({ extended: true }));
//reads rockyou.txt for compromised passwords
const DirtyrockYouPasswords = fs.readFileSync('rockyou.txt', 'utf-8').split('\n');
const rockYouPasswords =  DirtyrockYouPasswords.map(str => str.replace(/\r/g, ''));
//grabs everything from public


let filename = __dirname + '/user_data.json';

let user_reg_data;

//this is the array that tracks user login status
let loginUsers = [];

if (fs.existsSync(filename)) {
    let data = fs.readFileSync(filename, 'utf-8');
    user_reg_data = JSON.parse(data);
    //console.log(user_reg_data);

    let stats = fs.statSync(filename);
    let fileSize = stats.size;
    console.log(`user_data.json has loaded with ${fileSize} characters`);
} else {
    console.log(`The filename ${filename} does not exist`);
}

//sets up the product array from the json file
let products = require(__dirname + '/products.json');
products.forEach( (prod,i) => {prod.total_sold = 0});



// Define a route for handling a GET request to a path that matches "./products.js"
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    let products_str = `var products = ${JSON.stringify(products)};`;
    //console.log(products_str);
    response.send(products_str);
});

//this is called when someone wants to access invoice.html, lets check if they are signed in
app.get('/invoice.html', function (request, response) {
    let username_input = request.query['username'];
    //console.log(loginUsers);
    //console.log(username_input);

    //if the username is in the signed in, they would be in the array, send them 
    if(loginUsers.includes(username_input)){
        response.sendFile(__dirname + '/public/invoice.html'); 
    
    }
    else{
        //if not, bring them to the store with an error so they can make a purchase
        response.redirect(
            `/store.html?&error=true`
          );
    }
});
//now we can use public
app.use(express.static(__dirname + '/public'));

//this is called when someone wants to login on login.html
app.post('/login', function (request, response) {
    //fills params
    let username_input = request.body['username'];
    let password_input = request.body['password'];
    let orderParams = request.body['order'];
    //console.log(request.body);
    //console.log(typeof orderParams);
    let response_msg = '';
    let errors = false;
  
    let storedUserData;
    //generate the url for the order
    let url = generateProductURL(orderParams);
  
    //console.log(url);
  
    //if there is an account, check if passwords
    if (typeof user_reg_data[username_input.toLowerCase()] !== 'undefined') {
      storedUserData = user_reg_data[username_input.toLowerCase()];
  
      // Verify the provided password against the stored hash and salt
      const passwordMatch = verifyPassword(
        password_input,
        storedUserData.salt,
        storedUserData.password
      );
  
      //old disregard
      if (passwordMatch) {
        response_msg = `${storedUserData.username} is logged in`;
      } else {
        //set the errors to true if the passwords do not match
        response_msg = 'Incorrect Password';
        errors = true;
      }
    } else {
      //if the usernames do not match, it does not exist
      response_msg = `${username_input} does not exist`;
      errors = true;
    }
    //if there are no errors, add the username to loginUsers
    if (!errors) {
        if(!loginUsers.includes(username_input)){
            loginUsers.push(username_input);
        }
        //console.log(loginUsers);
        
        
        //console.log(storedUserData);

        //redirect with all the params
        response.redirect(
        `/invoice.html?` +
          url +
          `&username=${username_input}` +
          `&totalOnline=${loginUsers.length}` +
          `&fullName=${storedUserData.fullName}`
      );
    } else {
      // Include entered username in the query string for sticky form
      response.redirect(
        `/login.html?` +
          url +
          `&error=${response_msg}&username=${username_input}`
      );
    }
  });

//redirects user to register with the order in the url
app.post("/toRegister", function (request, response) {
    let orderParams = request.body['order'];
    //console.log(orderParams);
    let url = generateProductURL(orderParams);

    response.redirect(`/register.html?`+url);
});

//redirects user to login with the order in the url
app.post("/toLogin", function (request, response) {
  let orderParams = request.body['order'];
  //console.log(orderParams);
  let url = generateProductURL(orderParams);

  response.redirect(`/login.html?`+url);
});

//this is the register when a user wants to register
app.post('/register', function (request, response) {
    let errorString = '';
  
    //generate url string from order
    let orderParams = request.body['order'];
    console.log(orderParams);
    let url = generateProductURL(orderParams);
    
  
    // Validate email address
    const existingEmail = Object.keys(user_reg_data).find(
        (email) => email.toLowerCase() === request.body.email.toLowerCase()
      );
    //if the email exists
    if (existingEmail) {
      errorString += 'Email Address Already Exists! ';
    }
    // if the email does not follow formatting requirements 
    if (!/^[A-Za-z0-9_.]+@[A-Za-z0-9.]{2,}\.[A-Za-z]{2,3}$/.test(request.body.email)) {
      errorString += 'Invalid Email Address Format! ';
    }
  
    // Validate password
    if (request.body.password !== request.body.repeat_password) {
      errorString += 'Passwords Do Not Match! ';
    }
    // if password is not long enough
    if (request.body.password.length < 10 || request.body.password.length > 16) {
      errorString += 'Password Length Should Be Between 10 and 16 Characters! ';
    }
  
    // Require at least one number and one special character in the password
    if (!/\d/.test(request.body.password) || !/[!@#$%^&*]/.test(request.body.password)) {
      errorString += 'Password must contain at least one number and one special character! ';
    }
    //if password is located in rockYouPasswords.txt
    if(rockYouPasswords.includes(request.body.password)){
        errorString += 'Password is Not Safe! ';
    }
    //if the full name does not follow regulations
    if (!/^[A-Za-z ]{2,30}$/.test(request.body.fullName)) {
      errorString += 'Invalid Full Name Format';
    }
  
    //if there are no errors, start the user creation proccess
    if (errorString === '') {
      const new_user = request.body.email.toLowerCase();
  
      // Consulted Chet and some external sites on salt and hashing
      const { salt, hash } = hashPassword(request.body.password);
    
      user_reg_data[new_user] = {
        password: hash, // Store the hashed password
        salt: salt,     // Store the salt
        fullName: request.body.fullName,
        //email: request.body.email.toLowerCase(), // Store email in lowercase
      };
      loginUsers.push(new_user);
      // Write user data to file (you may want to use async writeFile for better performance)
      fs.writeFileSync(filename, JSON.stringify(user_reg_data), 'utf-8');
      //bring them to the invoice
      response.redirect(`/invoice.html?`+ url + `&username=${new_user}`+`&totalOnline=${loginUsers.length}`+`&fullName=${request.body.fullName}`);
    } else {
      //send them to register with the url and the information to make it sticky along with the error
      response.redirect(`/register.html?`+ url +`&username=${request.body.email}&fullName=${request.body.fullName}&error=${errorString}`);
    }
  });
  
   

//returns user to store with email and first name in params for personalization and the order for stickyness
app.post("/return_to_store", function (request, response) {
    let username = request.body[`username`];
    let orderParams = request.body['order'];

    let url = generateProductURL(orderParams);

    response.redirect(`/store.html?`+ url + `&username=${username}` + `&totalOnline=${loginUsers.length}`+`&fullName=${request.body.fullName}`);

});

//update the total sold and quantity avalible 
app.post("/complete_purchase", function (request, response) {
    let orderParams = request.body['order'];
    let orderArray = JSON.parse(orderParams);
    let username = request.body['username'];
    for (i in orderArray)
        {
            //update total and qty only if everything is good
            products[i]['total_sold'] += orderArray[i];
            products[i]['qty_available'] -= orderArray[i];
        }
        //log out user
        loginUsers.pop(username);
        //console.log(loginUsers);
    response.redirect('/store.html?&thankYou=true');
});

//whenever a post with proccess form is recieved
app.post("/process_form", function (request, response) {

    let username = request.body[`username`];
    //console.log(loginUsers);
    //get the textbox inputs in an array
    let qtys = request.body[`quantity_textbox`];
    //console.log(request.body)
    //initially set the valid check to true
    let valid = true;
    //instantiate an empty string to hold the url
    let url = '';
    let soldArray =[];

    //for each member of qtys
    for (i in qtys) {
        
        //set q as the number
        let q = Number(qtys[i]);
        
        //console.log(validateQuantity(q));
        //if the validate quantity string is empty
        if (validateQuantity(q)=='') {
            //check if we will go into the negative if we buy this, set valid to false if so
            if(products[i]['qty_available'] - Number(q) < 0){
                valid = false;
                url += `&prod${i}=${q}`
            }
            // otherwise, add to total sold, and subtract from available
            else{
               
                soldArray[i] = Number(q);
                
                //add argument to url
                url += `&prod${i}=${q}`
            }
            
            
        }
        //if the validate quantity string has stuff in it, set valid to false
         else {
            
            valid = false;
            url += `&prod${i}=${q}`
        }
        //check if no products were bought, set valid to false if so
        if(url == `&prod0=0&prod1=0&prod2=0&prod3=0&prod4=0&prod5=0`){
            valid = false
        }
    }

    //if its false, return to the store with error=true
    if(valid == false)
    {
       
        response.redirect(`store.html?error=true` + url + `&username=${username}`+ `&totalOnline=${loginUsers.length}`+`&fullName=${request.body.fullName}`);
        
        
    }
    //otherwise, redirect to the invoice with the url attached
    else{

        const lowercaseArray = loginUsers.map(item => item.toLowerCase());
        const lowercaseSearchString = username.toLowerCase();

        if (lowercaseArray.includes(lowercaseSearchString)) {
        
            response.redirect('invoice.html?' + url + `&username=${username}`+`&totalOnline=${loginUsers.length}`+`&fullName=${request.body.fullName}`);
        
        }
        else{

            response.redirect('login.html?' + url + '&error=&username=');
        }
    }
 });

// Route all other GET requests to serve static files from a directory named "public"

app.all('*', function (request, response, next) {
    //console.log(request.method + ' to ' + request.path);
    next();
 });

// Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));

//function to validate the quantity, returns a string if not a number, negative, not an integer, or a combination of both
//if no errors in quantity, returns empty string
function validateQuantity(quantity){
    //console.log(quantity);
    if(isNaN(quantity)){
        return "Not a Number";
    }else if (quantity<0 && !Number.isInteger(quantity)){
        return "Negative Inventory & Not an Integer";
    }else if (quantity <0){
        return "Negative Inventory";
    }else if(!Number.isInteger(quantity)){
        return "Not an Integer";
    }else{
        return"";
    }


}

//takes in the string taken from the request, and makes it to an array, and then puts it back to a string but in the way that it can be read in the url as multiple variables
function generateProductURL(orderString){
    let orderArray = JSON.parse(orderString);
    let orderURL = ``;
    for(i in orderArray){
        orderURL += `&prod${i}=${orderArray[i]}`

    }
    return orderURL;
}

//generate the salt and hash for the password provided, if someone wants to crack it they need both the hash and the salt
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex'); // Generate a random salt
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
  }
  
  // Function to verify a password against a hash and salt
  function verifyPassword(password, salt, storedHash) {
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === storedHash;
  }

