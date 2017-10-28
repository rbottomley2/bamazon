// Require NPM packages
var mysql = require('mysql');
var inquirer = require('inquirer');

// Setup connection to SQL server
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Mhj23324!',
    database: 'bamazon_db'
});

// Set counter for total number of product types for sale at any given time
var numberOfProductTypes = 0;

// Connect to bamazon_DB
connection.connect(function(err) {
    // Throw error if it errors
    if (err) throw err;
    // New promise that selects all data from the table
    new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products', function(err, res) {
            if (err) reject(err);
            resolve(res);
            console.log('Welcome to Bamazon! Here Are Our Current Products For Sale:')
        });
        // Console log each item and increment the number of products
    }).then(function(result) {
        result.forEach(function(item) {
            numberOfProductTypes++;
            console.log('Item ID: ' + item.item_id + ' || Product Name: ' + item.product_name + ' || Price: ' + item.price);
        });
        // Enter the store
    }).then(function() {
        return enterStore();
        // catch errors
    }).catch(function(err) {
        console.log(err);
    });
});

// Function to enter the store
function enterStore() {
    inquirer.prompt([{
        name: 'enterstore',
        message: 'Would you like to shop at Bamazon?',
        type: 'list',
        choices: ['Yes', 'No']
    }]).then(function(answer) {
        // Go to the customer shopping menu if Yes
        if (answer.enterstore === 'Yes') {
            menu();
        } else {
            // Exist CLI if No
            console.log('Please come back soon! ');
            connection.destroy();
            return;
        }
    });
}

// Function for the menu options for the customer
function menu() {
    return inquirer.prompt([{
        name: 'item',
        message: 'Enter the item number of the product you would like to buy!',
        type: 'input',
        // Validator to ensure the product number is a number and it exists
        validate: function(value) {
            if ((isNaN(value) === false) && (value <= numberOfProductTypes)) {
                return true;
            } else {
                console.log('\nPlease enter a valid product ID.');
                return false;
            }
        }
    }, {
        name: 'quantity',
        message: 'How many would you like to buy?',
        type: 'input',
        // Validator to ensure it is number
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid quantity.');
                return false;
            }
        }
        // promise to pull current inventory from bamazon_DB
    }]).then(function(answer) {
        return new Promise(function(resolve, reject) {
            connection.query('SELECT * FROM products WHERE ?', { item_id: answer.item }, function(err, res) {
                if (err) reject(err);
                resolve(res);
            });
            // Then if selected quanitity is valid, save to a local object, else console log error
        }).then(function(result) {
            var savedData = {};

            if (parseInt(answer.quantity) <= parseInt(result[0].inventory_quantity)) {
                savedData.answer = answer;
                savedData.result = result;
            } else if (parseInt(answer.quantity) > parseInt(result[0].inventory_quantity)) {
                console.log('Insufficient quantity!');
            } else {
                console.log('An error occurred, exiting Bamazon, your order is not complete.');
            }
            
            return savedData;
            // Update the SQL DB and console log messages for completion.
        }).then(function(savedData) {
            if (savedData.answer) {
                var updatedQuantity = parseInt(savedData.result[0].inventory_quantity) - parseInt(savedData.answer.quantity);
                var itemId = savedData.answer.item;
                var totalCost = parseInt(savedData.result[0].price) * parseInt(savedData.answer.quantity);
                connection.query('UPDATE products SET ? WHERE ?', [{
                    inventory_quantity: updatedQuantity
                }, {
                    item_id: itemId
                }], function(err, res) {
                    if (err) throw err;
                    console.log('Your order total cost $' + totalCost + '. Thank you for shopping with Bamazon!');
                    connection.destroy();
                });
            } else {
                //  re-enter store
                enterStore();
            }
            // catch errors
        }).catch(function(err) {
            console.log(err);
            connection.destroy();
        });
        // catch errors
    }).catch(function(err) {
        console.log(err);
        connection.destroy();
    });
}
