This is a simple Employee Management System built with Node.js, Express, MongoDB, and Handlebars. The system includes user authentication (registration, login, logout) and allows logged-in users to add, edit, and delete employee records.

Setup Instructions
	1.	Clone the repository and navigate into the project folder:
        •	git clone <repository-url>
        •	cd w3_employee
	2.	Install the dependencies:
	    •	npm i
	3.	Create a .env file in the root directory and add your MongoDB URI:
	    •	MONGO_URI=your_mongodb_connection_string
	4.	Start the application:
	    •	npm start
	    •	The application will run at http://localhost:5050

Key Notes
	•	Users must register and log in before they can manage employees. Only authenticated users will see the options to add, edit, or delete employees.
	•	The project initially used bcryptjs for password hashing but encountered compatibility issues with authentication. To resolve this, the built-in crypto module was used instead for password hashing, which ensured better consistency and fewer issues.
	•	Edit and delete options are hidden unless a user is logged in.


-----
Assignment4 ✅