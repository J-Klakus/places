Here's the comprehensive documentation for the Nomad Places application:

Nomad Places - Technical Documentation
======================================

Overview
--------

Nomad Places is a web application that allows users to discover and share Google Maps locations. The system provides:

*   User authentication (email/password + Google OAuth)
    
*   Place management (CRUD operations)
    
*   Voting system for places
    
*   Categorization by tags
    
*   Responsive UI with interactive components
    

### Technology Stack

*   **Frontend**: Astro with Svelte components
    
*   **Backend**: Cloudflare Workers
    
*   **Database**: Cloudflare D1 (SQLite)
    
*   **ORM**: Drizzle ORM
    
*   **Authentication**: Better Auth
    
*   **Styling**: Tailwind CSS with FlyonUI theme
    
*   **Icons**: Iconify/Heroicons
    

Database Schema
---------------

### Core Tables

#### `user`

*   Stores user account information
    
*   **Primary Key**: `id` (text)
    
*   **Fields**:
    
    *   `name`, `email` (required)
        
    *   `email_verified` (boolean)
        
    *   `image` (optional avatar)
        
    *   `created_at`, `updated_at` timestamps
        
*   **Indexes**: Unique constraint on `email`
    

#### `account`

*   Stores OAuth provider accounts
    
*   **Relations**: Many-to-one with `user`
    
*   **Fields**: Various OAuth token fields and provider info
    
*   **Cascade delete**: When user is deleted
    

#### `session`

*   Manages user sessions
    
*   **Fields**: Token, expiration, client info
    
*   **Indexes**: Unique token constraint
    
*   **Cascade delete**: When user is deleted
    

#### `verification`

*   Handles email verification tokens
    
*   **Fields**: Token value, expiration, identifier
    

### Application Tables

#### `places`

*   Stores shared map locations
    
*   **Fields**:
    
    *   `name`, `description`, `link` (required)
        
    *   `votes` (default 0)
        
    *   `tag` (categorization)
        
    *   `created_at` timestamp
        
*   **Relations**: Many-to-one with `user`
    

#### `votes`

*   Tracks user votes on places
    
*   **Fields**: `vote_type` ("like"/"dislike")
    
*   **Relations**: Many-to-one with both `user` and `places`
    

Authentication System
---------------------

### Key Features

*   Email/password authentication
    
*   Google OAuth integration
    
*   Session management
    
*   Email verification
    
*   Secure password hashing
    

### Implementation

*   Uses `better-auth` with Drizzle ORM adapter
    
*   Session tokens stored in `session` table
    
*   Middleware validates sessions on each request
    
*   Client-side auth helpers in `auth-client.ts`
    

Actions API
-----------

### Place Management

#### `createPlace`

*   Creates a new place entry
    
*   **Validation**:
    
    *   Name: min 3 chars
        
    *   Description: min 10 chars
        
    *   Link: Valid Google Maps embed URL
        
    *   Tag: Enum of valid categories
        
*   **Auth**: Requires authenticated user
    

#### `getPlaces`

*   Retrieves all places
    
*   No authentication required
    

#### `getTopPlaces`

*   Gets top 10 voted places (ordered by votes)
    
*   No authentication required
    

#### `getPlacesByTag`

*   Filters places by category tag
    
*   **Parameters**: Valid tag from enum
    
*   No authentication required
    

#### `getPlacesByID`

*   Gets places created by specific user
    
*   **Auth**: Requires matching user ID
    

#### `updatePlace`

*   Modifies existing place
    
*   **Validation**: Same as create
    
*   **Auth**: User must own the place
    

#### `deletePlace`

*   Removes a place and its votes
    
*   **Auth**: User must own the place
    
*   **Side Effects**: Cascading vote deletion
    

### Voting System

#### `Vote`

*   Records user vote (like/dislike)
    
*   **Rules**:
    
    *   One vote per user per place
        
    *   Updates place's vote count
        
*   **Auth**: Requires authenticated user
    

UI Components
-------------

### Core Components

#### `Navbar`

*   Responsive navigation bar
    
*   Features:
    
    *   Auth state awareness
        
    *   Mobile menu toggle
        
    *   Create place modal trigger
        
    *   Logout functionality
        

#### `Modal`

*   Reusable dialog component
    
*   Used for:
    
    *   Place creation
        
    *   Place editing
        
    *   Delete confirmation
        

#### `PlaceCard`

*   Displays place information
    
*   Includes:
    
    *   Google Maps embed iframe
        
    *   Voting buttons
        
    *   Tag icon visualization
        
    *   Responsive layout
        

#### `Table`

*   Paginated data display
    
*   Features:
    
    *   Sortable columns
        
    *   Edit/delete actions
        
    *   Responsive pagination controls
        

### Specialized Components

#### `Votes`

*   Visual vote indicator
    
*   Uses gradient bar to show vote balance
    
*   Pure visual (no interaction)
    

#### `DeleteConfirmation`

*   Confirmation dialog
    
*   Prevents accidental deletions
    
*   Customizable message
    

#### `UpdateModal`

*   Form for editing places
    
*   Pre-populates existing data
    
*   Client-side validation
    

Usage Examples
--------------

### Creating a Place

```javascript

await actions.createPlace({
  name: "Great Coffee Shop",
  description: "Best espresso in town",
  link: "https://maps.google.com/embed?...",
  tag: "cafes-with-wifi"
});
```

### Voting on a Place

```javascript

await actions.Vote({
  placeId: "place123",
  isLike: true // or false for dislike
});
```

### Getting Places by Tag

```javascript

const result \= await actions.getPlacesByTag({
  tag: "food"
});

```

Security Considerations
-----------------------

*   All actions require authentication unless explicitly public
    
*   Users can only modify their own content
    
*   Input validation via Zod schemas
    
*   Session tokens have expiration
    
*   Password hashing before storage
    
*   CSRF protection via Astro Actions
    

Deployment
----------

### Requirements

*   Cloudflare account
    
*   D1 database configured
    
*   Environment variables set:
    
    *   `GOOGLE_CLIENT_ID`
        
    *   `GOOGLE_CLIENT_SECRET`
        
    *   `BETTER_AUTH_SECRET`
        

### Commands

```bash
npm run build    \# Build production assets
npm run deploy   \# Deploy to Cloudflare
npm run migrate:remote  \# Run database migrations
```

Limitations
-----------

1.  Google Maps links must be embed format
    
2.  Limited to SQLite via Cloudflare D1
    
3.  Fixed set of tag categories
    
4.  No admin moderation interface
    
5.  No rate limiting on API endpoints
    

Error Handling
--------------

The system uses:

*   ActionError for business logic errors
    
*   Zod validation for input sanitization
    
*   Try/catch blocks for async operations
    
*   Toast notifications for user feedback
    

Typical error codes:

*   `UNAUTHORIZED`: Missing/invalid auth
    
*   `NOT_FOUND`: Resource doesn't exist
    
*   `BAD_REQUEST`: Invalid input/data
    

Future Enhancements
-------------------

1.  Add place search functionality
    
2.  Implement place collections/lists
    
3.  Add user profiles
    
4.  Support more auth providers
    
5.  Add admin moderation tools
    
6.  Implement rate limiting
    
7.  Add place commenting system