// app.js
const express = require('express');
const { Pool } = require('pg');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();

// Replace with your actual database credentials
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'deloitte_db',
    password: 'root',
    port: 5432, // Default PostgreSQL port
});

// Middleware setup
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));

// Function to insert a new employee into the database
const insertEmployee = async (employeeData) => {
    const { name, department, position } = employeeData;
    try {
        const query = 'INSERT INTO employees (name, department, position) VALUES ($1, $2, $3) RETURNING *';
        const values = [name, department, position];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error inserting employee', error);
        throw error;
    }
};

// Route to display login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Route to handle login submission (you can implement authentication logic here)
app.post('/login', (req, res) => {
    // Implement login authentication logic here
    // For example, check if the provided credentials are valid in the database
    // If valid, store user session information and redirect to the main employee management page
    // Otherwise, show an error message or redirect back to the login page
    // ...
});

// Route to display signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Route to handle signup submission (you can implement user registration logic here)
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Add logic to store the user's data in the database (e.g., table "users")
        // ...
        // After successful signup, you can redirect to the login page
        res.redirect('/login');
    } catch (error) {
        res.status(500).send('Error signing up');
    }
});

// Authentication middleware to check if the user is logged in
const isAuthenticated = (req, res, next) => {
    // You can implement your authentication logic here.
    // For example, check if the user is authenticated (e.g., session or token-based authentication)
    // If the user is authenticated, call the 'next' function to proceed to the next route.
    // Otherwise, redirect the user to the login page or show an error message.
    // ...
};

// Protected route for employee management page
app.get('/employees', isAuthenticated, async (req, res) => {
    try {
        const query = 'SELECT * FROM employees';
        const result = await pool.query(query);
        const employees = result.rows;
        res.render('employees', { employees });
    } catch (error) {
        res.status(500).send('Error retrieving employees');
    }
});

// Protected route for displaying the add employee form
app.get('/employees/add', isAuthenticated, (req, res) => {
    res.render('add_employee');
});

// Route to handle form submission for adding a new employee
app.post('/employees/add', isAuthenticated, async (req, res) => {
    try {
        const employeeData = req.body;
        const newEmployee = await insertEmployee(employeeData);
        res.redirect('/employees');
    } catch (error) {
        res.status(500).send('Error adding employee');
    }
});

// Protected route for displaying the form for updating an employee
app.get('/employees/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM employees WHERE id = $1';
        const values = [id];
        const result = await pool.query(query, values);
        const employee = result.rows[0];
        res.render('edit_employee', { employee });
    } catch (error) {
        res.status(500).send('Error retrieving employee for edit');
    }
});

// Route to update an employee
app.put('/employees/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department, position } = req.body;
        const query = 'UPDATE employees SET name = $1, department = $2, position = $3 WHERE id = $4 RETURNING *';
        const values = [name, department, position, id];
        const result = await pool.query(query, values);
        const updatedEmployee = result.rows[0];
        res.send(updatedEmployee);
    } catch (error) {
        res.status(500).send('Error updating employee');
    }
});

// Route to delete an employee (HTTP DELETE)
app.delete('/employees/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM employees WHERE id = $1 RETURNING *';
        const values = [id];
        const result = await pool.query(query, values);
        const deletedEmployee = result.rows[0];
        res.send(deletedEmployee);
    } catch (error) {
        res.status(500).send('Error deleting employee');
    }
});

// ...

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
