# transendence modules overlook

* Modules that we take for sure
    - Web
        - Major: Use a framework for both the frontend and backend.
        > We are taking TypeScript + React, Java + Spring Boot.
        - Major: Implement real-time features using WebSockets or similar technology.
            - Real-time updates across clients.
            - Handle connection/disconnection gracefully.
            - Efficient message broadcasting.
        - Major: A public API to interact with the database with a secured API key, rate limiting documentation and at least 5 endpoints:
            - GET /api/something
            - POST /api/something
            - PUT /api/something
            - DELETE /api/something
        - Major: Allow users to interact with other users. The minimum requirements are:
            - A basic chat system (send/receive messages between users).
            - A profile system (view user information).
            - A friends system (add/remove friends, see friends list).
        - Major: A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints:
            - GET /api/{something}
            - POST /api/{something}
            - PUT /api/{something}
            - DELETE /api/{something}
        - Minor: Use an ORM for the database.
        - Minor: File upload and management system.
            - Support multiple file types (images, documents, etc.).
            - Client-side and server-side validation (type, size, format).
            - Secure file storage with proper access control.
            - File preview functionality where applicable.
            - Progress indicators for uploads.
            - Ability to delete uploaded files.
    - Accessibility and Internationalization
        - Minor: Support for multiple languages (at least 3 languages).
            - Implement i18n (internationalization) system.
            - At least 3 complete language translations.
            - Language switcher in the UI.
            - All user-facing text must be translatable.
        > English, Russian, Ukranian
    - User Management
        - Major: Standard user management and authentication.
            - Users can update their profile information.
            - Users can upload an avatar (with a default avatar if none provided).
            - Users can add other users as friends and see their online status.
            - Users have a profile page displaying their information
        - Minor: Implement remote authentication with OAuth 2.0 (Google, GitHub, 42 etc.).
        - Major: Advanced permissions system:
            - View, edit, and delete users (CRUD).
            - Roles management (admin, user, guest, moderator, etc.).
            - Different views and actions based on user role.



Total points of these modules are 18 points
This is suprisingly a lot tbh, it's going to be enough for the madatory part and bonus