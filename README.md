# Users Authentication DEMO App - Cloud Architecture


This is the DEMO app that demonstrates how a single codebase can be utilized across various environments, including localhost and different cloud providers.
</br>
It features a "Microservice-ready" architectural design, combining the advantages of modular monolith architecture (excluding the database and UI components). Essentially, all the "service" code is executed within a single process. However, the app's codebase is structured in a manner that allows different modules to potentially be extracted into distinct services down the line. Further information about architectural styles can be found here: [Architecture](./documentation/1-Architecture.md)

## Functional Characteristics (aka requirements)
The app itself is simple. When user go to app homepage, app will try to authenticate the user using HTTP request cookie. If the user is authenticated the app will render "secure page", otherwise it will redirect user to login page.

The login page provides options for both signing up and recovering a forgotten password. Users can enter their email and password for login. In cases where the login attempt is unsuccessful, they can simply click the "forgot password" link. Subsequently, the app will send an email containing a reset password link to the user.

* Demo Link: https://a488secureappdemosite.azure-api.net/

<sup><em>In the live demo app, the email functionality for password reset is simulated. Instead of sending actual emails, the app will automatically redirect users to the 'Change Password' page for demonstration purposes.</em></sup>

<sup><em>Please note that Azure API Management is in the Developer tier. It may have availability and performance issues, and can be a bit clunky at specific moments. In such cases, you can directly access the Azure Function using the following link: https://a488secureappdemofnappmain.azurewebsites.net/api/main </em></sup>


## Architectural insights

* [Architecture - General Guide](./documentation/1-Architecture.md)

* [Demo App Architecture](./documentation/1-Architecture.md)

## Installation instructions

- [Installation Steps](./documentation/3-installation.md)
## Testing

Upon successfully following the Installation Instructions, you're ready to proceed with running tests, especially in the localhost environment.

During the testing phase, the application undergoes a form of "unit/integration testing" that focuses on the users module. This comprehensive process evaluates the functional requirements of tasks like login, signup... etc, verifying the smooth and accurate execution of these functionalities.

