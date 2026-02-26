# TubeBatch Downloader

TubeBatch is a modern, production-ready web application designed for high-speed batch processing of YouTube video downloads from CSV lists. It features a secure, cloud-synced queue system with automatic privacy-focused data purging.

## 🚀 The 4-Step Workflow

1.  **Smart Upload**: Drag and drop any CSV file. Our intelligent parser scans all columns to find YouTube URLs and custom titles automatically.
2.  **Instant Queue**: Transition immediately to a secure cloud workspace. Your download list is saved to Firestore, allowing you to refresh or return later.
3.  **Rapid Processing**: Click "Start Batch" to begin sequential stream capture. Watch real-time progress bars for every item in your library.
4.  **Secure Archive**: Once finished, download a single ZIP file containing all your videos. To protect your privacy, all batch data and archives are automatically purged from our servers **4 hours** after completion.

## ✨ Key Features

- **Anonymous Cloud Sync**: No account needed. Every user is automatically assigned a private, secure workspace via Firebase Anonymous Auth.
- **Real-time Updates**: Powered by Firestore listeners, your queue stays in sync across multiple tabs or devices.
- **Aggressive CSV Parsing**: No strict header requirements. We find the data, you get the videos.
- **Privacy First**: Built-in countdown timer shows exactly when your temporary cloud storage expires.
- **Modern UI**: A "glass-card" dark-themed aesthetic built with Tailwind CSS and Shadcn UI.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Firebase & Firestore
- **Styling**: Tailwind CSS & Lucide Icons
- **UI Components**: Radix UI & Shadcn
- **Compression**: JSZip for client-side archiving

## 🔧 Getting Started

### Prerequisites
- Node.js (Latest LTS)
- A Firebase Project (Firestore and Anonymous Auth enabled)

### Local Development
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up your environment variables in `.env.local` or update `src/firebase/config.ts` with your project credentials.
4. Run the development server: `npm run dev`
5. Open [http://localhost:9002](http://localhost:9002) to view the result.

## 🛡 Security & Privacy
TubeBatch is designed to be a temporary transit point. We do not store your data permanently. The Firestore Security Rules enforce strict user ownership, ensuring that only you can see your batches. All data is automatically set for deletion 4 hours after your batch finishes processing.
