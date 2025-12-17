# BookForgePro Frontend

This is the React Native (Expo) frontend for BookForgePro - an AI-powered book generation platform.

## Technology Stack

- **Framework:** React Native with Expo Router (~54.0)
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **Payment:** Stripe React Native SDK
- **State Management:** React Context API
- **Styling:** StyleSheet API with custom design system

## Project Structure

```
frontend/
├── app/                    # Expo Router pages
│   ├── index.tsx          # Landing page
│   ├── create.tsx         # Book creation form
│   ├── preview/[bookId].tsx
│   ├── payment/[bookId].tsx
│   ├── status/[bookId].tsx
│   ├── download/[bookId].tsx
│   └── dashboard.tsx      # User's books
├── components/            # Reusable components
│   └── ui/               # UI component library
├── constants/            # App constants
│   ├── Colors.ts         # Color palette
│   └── BookOptions.ts    # Dropdown options
├── context/              # React Context providers
│   └── BookContext.tsx   # Book state management
├── services/             # API services
│   └── api.ts           # Backend API calls
├── types/                # TypeScript definitions
│   └── index.ts
├── assets/               # Images, fonts (binary files not uploaded)
└── package.json          # Dependencies
```

## Key Features

1. **Landing Page** - Beautiful hero banner with features and pricing
2. **Book Creation** - Comprehensive form with 50+ audience options, 100+ writing styles
3. **FREE Preview** - Users see outline + Chapter 1 before paying
4. **Payment** - Stripe integration for secure payments
5. **Status Tracking** - Real-time progress during book generation
6. **Download** - Multi-format downloads (PDF, DOCX, EPUB)
7. **Dashboard** - User's book library

## Setup Instructions

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

## Configuration

- **Stripe:** Update `STRIPE_PUBLISHABLE_KEY` in `app/_layout.tsx`
- **API Endpoint:** Update `API_BASE_URL` in `services/api.ts`
- **App Config:** Modify `app.json` for branding

## Design System

- **Primary Color:** #4F46E5 (Indigo)
- **Secondary Color:** #7C3AED (Purple)
- **Accent:** #06B6D4 (Cyan)
- **Typography:** System fonts + SpaceMono
- **Layout:** Mobile-first, responsive design

## API Integration

All backend communication happens through `services/api.ts`:

- `generatePreview()` - Creates book preview
- `checkBookStatus()` - Polls generation progress
- `createPaymentIntent()` - Stripe payment setup
- `confirmBookPurchase()` - Finalize payment
- `getDownloadUrls()` - Get book downloads
- `getMyBooks()` - User's book list

## State Management

`BookContext` manages:
- Form data (topic, audience, style, length)
- Current book ID
- Preview data (outline, Chapter 1)
- User email
- My Books list

## Next Steps

**Note:** This upload contains configuration files and type definitions. The following need to be uploaded:

- All component implementations in `components/ui/`
- App screens in `app/` (dashboard, preview, payment, status, download)
- Context implementation (`context/BookContext.tsx`)
- API service implementation (`services/api.ts`)
- Asset files (images, fonts)

These files are available in the local repository at `/home/ubuntu/aiphdwriter-rn-opus/`

## License

Private - All Rights Reserved
