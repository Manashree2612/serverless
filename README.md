# Cloud Function for Email Verification

This repository contains the implementation of a Google Cloud Function responsible for handling email verification for newly created user accounts.

## Overview

The Cloud Function is triggered by a Pub/Sub message indicating the creation of a new user account. It performs the following tasks:

- Sends an email to the user with a verification link.
- Tracks the emails sent in a Cloud SQL instance.

## Implementation

- **Technologies Used**: Google Cloud Functions, Pub/Sub, Cloud SQL, Node.js.
- **Project Structure**: `index.js`, `package.json`, `README.md`.
- **Cloud Function Logic**: Generates verification token, constructs verification link, sends email, and tracks emails in Cloud SQL.
- **Environment Variables**: Ensure necessary variables are set for Mailgun and MySQL connection details.

## Setup Instructions

1. **Create Pub/Sub Topic**: Set up a topic to trigger the Cloud Function.
2. **Deploy Cloud Function**: Deploy to GCP, setting environment variables.
3. **Configure Cloud SQL**: Set up an instance and database.
4. **Set IAM Permissions**: Grant necessary permissions.
5. **Test**: Verify functionality with test messages.

## Contributing
Contributions are welcome! Submit bug reports, feature requests, or pull requests.

## License
This project is licensed under the MIT License.
