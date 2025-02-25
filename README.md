## Introduction

Auth0 Client SK  authentication library for Next.js applications.

## Installation

Install the package using npm:

```bash
npm install auth0-client-sk@latest

```

## Configuration

### Environment Variables

Create a `.env` file in your project root with the following configuration:

```
# Auth0 Configuration
CLIENT_ID=your_auth0_client_id
CLIENT_SECRET=your_auth0_client_secret
REDIRECT_URI=http://localhost:3000/api/auth/callback/github
JWT_SECRET=your_secure_jwt_secret

# Public Configuration
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback/github

# Post-Authentication Routes
POST_AUTH_URL=http://localhost:3000/protected 
POST_LOGOUT_URL=http://localhost:3000

```

### Required Environment Variables Explained

| Variable | Description |
| --- | --- |
| `CLIENT_ID` | Your Auth0 application client ID |
| `CLIENT_SECRET` | Your Auth0 application client secret |
| `REDIRECT_URI` | The callback URL after authentication |
| `JWT_SECRET` | Secret key for JWT token encryption |
| `NEXT_PUBLIC_REDIRECT_URI` | Publicly accessible redirect URI |
| `POST_AUTH_URL` | URL to redirect after successful authentication |
| `POST_LOGOUT_URL` | URL to redirect after logout |

## Implementation

### API Route Handler

Create a catch-all API route for authentication:

```tsx
// app/api/auth/[...auth]/route.ts
import { handler } from "auth0-client-sk/Integrations";

export const GET = handler;

```

### Authentication Components

### Login Button

Implement the login functionality in your components:

```tsx
import { signin } from "auth0-client-sk/Auth";

const LoginButton = () => (
  <button
    onClick={signin}
    className="your-button-styles"
  >
    Login
  </button>
);

```

### Session Management

### Client-Side Session

Use the `useClientSession` hook in client components:

```tsx
"use client"
import { useClientSession } from 'auth0-client-sk/Integrations'

const ProfilePage = () => {
  const { isAuthenticated, isPending, user } = useClientSession();

  if (isPending) return <div>Loading...</div>;

  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      {/* Your protected content */}
    </div>
  );
};

```

### Server-Side Session

Access session data in server components:

```tsx
import { getUserSession } from 'auth0-client-sk/Integrations'

const ServerComponent = async () => {
  const session = await getUserSession();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Server-side protected content</h1>
      <p>User ID: {session.user.sub}</p>
    </div>
  );
};

```

## Session Properties

The session object provides the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `isAuthenticated` | boolean | Authentication status |
| `isPending` | boolean | Loading state indicator |
| `user` | object | User profile information |

### User Object Properties

```tsx
User : {
    id: string;
    email: string | null;
    name: string;
    avatar: string;
    username: string;
    provider: string;
}
```# auth0-demo
