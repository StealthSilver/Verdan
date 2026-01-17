# QR Code Functionality Documentation

## Overview

The QR code system allows users to scan a QR code and view tree details in different modes based on their authentication status.

## How It Works

### 1. QR Code Generation

- **Location**: `QRCodeDisplay.tsx` component
- **URL Format**: `https://verdan-beige.vercel.app/tree/:treeId`
- **Features**:
  - Download QR code as PNG
  - Print QR code with tree name
  - Responsive design

### 2. Public Tree View (Main Landing Page)

- **Route**: `/tree/:treeId`
- **Component**: `PublicTreeView.tsx`
- **Behavior**:

  #### For Non-Authenticated Users:
  - Shows tree details in **read-only mode**
  - Displays blue banner: "You're viewing in read-only mode. Sign in for full access."
  - Shows "Sign In" button in navbar
  - Cannot add records or modify tree data

  #### For Authenticated Users (Admin/User):
  - Shows tree details in **read-only mode** by default
  - Displays green banner: "You're signed in as [role]. Switch to full view to access all features."
  - Navbar shows two options:
    - **"Go to Full View"** - Redirects to authenticated tree detail page with edit capabilities
    - **"Stay in Read-Only"** - Dismisses the banner and continues viewing in read-only mode
  - Can switch to full view at any time

### 3. Authenticated Tree View

- **Routes**:
  - Admin: `/admin/dashboard/:siteId/:treeId`
  - User: `/user/site/:siteId/:treeId`
- **Component**: `TreeDetail.tsx`
- **Features**:
  - Full CRUD operations
  - Add new records
  - Update tree status
  - Delete records
  - View analytics

## User Flow Examples

### Scenario 1: Visitor Scans QR Code (Not Logged In)

1. Scans QR code → Lands on `/tree/:treeId`
2. Sees tree details in read-only mode
3. Can view all images, tree info, growth timeline
4. Cannot add/edit/delete records
5. Can click "Sign In" to authenticate

### Scenario 2: Admin Scans QR Code (Logged In)

1. Scans QR code → Lands on `/tree/:treeId`
2. Sees tree details with green banner
3. Options:
   - Click "Go to Full View" → Redirects to `/admin/dashboard/:siteId/:treeId` (full access)
   - Click "Stay in Read-Only" → Continues viewing without edit capabilities
4. In full view: Can add records, update status, manage tree

### Scenario 3: User Scans QR Code (Logged In)

1. Scans QR code → Lands on `/tree/:treeId`
2. Sees tree details with green banner
3. Options:
   - Click "Go to Full View" → Redirects to `/user/site/:siteId/:treeId` (role-based access)
   - Click "Stay in Read-Only" → Continues viewing without edit capabilities
4. In full view: Can add records, update status (based on permissions)

## API Endpoints

### Public Endpoint

```
GET /public/trees/:treeId
```

- No authentication required
- Returns tree data with populated siteId and plantedBy
- Used by PublicTreeView component

### Admin Endpoint

```
GET /admin/trees/:treeId
Authorization: Bearer <token>
```

- Admin authentication required
- Returns full tree data
- Used by TreeDetail component for admins

### User Endpoint

```
GET /user/sites/:siteId/trees/:treeId
Authorization: Bearer <token>
```

- User authentication required
- Returns tree data scoped to user's accessible sites
- Used by TreeDetail component for users

## Benefits

1. **Flexibility**: Users can choose between quick read-only view or full authenticated access
2. **No Forced Login**: Visitors can view tree details without creating an account
3. **Smooth UX**: Authenticated users see a clear prompt to switch to full view
4. **Single QR Code**: One QR code works for everyone, regardless of auth status
5. **Security**: Sensitive operations still require authentication

## Migration Notes

- Old QR codes with format `/admin/dashboard/:siteId/:treeId` are handled by QRRedirect component
- QRRedirect automatically redirects to `/tree/:treeId` format
- All new QR codes use the public route format
