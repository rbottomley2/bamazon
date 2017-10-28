// Creating Bamazon Database
CREATE DATABASE bamazon_DB;

//Allowing MYSQL to use the database
USE bamazon_DB;

//Creating the Table to house the Bamazon products to contain columns for item_id, product, product category, prince, and inventory
CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  product_type VARCHAR(45) NOT NULL,
  price INT default 0,
  inventory_quantity INT default 0,
  PRIMARY KEY (item_id)
);

// populate the product database
INSERT INTO products(product_name, product_type, price, inventory_quantity)
VALUES ('tv', 'electronics', 500, 10),
	     ('ipad', 'electronics', 250, 5),
       ('coffee table', 'furniture', 500, 20),
       ('guitar', 'music', 500, 10),
       ('laptop', 'electronics', 1000, 3),
       ('headphones', 'electronics', 75, 50),
       ('boxing gloves', 'sporting goods', 300, 10),
       ('bed', 'bedding', 1200, 6),
       ('pillow', 'bedding', 15, 30),
       ('cd', 'relics', 8, 1000);

// Command to View all products for sale in bamazon_DB
SELECT * FROM products;