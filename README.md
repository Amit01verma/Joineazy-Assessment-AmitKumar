# Joineazy – Task 1

A role-based full-stack Student, Group & Assignment Management System built for the Joineazy Full Stack Intern Round 1 technical task.

## Stack

- React.js + Vite
- Tailwind CSS
- Node.js + Express.js
- PostgreSQL
- JWT Authentication
- Docker / Docker Compose
- HTML

## Features

### Student

- Register and login with JWT authentication.
- Create a new group and add registered students using their email.
- View assignments available to the student.
- Access OneDrive submission links for assignments.
- Confirm submission using a two-step process: **Yes, I have submitted → Confirm submission**.
- View group members and track group submission progress visually.

### Professor / Admin

- Secure admin workspace with role-based access.
- Create, edit and view assignments with title, description, due date and OneDrive link.
- Assign assignments to all students/groups or selected groups.
- View groups and their members.
- Track student-wise and group-wise submission confirmations.
- View basic submission analytics and completion progress.

## Implementation Overview

The application follows a three-layer architecture:

- **Frontend:** React + Vite + Tailwind CSS provides separate Student and Admin interfaces with protected routes.
- **Backend:** Node.js + Express provides REST APIs for authentication, groups, assignments, submissions and analytics.
- **Database:** PostgreSQL stores users, groups, group memberships, assignments, assignment targeting and submission confirmations.
- **Authentication:** JWT authentication with Student/Admin role-based authorization.

## Architecture

```mermaid
flowchart LR
    U[Student / Admin] --> F[React + Vite + Tailwind]
    F -->|REST API + JWT| B[Node.js + Express]
    B --> D[(PostgreSQL)]

    B --> A[Authentication]
    B --> G[Group Management]
    B --> AS[Assignment Management]
    B --> S[Submission Tracking]
    B --> AN[Analytics]
```

## Database Schema & Relationships

The database contains the following main tables:

- **users** – stores student and admin accounts.
- **groups** – stores student-created groups.
- **group_members** – connects students with groups.
- **assignments** – stores assignment details created by admins.
- **assignment_groups** – connects assignments with their target groups.
- **submissions** – stores student submission confirmations.

### ER Diagram

```mermaid
erDiagram
    USERS ||--o{ GROUPS : creates
    USERS ||--o{ GROUP_MEMBERS : joins
    GROUPS ||--o{ GROUP_MEMBERS : contains
    USERS ||--o{ ASSIGNMENTS : creates
    ASSIGNMENTS ||--o{ ASSIGNMENT_GROUPS : targets
    GROUPS ||--o{ ASSIGNMENT_GROUPS : receives
    ASSIGNMENTS ||--o{ SUBMISSIONS : has
    USERS ||--o{ SUBMISSIONS : confirms

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string role
        timestamp created_at
    }

    GROUPS {
        int id PK
        string name
        int created_by FK
        timestamp created_at
    }

    GROUP_MEMBERS {
        int group_id PK,FK
        int student_id PK,FK
    }

    ASSIGNMENTS {
        int id PK
        string title
        string description
        date due_date
        string onedrive_link
        int created_by FK
        timestamp created_at
        timestamp updated_at
    }

    ASSIGNMENT_GROUPS {
        int assignment_id PK,FK
        int group_id PK,FK
    }

    SUBMISSIONS {
        int assignment_id PK,FK
        int student_id PK,FK
        timestamp confirmed_at
    }
```

## Project Structure

```text
Joineazy-Task1-AmitKumar/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── schema.sql
│
├── docker-compose.yml
├── DEMO_SCRIPT.md
└── README.md
```

## Authentication & Authorization

- JWT is used for authentication and protected API requests.
- Two roles are supported: **Student** and **Admin**.
- Role-based middleware protects backend routes.
- Frontend protected routes restrict access to role-specific pages.
- Passwords are stored using bcrypt hashing.
- Environment variables are used for database credentials and JWT configuration.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a student |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get authenticated user |

### Groups

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/groups` | View groups |
| POST | `/api/groups` | Create a group |
| POST | `/api/groups/:id/members` | Add a group member |

### Assignments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/assignments` | View assignments |
| POST | `/api/assignments` | Create an assignment |
| PUT | `/api/assignments/:id` | Edit an assignment |
| GET | `/api/assignments/:id` | View assignment details |

### Submissions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/submissions/:assignmentId/confirm` | Confirm submission |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/groups` | View groups and members |
| GET | `/api/admin/submissions` | View submissions |
| GET | `/api/admin/analytics` | View analytics |

### Health Check

```text
GET /api/health
```

## Setup & Run

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Docker (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/Amit01verma/Joineazy-Task1-AmitKumar.git
cd Joineazy-Task1-AmitKumar
```

### 2. Create the PostgreSQL Database

Create a database named:

```text
joineazy
```

Run the schema from:

```text
backend/schema.sql
```

The schema can be executed using PostgreSQL or pgAdmin.

### 3. Configure the Backend

Create:

```text
backend/.env
```

Add:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/joineazy
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 4. Start the Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

### Docker

The project also includes Docker Compose configuration.

From the project root:

```bash
docker compose up --build
```

## Demo Credentials

### Admin

```text
Email: admin@joineazy.local
Password: Admin@123
```

### Student

```text
Email: amit@joineazy.local
Password: Student@123
```

Additional demo students:

```text
rahul@joineazy.local
priya@joineazy.local
```

Password:

```text
Student@123
```

> These credentials are provided for local/demo testing.

## Demo Flow

### Student

```text
Login
  ↓
Create Group
  ↓
Add Group Member
  ↓
View Assignment
  ↓
Open OneDrive Link
  ↓
Yes, I have submitted
  ↓
Confirm Submission
  ↓
View Group Progress
```

### Admin

```text
Login
  ↓
Create Assignment
  ↓
Assign to All / Selected Groups
  ↓
View Groups & Members
  ↓
Track Submissions
  ↓
View Analytics
```

## Design & Deployment Decisions

- The frontend and backend are maintained as separate applications for modularity.
- REST APIs are used for communication between the frontend and backend.
- PostgreSQL is used for relational data management.
- Assignment targeting is handled through a separate `assignment_groups` table.
- Submission confirmations are stored separately for student-level tracking.
- JWT and role-based middleware provide protected access to application functionality.
- Docker Compose is included for multi-service deployment.
- Sensitive configuration is stored in environment variables and excluded from Git.

## Demo

**GitHub Repository:**  
https://github.com/Amit01verma/Joineazy-Task1-AmitKumar

**Demo Video:**  
https://drive.google.com/file/d/1IM9XGN_RVM9Iu6D-0BraTjnVTFI10CXc/view?usp=sharing


## Author

**Amit Kumar**

Built with React, Node.js, Express.js and PostgreSQL as part of the **Joineazy Full Stack Intern Round 1 Technical Task**.