// require the npm packages to be used
var mysql = require('mysql');
var inquirer = require('inquirer');

// connecting to the bamazon server
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Mhj23324!',
    database: 'bamazon_db'
});

// initialize the counter to track all product for sale
var numberOfProductTypes = 0;

// Connect to DB
connection.connect(function(err) {
    // Throw error if it errors
    if (err) throw err;
    // New promise that selects all data from the table
    new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products', function(err, res) {
            if (err) reject(err);
            resolve(res);
            console.log('Welcome to the Bamazon Store Manager!')
        });
    }).then(function(result) {
        // increment number of products based on DB
        result.forEach(function(item) {
            numberOfProductTypes++;
        });

        return enterStoreManager();
        // catch errors
    }).catch(function(err) {
        console.log(err);
    });
});

// Enter the manager prompt system
function enterStoreManager() {
    inquirer.prompt([{
        name: 'entrance',
        message: 'What would you like to do?',
        type: 'list',
        choices: ['View Products', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'EXIT']
    }]).then(function(answer) {
        switch (answer.entrance) {
            case 'View Products':
                productsForSale();
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                addProduct();
                break;
            case 'EXIT':
                console.log('Goodbye store manager!');
                connection.destroy();
                return;
                break;
            default:
                enterStoreManager();
                break
        };
    });
}

// Logs all items
function logItems(result) {
    result.forEach(function(item) {
        numberOfProductTypes++;
        console.log('Item ID: ' + item.item_id + ' || Product Name: ' + item.product_name + ' || Product Type: ' + item.product_type + ' || Price: ' + item.price + ' || Inventory: ' + item.inventory_quantity);
    });
}

// Function to show all products for sale from DB
function productsForSale() {
    return new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products', function(err, res) {
            if (err) reject(err);
            resolve(res);
        });
    }).then(function(result) {
        logItems(result);
    }).then(function() {
        enterStoreManager();
        // catch errors
    }).catch(function(err) {
        console.log(err);
        connection.destroy();
    });
}

// Grabs all items with an inventory below 3 only
function lowInventory() {
    return new Promise(function(resolve, reject) {
        connection.query('SELECT * FROM products WHERE stock_quantity < 3', function(err, res) {
            if (err) reject(err);
            resolve(res);
        });
    }).then(function(result) {
        logItems(result);
    }).then(function() {
        enterStoreManager();
        // catch errors
    }).catch(function(err) {
        console.log(err);
        connection.destroy();
    });
}

// Function to add inventory to SQL DB
function addInventory() {
    return inquirer.prompt([{
        name: 'item',
        message: 'Enter the item number of the product you would like to add stock to.',
        type: 'input',
        validate: function(value) {
            // Validator to ensure the product number is a number and it exists
            if ((isNaN(value) === false) && (value <= numberOfProductTypes)) {
                return true;
            } else {
                console.log('\nPlease enter a valid item ID.');
                return false;
            }
        }
    }, {
        name: 'quantity',
        message: 'How much stock would you like to add?',
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
    }]).then(function(answer) {
        return new Promise(function(resolve, reject) {
            connection.query('SELECT stock_quantity FROM products WHERE ?', { item_id: answer.item }, function(err, res) {
                if (err) reject(err);
                resolve(res);
            });
        }).then(function(result) {
            var updatedQuantity = parseInt(result[0].stock_quantity) + parseInt(answer.quantity);
            var itemId = answer.item
            connection.query('UPDATE products SET ? WHERE ?', [{
                stock_quantity: updatedQuantity
            }, {
                item_id: itemId
            }], function(err, res) {
                if (err) throw err;
                console.log('The total stock has been updated to: ' + updatedQuantity + '.');
                enterStoreManager();
            });
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

// Function to add a new product the DB
function addProduct() {
    return inquirer.prompt([{
        name: 'product',
        message: 'Enter the name of the product you would like to add.',
        type: 'input',
        // Validator to ensure it is not left blank
        validate: function(value) {
            if (value === '') {
                console.log('\nPlease enter a valid name.');
                return false;
            } else {
                return true;
            }
        }
    }, {
        name: 'producttype',
        message: 'Enter the Product Type (for example "electronics for TV").',
        type: 'input',
        // Validator to ensure it is not left blank
        validate: function(value) {
            if (value === '') {
                console.log('\nPlease enter a valid product type.');
                return false;
            } else {
                return true;
            }
        }
    }, {
        name: 'price',
        message: 'Enter the price of the product.',
        type: 'input',
        // Validator to ensure it is a valid number
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid price.');
                return false;
            }
        }
    }, {
        name: 'quantity',
        message: 'Enter the amount of initial stock quantity.',
        type: 'input',
        validate: function(value) {
            // Validator to ensure it is a valid number
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log('\nPlease enter a valid quantity.');
                return false;
            }
        }
    }]).then(function(answer) {
        // new promise to update DB
        return new Promise(function(resolve, reject) {
            connection.query('INSERT INTO products SET ?', [{
                product_name: answer.product,
                product_type: answer.producttype,
                price: answer.price,
                inventory_quantity: answer.quantity
            }], function(err, res) {
                if (err) reject(err);
                resolve(res);
            });
            // log message
        }).then(function() {
            console.log('The product has been added to the inventory.');
            enterStoreManager();
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
