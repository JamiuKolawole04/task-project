# Task Management System

A full-stack task management application with role-based access control. Admins can create and manage tasks, while users can create personalized lists for each task.

## Features

- **Admin Features:**

  - Create, read, update, and delete tasks
  - View all tasks with list counts
  - User management capabilities

- **User Features:**

  - View available tasks
  - Create personal lists for tasks
  - Mark lists as complete/incomplete
  - Edit and delete their own lists
  - Real-time updates

- **General Features:**
  - Secure authentication with Laravel Sanctum tokens
  - Role-based access control (Admin/User)
  - Responsive design with modern UI
  - Real-time notifications
  - Keyboard shortcuts for productivity

## Tech Stack

### Backend

- **Framework:** Laravel 12
- **Database:** MySQL
- **Authentication:** Laravel Sanctum with tokens
- **API:** RESTful API with resource controllers

### Frontend

- **Languages:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Tailwind CSS
- **Icons:** Font Awesome
- **Architecture:** Modular JavaScript with class-based components

## Project Structure

```
├── backend/                 # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   ├── Resources/
│   │   └── ...
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   └── ...
├── frontend/               # Frontend application
│   ├── index.html         # Main HTML file
│   └── js/
│       ├── api.js         # API service layer
│       ├── auth.js        # Authentication management
│       ├── admin.js       # Admin functionality
│       ├── user.js        # User functionality
│       └── app.js         # Main application logic
└── README.md              # This file
```

## Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js and npm (optional, for additional tooling)
- MySQL 8.0 or higher
- Web server (Apache/Nginx) or PHP built-in server

## Installation & Setup

### 1. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Create database (make sure MySQL is running)
mysql -u root -p
CREATE DATABASE your_database_name;
exit

# Run migrations
php artisan migrate

# Seed the database with sample data
php artisan db:seed

# Start the development server
php artisan serve
```

The backend API will be available at `http://localhost:8000`

### 2. Frontend Setup

The frontend is a static web application that can be served in multiple ways:

#### Option A: Using Live Server (VS Code Extension)

1. Install the "Live Server" extension in VS Code
2. Open the `frontend` folder in VS Code
3. Right-click on `index.html` and select "Open with Live Server"
4. The application will open at `http://127.0.0.1:5500` (or similar)

#### Option B: Using Python's Built-in Server

```bash
# Navigate to frontend directory
cd frontend

# Python 3
python -m http.server 8080

# Python 2 (if needed)
python -m SimpleHTTPServer 8080
```

Access at `http://localhost:8080`

#### Option C: Using Node.js http-server

```bash
# Install globally
npm install -g http-server

# Navigate to frontend directory
cd frontend

# Start server
http-server -p 8080

# Or with auto-reload
http-server -p 8080 --cors
```

#### Option D: Using PHP Built-in Server

```bash
# Navigate to frontend directory
cd frontend

# Start PHP server
php -S localhost:8080
```

## Default Accounts

The database seeder creates the following test accounts:

### Admin Account

- **Email:** `admin@example.com`
- **Password:** `password`
- **Role:** Admin

### User Account

- **Email:** `user@example.com`
- **Password:** `password`
- **Role:** User

## API Endpoints

### Authentication

- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user

### Tasks (Admin only)

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get single task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Lists (Users)

- `GET /api/lists` - Get user's lists
- `POST /api/lists` - Create list
- `GET /api/lists/{id}` - Get single list
- `PUT /api/lists/{id}` - Update list
- `DELETE /api/lists/{id}` - Delete list

### Health Check

- `GET /api/health` - API health status

## Usage

### For Admins

1. Login with admin credentials
2. Create tasks using the "Create New Task" form
3. View all tasks with list counts
4. Edit or delete existing tasks
5. Monitor user activity

### For Users

1. Login with user credentials or register a new account
2. View available tasks created by admins
3. Create lists for specific tasks
4. Mark lists as complete/incomplete
5. Edit or delete your own lists

### Keyboard Shortcuts

- `Ctrl+N` - Create new task (Admin) or list (User)
- `Ctrl+R` - Refresh data
- `Ctrl+S` - Save form (when modal is open)
- `Escape` - Close modal
- `Double-click` - Toggle list completion (Users)

## Development

### Backend Development

```bash
# Run migrations
php artisan migrate

# Create new migration
php artisan make:migration create_table_name

# Create new controller
php artisan make:controller ControllerName

# Run tests (if available)
php artisan test
```

### Frontend Development

The frontend uses vanilla JavaScript with a modular architecture:

- **api.js** - Handles all API communication
- **auth.js** - Manages authentication and user sessions
- **admin.js** - Admin-specific functionality
- **user.js** - User-specific functionality
- **app.js** - Main application logic and utilities

### Adding New Features

1. Backend: Create controllers, models, and routes in Laravel
2. Frontend: Add API calls to `api.js` and UI logic to appropriate modules
3. Update this README with new endpoints and features

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure backend is running on `http://localhost:8000`
   - Frontend should be served via HTTP (not file://)

2. **Database Connection Failed**

   - Check MySQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

3. **404 API Errors**

   - Verify backend server is running
   - Check API endpoint URLs in `frontend/js/api.js`

4. **Authentication Issues**

   - Clear browser localStorage
   - Check JWT token expiration
   - Verify user credentials

5. **Frontend Not Loading**
   - Serve frontend via HTTP server (not file://)
   - Check browser console for JavaScript errors
   - Ensure all JS files are loading correctly

### Debug Mode

Set `APP_DEBUG=true` in your `.env` file for detailed error messages during development.

## Production Deployment

### Backend

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Configure production database
4. Run `composer install --optimize-autoloader --no-dev`
5. Configure web server (Apache/Nginx)

### Frontend

1. Build optimized assets if using build tools
2. Configure web server to serve static files
3. Ensure API URLs point to production backend
4. Enable HTTPS for secure authentication

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is open-source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check this README for common solutions
2. Review the browser console for JavaScript errors
3. Check Laravel logs in `backend/storage/logs/`
4. Create an issue on the project repository
