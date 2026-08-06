# Singapore Hawker Management System Overview

This system that connects NEA, operators, stall owners, and customers, granting users varying accessibiltiy according to their user roles using JWT. (TBC)

## Basic Packages to Install

- **Installation of Express, Dotenv, MSSQL, express-session, JWT, bcrypt**

```bash
npm install express mssql joi dotenv express-session jsonwebtoken bcryptjs
```

- **Installation of JEST**

```bash
npm install --save-dev jest
```

- **Installation the Swagger**

This defines the API's endpoints, data models, and responses, for easier understanding and interact with our API.

```bash
npm install swagger-autogen swagger-ui-express
```

## Assumptions

- Stall owner is the same as vendor in attribute name only.
- Only menu items that aren't referenced by Order and OrderHistory objects can be deleted
- A stall owner can only own one stall

## Features Implemented

- ### Goh Si Ying S10272269B
  - #### GET menu items as Vendor

    ```javascript
    router.get(
      "/api/menuItems",
      verifyJWT,
      authorise("vendor"),
      menuItemController.getAllMenuItems,
    );
    ```

    Unit Testing:<br>
    menuItem.getAllMenuItemsByStallId<br>
    √ should retrieve all menu items for the specified stall (4 ms)<br>
    √ should return an empty array when the stall has no menu items (1 ms)<br>
    √ should handle database errors when retrieving menu items (35 ms)<br>
    √ should throw an error when stall ID is invalid (11 ms)<br>

  - #### POST menu items as Vendor

    ```javascript
    router.post(
      "/api/menuItems",
      verifyJWT,
      authorise("vendor"),
      validateCreateMenuItem,
      menuItemController.createMenuItem,
    );
    ```

    Unit Testing:<br>
    menuItem.createMenuItem<br>
    √ should create a menu item successfully (1 ms)<br>
    √ should return false when menu item is not created (1 ms)<br>
    √ should throw an error when menu item data is null (3 ms)<br>
    √ should throw an error when menu item data is undefined (2 ms)<br>
    √ should throw a database error when stall ID is missing (4 ms)<br>
    √ should throw database error when creating menu item (3 ms)<br>

  - #### PUT menu items as Vendor

    By selecting the edit button beside the menu item card, the vendor is able to edit their menu item. Some of the error handling includes the rejecting duplicated menu item names, which returns a status code of 409.

    ```javascript
    router.put(
      "/api/menuItems/:id",
      verifyJWT,
      authorise("vendor"),
      validateMenuItemId,
      validateMenuItem,
      menuItemController.updateMenuItem,
    );
    ```

    Unit Testing:<br>  
    menuItem.updateMenuItem<br>
    √ should update the menu item successfully (1 ms)<br>
    √ should return null when menu item does not exist (1 ms)<br>
    √ should throw an error when menu item is null (4 ms)<br>
    √ should throw an error when stall ID is null (3 ms)<br>
    √ should throw database error (2 ms)<br>

  - #### DELETE menu items as Vendor

    The system only allow deletion of menu items that are not tied to past orders or order history to ensure that patron records remain accurate and complete. While ‘soft deleting’ menu items is technically possible, it means the system must constantly calculate and filter out inactive items. This adds unnecessary overhead to reporting and daily operations occuring in the vendor dashboard, increasing costs and slowing down performance. By restricting deletion to unused items, the menu table is kept clean for daily operations while guaranteeing that historical data stays reliable for accounting, customer service, and business insights.

    ```javascript
    router.delete(
      "/api/menuItems/:id",
      verifyJWT,
      authorise("vendor"),
      validateMenuItemId,
      menuItemController.deleteMenuItem,
    );
    ```

    Unit Testing:<br>
    menuItem.deleteMenuItem<br>
    √ should delete the specified menu item (5 ms)<br>
    √ should return false when the menu item does not exist<br>
    √ should throw database error when deleting menu item (5 ms)<br>
    √ should throw an error when item ID or stall ID is invalid (3 ms)<br>

  - #### PUT menu item visibility as Vendor
    ```javascript
    router.put(
      "/api/menuItems/:id/visibility",
      verifyJWT,
      authorise("vendor"),
      validateMenuItemId,
      validateVisibility,
      menuItemController.updateMenuItemVisibility,
    );
    ```
    Unit Testing:<br>
    menuItem.updateMenuItemVisibility<br>
    √ should update the visibility of the specified menu item<br>
    √ should return false when the menu item does not exist<br>
    √ should throw database error when updating menu item visibility (5 ms)<br>
    √ should throw an error when item ID or stall ID is invalid (3 ms)<br>

- ### Tan Yi Ru Priscilla
  - GET – View patron homepage which includes a list of stalls as Patron.
  - GET – View stall menus as Patron.
  - GET – View patron profile which includes account information as Patron.
  - GET – View patron’s current cart items on the stall menu page as Patron.
  - GET – View all stored Visa cards.
  - GET – View the Visa card selected as the default card for stored Visa cards.
  - GET – View a specific Visa card by card id.
  - POST – Log in as Patron, Vendor, Operator and NEA Officer.
  - POST – Register for an account as Patron, Vendor, Operator and NEA Officer.
  - POST – Find account as Patron, Vendor, Operator and NEA Officer before resetting password.
  - POST – Confirm account as Patron, Vendor, Operator and NEA Officer before resetting password.
  - POST – Reset password as Patron, Vendor, Operator and NEA Officer.
  - POST – Generate a new access token using the refresh token once the current access token has expired.
  - POST – Log out as Patron, Vendor, Operator and NEA Officer.
  - POST – Create cart as Patron by adding a menu item to cart.
  - POST – Insert a new menu item into cart as Patron.
  - POST – Process payment and create an order if payment is successful.
  - POST – Add a visa card.
  - PUT – Update quantity of menu items in the cart as Patron.
  - PUT – Update patron profile.
  - PUT – Set a default visa card.
  - DELETE – Remove menu item from cart as Patron once quantity of a menu item reaches 0.
  - DELETE – Delete cart as Patron if cart contains no more menu items.
  - DELETE – Delete account as Patron.
  - DELETE – Delete account as Patron.
  - DELETE – Delete a stored visa card.

- ### Aadya Singh
- ### Valene Chia Xi Tong
  - GET – Retrieve all Order History records for the logged-in patron.
  - GET – Filter Order History by order status and/or date range.
  - GET – Retrieve a specific Order History record by Order ID.
  - GET – Retrieve all Favourite Order History records for the logged-in patron.
  - GET – Retrieve a specific Favourite Order History record by Favourite ID.
  - POST – Add an order from Order History to Favourite Order History.
  - PUT – Update the custom name of a Favourite Order History record.
  - DELETE – Remove a Favourite Order History record.

- ### Lalithambigai d/o S Saravanan

## Unit Testing Bash Code

- ### Goh Si Ying S10272269B
  - test/vendor-model/
    - Menu Item
      ```bash
      npx jest tests/vendor-model/menuItemModel.test.js
      ```
    - Cuisine
      ```bash
      npx jest tests/vendor-model/cuisineModel.test.js
      ```

  - test/vendor-controller/
    - Menu Item
    ```bash
    npx jest tests/vendor-controller/cuisineController.test.js
    ```

    - Cuisine
    ```bash
    npx jest tests/vendor-controller/menuItemController.test.js
    ```
