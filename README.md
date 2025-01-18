# NestJS File Upload Service

## Overview

A robust NestJS application that handles file uploads to Google Drive with background processing capabilities. The service accepts URLs of files, downloads them, and uploads them to Google Drive while maintaining a database record of uploaded files.

## Features

- Asynchronous file processing using Bull Queue
- File upload progress tracking
- Google Drive integration
- PostgreSQL database for file records
- Docker containerization
- Input validation
- Error handling

## Prerequisites

- Node.js (v20 or later)
- pnpm
- Docker and Docker Compose
- Google Drive API credentials
- Redis
- PostgreSQL

## Environment Variables

Create a `.env` file in the root directory with the following variables:

# Database

DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_db_name

# Redis

REDIS_HOST=redis
REDIS_PORT=6379

# Google Drive

CLIENT_EMAIL=your_service_account_email
PRIVATE_KEY=your_private_key
GOOGLE_DRIVE_API_SCOPE=https://www.googleapis.com/auth/drive.file
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

The application will be available at `http://localhost:3000`

## API Endpoints

### Upload Files

- **Endpoint:** `/files/upload`
- **Method:** `POST`
- **Description:** Creates a job to upload files from the provided URLs to Google Drive.
- **Request Body:** `{ "fileUrls": ["https://example.com/file1.jpg", "https://example.com/file2.pdf"] }`
- **Response:** `{ "jobId": "1234567890", "message": "Files uploading put in queue" }`

### Get Job Progress

- **Endpoint:** `/files/progress/:jobId`
- **Method:** `GET`
- **Description:** Retrieves the progress of a file upload job.
- **Request Parameters:** `{ jobId: "1234567890" }`
- **Response:** `{ "state": "completed", "progress": 100 }`

### Get All Files

- **Endpoint:** `/files`
- **Method:** `GET`
- **Description:** Retrieves all uploaded files.
- **Response:** `[{"id": 1, "driveFileId": "1234567890", "name": "file1.jpg", "webViewLink": "https://drive.google.com/file/d/1234567890/view", "webContentLink": "https://drive.google.com/uc?export=download&id=1234567890"}]`

### Get File by Drive File ID

- **Endpoint:** `/files/:driveFileId`
- **Method:** `GET`
- **Description:** Retrieves a file by its Google Drive file ID.
- **Request Parameters:** `{ driveFileId: "1234567890" }`
- **Response:** `{"id": 1, "driveFileId": "1234567890", "name": "file1.jpg", "webViewLink": "https://drive.google.com/file/d/1234567890/view", "webContentLink": "https://drive.google.com/uc?export=download&id=1234567890"}`

## Future Improvements

- Store files uploading progress in the database instead of Redis to not overload memory
- Implemented function to cleanup jobs queue
- Use p-limit to limit the number of concurrent file uploads, because with using of Promise.allSettled() if fileUrls array is large, it will exceed rate limits and overwhelm the server
