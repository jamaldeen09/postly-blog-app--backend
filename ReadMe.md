# 📰 Postly

A full-stack blog application built with **TypeScript**, **Express.js**, **MongoDB**, and **React**.  
Postly is designed as a _portfolio-grade, production-style system_ that demonstrates real-world architecture principles — authentication, caching, data integrity, pagination, and modular route separation.

---

## 🚀 Features

### 🔐 Authentication

- Secure JWT-based login and signup flow.
- Access and refresh token system with token lifecycle handling.
- Authenticated `/me` endpoint for current user state.
- Middleware-based token validation with clear separation of access and refresh logic.

### ✍️ Blog Posts

- Create, like/unlike, view, and archive posts.
- Each post includes author data, category, views, and like counts.
- Paginated endpoints for:
  - All posts
  - Created posts
  - Liked posts
  - Archived posts
- Caching layer to reduce redundant database reads.

### 💬 Comments

- Add comments to posts with validation and referential integrity checks.
- Paginated comment retrieval per post.
- Like/unlike comments with safety checks (users can’t like their own comment).
- Caching and invalidation per comment page.
- Designed for easy reply-thread extension (intentionally skipped for simplicity).

### 🧾 Profiles

- Fetch current user profile (`/profile/me`) with caching.
- Automatic cache hydration on first access, read from cache afterward.

### ⚡ Caching Layer

- Custom caching service built around `writeOperation`, `readOperation`, and `deleteOperation`.
- Pattern-based invalidation (e.g., `post:<id>-comments-page:*`) for controlled cache refresh.
- Optimized for small-scale use (1–100 users) while mimicking production caching architecture.

---

## 🧠 Architectural Decisions

### ✅ Data Integrity > Micro-Optimization

Postly intentionally uses explicit database existence checks (e.g., `BlogPost.exists`) before inserts to prevent invalid references or malicious data injection — even if a client bypasses frontend validation.  
This adds a single lightweight DB call but guarantees relational integrity and safer CRUD operations.

### 🧩 Modularity

Each logical domain (auth, blog posts, comments, profile) is isolated in its own route + controller pair.  
Validation logic is centralized in a `ValidationHandler` service for DRY maintainability.

### 🔁 Pagination + Cache Coherency

Pagination is standardized across comments and posts, and cache keys follow a structured naming pattern to allow safe pattern invalidation.  
New comments or likes automatically invalidate the relevant cache pages.

### 🧰 Error Handling

All controllers implement consistent JSON responses:

```json
{
  "success": boolean,
  "message": string,
  "statusCode": number,
  "error"?: string,
  "data"?: object
}

## Folder Structure
  /config
    ├── database.config.ts       # MongoDB connection with retry logic
    ├── env.config.ts            # Environment variable handler

  /controllers
    ├── auth.controllers.ts
    ├── blogPost.controllers.ts
    ├── comment.controllers.ts
    ├── profile.controllers.ts

  /middlewares
    ├── auth.middlewares.ts      # Token verification + validation handlers

  /models
    ├── BlogPost.ts
    ├── Comment.ts
    ├── User.ts

  /routes
    ├── auth.routes.ts
    ├── blogPost.routes.ts
    ├── comment.routes.ts
    ├── profile.routes.ts

  /services
    ├── cache.services.ts        # Core read/write/delete cache logic
    ├── validation.services.ts   # Reusable express-validator wrapper

  /types
    ├── auth.types.ts
    ├── blogPost.types.ts
    ├── comment.types.ts
    ├── profile.types.ts
```

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Custom Cache Service
```

## 🧩 API Highlights

### 🔐 Authentication
- **POST** `/auth/signup` — Register a new user  
- **POST** `/auth/login` — Login and receive tokens  
- **GET** `/auth/me` — Fetch current user’s auth state  
- **GET** `/auth/refresh` — Refresh access token  

### 📰 Blog Posts
- **GET** `/posts` — Fetch paginated posts  
- **GET** `/posts/:postId` — Fetch a single post  
- **POST** `/posts` — Create a new blog post  
- **PATCH** `/posts/:postId` — Like or unlike a post  
- **PATCH** `/posts/:postId/archive` — Archive or unarchive a post  

### 💬 Comments
- **GET** `/posts/:postId/comments` — Fetch paginated comments for a post  
- **POST** `/comments/:postId` — Add a new comment  
- **PATCH** `/comments/:commentId/:postId` — Like or unlike a comment  

### 👤 Profile
- **GET** `/profile/me` — Fetch logged-in user’s profile
```
## Environmental variables
ACCESS_TOKEN_SECRET=yourAccessSecret
REFRESH_TOKEN_SECRET=yourRefreshSecret
MONGO_URI=mongodb+srv://your_cluster
PORT=5000
HOST_URL=http://localhost:5000
```

## Author
Jamal Omotoyosi
Full-Stack Developer | React • TypeScript • Node.js
Passionate about performant, secure, and scalable web systems.