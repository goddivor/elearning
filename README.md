# 3D E-Learning Platform - Frontend

Modern and responsive frontend for the 3D interactive e-learning platform built with React, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 19.x
- **Language**: TypeScript 5.8.x
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **Routing**: React Router DOM 7.x
- **HTTP Client**: Axios 1.11.x
- **Icons**: Phosphor Icons + Iconsax React
- **UI Components**: Custom components with CVA (Class Variance Authority)
- **Notifications**: React Hot Toast

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 8.x
- Backend API running on http://localhost:3001

## Installation

```bash
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Application available at: http://localhost:5173

### Production Build

```bash
npm run build
npm run preview
```

Preview available at: http://localhost:4173

## Project Structure

```
src/
├── main.tsx                  # Application entry point
├── app.layout.tsx            # Root layout wrapper
├── contexts/                 # React contexts
│   ├── AuthContext.tsx      # Global authentication state
│   └── toast-context.tsx    # Toast notifications
├── routes/                   # Route configurations
│   ├── index.tsx            # Main router setup
│   ├── auth.routes.tsx      # Authentication routes
│   ├── admin.routes.tsx     # Admin dashboard routes
│   ├── instructor.routes.tsx # Instructor dashboard routes
│   └── student.routes.tsx   # Student dashboard routes
├── pages/                    # Page components by role
│   ├── landing/             # Landing page
│   ├── auth/                # Sign in/up, forgot password
│   ├── admin/               # Admin pages
│   ├── instructor/          # Instructor pages
│   └── student/             # Student pages
├── components/               # Reusable components
│   ├── ui/                  # Generic UI components
│   ├── admin/               # Admin-specific components
│   ├── instructor/          # Instructor components
│   ├── student/             # Student components
│   ├── forms/               # Form components
│   ├── layout/              # Layout components
│   └── modals/              # Modal dialogs
├── services/                 # API services
│   ├── api.ts               # Axios instance with interceptors
│   └── authService.ts       # Authentication API calls
├── layouts/                  # Layout templates
│   └── DashboardLayout.tsx  # Main dashboard layout
├── types/                    # TypeScript definitions
├── hooks/                    # Custom React hooks
├── utils/                    # Utility functions
└── lib/                      # Third-party configurations
```

## Key Features

### Role-Based Routing

The application implements role-based routing with automatic redirects:

- **Student Dashboard**: Course catalog, enrollments, progress tracking, leaderboard
- **Instructor Dashboard**: Course builder, student management, analytics
- **Admin Dashboard**: User management, profiles, organizations, system analytics

### Authentication System

- JWT token-based authentication
- Automatic token refresh
- Protected routes with guards
- Role-based redirects
- Persistent login state

### Components Architecture

- **ProtectedRoute**: Guards routes requiring authentication
- **RoleBasedRedirect**: Auto-redirects to appropriate dashboard
- **ProfileRouter**: Handles profile-based navigation
- Modular UI components with variants (using CVA)

### API Integration

Axios instance configured with:
- Base URL: `http://localhost:3001/api`
- Automatic JWT token injection
- Response/error interceptors
- 401 handling with auto-logout
- Centralized error handling

## Available Scripts

### Development

```bash
npm run dev         # Start development server with HMR
```

### Production

```bash
npm run build       # TypeScript check + Vite build
npm run preview     # Preview production build
```

### Code Quality

```bash
npm run lint        # Run ESLint
```

## Styling

### Tailwind CSS 4.x

The project uses Tailwind CSS v4 with:
- `@tailwindcss/vite` plugin for optimal performance
- Custom utility classes
- Responsive design patterns
- Dark mode support (if configured)

### Component Variants

Uses `class-variance-authority` (CVA) for managing component variants:

```typescript
import { cva } from "class-variance-authority";

const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      primary: "primary-classes",
      secondary: "secondary-classes",
    },
  },
});
```

## Route Structure

### Public Routes

- `/` - Landing page
- `/signin` - User login
- `/signup` - User registration
- `/signup/organization` - Organization registration
- `/forgot-password` - Password recovery

### Protected Routes (requires authentication)

#### Student Routes
- `/dashboard/student` - Student dashboard
- `/dashboard/student/catalog` - Course catalog
- `/dashboard/student/my-courses` - Enrolled courses
- `/dashboard/student/progress` - Learning progress
- `/dashboard/student/leaderboard` - Leaderboard

#### Instructor Routes
- `/dashboard/instructor` - Instructor dashboard
- `/dashboard/instructor/courses` - Course management
- `/dashboard/instructor/course-builder` - Course creation
- `/dashboard/instructor/students` - Student management

#### Admin Routes
- `/dashboard/admin` - Admin dashboard
- `/dashboard/admin/users` - User management
- `/dashboard/admin/profiles` - Profile management
- `/dashboard/admin/organizations` - Organization management
- `/dashboard/admin/courses` - Course oversight

## API Communication

### Authentication Flow

1. User logs in via `AuthService.login()`
2. JWT token stored in localStorage
3. Token automatically added to all requests
4. On 401 response, user logged out and redirected

### Axios Interceptors

**Request Interceptor**:
- Adds `Authorization: Bearer {token}` header
- Reads token from localStorage

**Response Interceptor**:
- Handles 401 errors (expired/invalid tokens)
- Auto-logout and redirect to signin
- Formats API errors consistently

## TypeScript Configuration

The project uses strict TypeScript with:
- Type-safe routing
- Strongly typed API responses
- Interface-based component props
- Type definitions in `/types` directory

## Development Tips

### Hot Module Replacement (HMR)

Vite provides fast HMR for instant feedback during development.

### Component Development

Create new components in appropriate subdirectories:
- Generic components → `components/ui/`
- Role-specific → `components/{role}/`
- Forms → `components/forms/`

### Adding New Routes

1. Define route in appropriate route file (`routes/*.routes.tsx`)
2. Create page component in `pages/{role}/`
3. Update route guard if needed
4. Add navigation link in sidebar/header

## Environment Configuration

API base URL is configured in `src/services/api.ts`:

```typescript
export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});
```

For production, update this to your production API URL.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private license for 3D E-Learning Platform.
