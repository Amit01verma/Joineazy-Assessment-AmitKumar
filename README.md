# Joineazy – Task 1

A role-based full-stack Student, Group & Assignment Management System built for the Joineazy Full Stack Intern Round 1 technical task.

## Stack

- React + Vite
- Tailwind CSS
- Node.js + Express
- PostgreSQL
- JWT authentication
- Docker / Docker Compose

## Features

### Student

- Register and login with JWT authentication.
- Create a group and add registered students by email or numeric student ID.
- View assignments available to the student's group.
- Open the professor's OneDrive submission link.
- Two-step submission confirmation: **Yes, I have submitted → Confirm submission**.
- View group completion progress.

### Professor / Admin

- JWT-protected admin workspace.
- Create and edit assignments with title, description, due date and OneDrive link.
- Target all students/groups or selected groups.
- View groups and members.
- Track confirmation status by assignment, group and student.
- View basic analytics and completion bars.

## Implementation Overview

The application is divided into three main layers:

- **Frontend:** React + Vite + Tailwind CSS provides separate student and admin interfaces with protected routes.
- **Backend:** Node.js + Express exposes REST APIs for authentication, groups, assignments, submissions and analytics.
- **Database:** PostgreSQL stores users, groups, group memberships, assignments, assignment targeting and submission confirmations.

JWT authentication is used for protected API requests, while role-based middleware restricts student and admin functionality.

## Project Structure

```text
frontend/                  React UI
backend/                   Express API
backend/schema.sql         PostgreSQL schema
Dockerfile(s)              Container definitions
docker-compose.yml         DB + API + frontend orchestration
README.md                  Project documentation