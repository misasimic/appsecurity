# Users Authentication DEMO App - Cloud Architecture


This is the DEMO app that demonstrates how a single codebase can be utilized across various environments, including localhost and different cloud providers.
</br>
It features a "Microservice-ready" architectural design, combining the advantages of modular monolith architecture (excluding the database and UI components). Essentially, all the "service" code is executed within a single process. However, the app's codebase is structured in a manner that allows different modules to potentially be extracted into distinct services down the line. Further information about architectural styles can be found here: [link]

The app itself is simple. When user go to app homepage, app will try to authenticate the user using HTTP request cookie. If the user is authenticated the app will render "secure page", otherwise it will redirect user to login page.

The login page provides options for both signing up and recovering a forgotten password. Users can enter their email and password for login. In cases where the login attempt is unsuccessful, they can simply click the "forgot password" link. Subsequently, the app will send an email containing a reset password link to the user.
