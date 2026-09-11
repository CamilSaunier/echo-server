# 🚀 Echo Server

A small, lightweight backend side project built with **Node.js**, **Express**, and **TypeScript** to power a real-time instant messaging application using **Socket.io** and **Prisma**.

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js, Express.js (TypeScript)
- **Real-Time:** Socket.io (with automated user room binding on connection)
- **Database & ORM:** PostgreSQL & Prisma
- **Security & Auth:** JWT (with token rotation/HttpOnly cookies), bcrypt.js, Helmet, Express Rate Limit
- **Validation:** Zod
- **Package Manager:** pnpm

## 🌟 Key Features

- **Real-Time Room Management:** Automatically joins users to all their active conversation rooms upon WebSocket handshake.
- **Modular Architecture:** Clean separation of concerns with controllers, repositories, clients, and dedicated Socket.io event handlers.
- **Robust Security:** Secured via Helmet, CORS configuration, rate limiting, and HttpOnly cookies for session handling.

## 📂 Project Structure

```text
src/
├── clients/      # External/Database data access clients
├── config/       # Configuration files (Prisma client)
├── controllers/  # Route logic handlers (Auth, Conversations, Friends, Messages, Users)
├── docs/         # Internal documentation & architecture notes
├── middlewares/  # Express middlewares (Auth, CORS, Security, Errors, Validation)
├── repositories/ # Database persistence layer
├── routes/       # REST API endpoints definition
├── socket/       # Socket.io setup, middlewares, and modular event handlers
├── utils/        # Helper utilities (JWT, Hashing)
└── validators/   # Zod validation schemas
```
