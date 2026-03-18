# API Documentation for Qualiopi FastAPI App

## Overview

This document provides an overview of the API endpoints available in the Qualiopi FastAPI application. The application is designed to facilitate automated document generation in compliance with Qualiopi standards.

## Base URL

The base URL for all API endpoints is:

```
http://localhost:8000/api/v1
```

## Authentication

### Login

- **Endpoint:** `/auth/login`
- **Method:** POST
- **Description:** Authenticates a user and returns a JWT token.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Responses:**
  - **200 OK:** Returns a JWT token.
  - **401 Unauthorized:** Invalid credentials.

### Register

- **Endpoint:** `/auth/register`
- **Method:** POST
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string"
  }
  ```
- **Responses:**
  - **201 Created:** User successfully registered.
  - **400 Bad Request:** Validation errors.

## Document Management

### Create Document

- **Endpoint:** `/documents`
- **Method:** POST
- **Description:** Creates a new document based on provided data.
- **Request Body:**
  ```json
  {
    "title": "string",
    "content": "string"
  }
  ```
- **Responses:**
  - **201 Created:** Document successfully created.
  - **400 Bad Request:** Validation errors.

### Get Document

- **Endpoint:** `/documents/{document_id}`
- **Method:** GET
- **Description:** Retrieves a document by its ID.
- **Responses:**
  - **200 OK:** Returns the document data.
  - **404 Not Found:** Document not found.

### Delete Document

- **Endpoint:** `/documents/{document_id}`
- **Method:** DELETE
- **Description:** Deletes a document by its ID.
- **Responses:**
  - **204 No Content:** Document successfully deleted.
  - **404 Not Found:** Document not found.

## Compliance Check

### Check Compliance

- **Endpoint:** `/compliance/check`
- **Method:** POST
- **Description:** Checks if a document meets Qualiopi compliance standards.
- **Request Body:**
  ```json
  {
    "document_id": "string"
  }
  ```
- **Responses:**
  - **200 OK:** Returns compliance status.
  - **404 Not Found:** Document not found.

## Error Handling

All API responses will include a standard error format in case of failures:

```json
{
  "detail": "Error message"
}
```

## Conclusion

This API provides the necessary endpoints for user authentication and document management, ensuring compliance with Qualiopi standards. For further details, refer to the individual endpoint descriptions above.