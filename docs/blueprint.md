# **App Name**: TubeBatch Downloader

## Core Features:

- CSV Upload & Parsing: Users can upload a CSV file containing YouTube video URLs and desired output titles, which the application will parse for batch processing.
- Batch Download Initiation: Provide a user interface control to initiate the sequential downloading process of all videos listed in the uploaded CSV.
- Real-time Progress Monitor: Display real-time download progress for each individual video, including status (pending, downloading, completed, failed) and overall batch completion.
- Title-based Video Naming: Ensure downloaded video files are automatically named using the titles provided by the user in the CSV.
- ZIP Archive Creation: Upon successful completion of all video downloads, automatically compile them into a single ZIP archive.
- ZIP Archive Download: Enable users to download the generated ZIP archive containing all their title-named videos.
- Download Error Feedback: Provide clear feedback and logging for any videos that fail to download, explaining the reason for failure where possible.

## Style Guidelines:

- Background color: A very dark, subtle bluish-gray to establish a modern, deep dark theme (#131517).
- Primary interactive color: A muted, deep indigo for primary buttons and structural elements, offering a strong contrast against the background (#242D3D).
- Accent color: A vibrant, clear green for progress indicators and important interactive states, ensuring high visibility (#1AFA1A).
- Headline and body text font: 'Inter' (sans-serif) for its modern, clean, and highly readable qualities across all text elements.
- Use sharp, minimalist vector icons for upload, download, progress, and status indicators, aligning with the modern aesthetic.
- A clean, spacious layout with a clear visual hierarchy to easily differentiate between upload controls, the download queue, and individual video progress statuses.
- Subtle and smooth animations for progress bar updates, loading states, and status transitions, enhancing user feedback without being distracting.