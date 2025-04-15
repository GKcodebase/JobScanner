 # Job Scanner Plugin Technical Specification

## Business Goal

Develop a Chrome extension that enhances and automates the job application process by enabling users to:

- **Scan job listings** on websites (e.g., LinkedIn, Handshake, or other job boards) to extract key details such as job title, requirements, skills, compensation, and sponsorship/clearance restrictions.
- **Analyze job descriptions** to calculate a match rate between the user’s resume and the job posting, providing insights into qualification alignment.
- **Store a PDF resume** within the plugin for use in match analysis and document generation.
- **Generate ATS Score** Give option to check ATS score for the resume based on industry standards.
- **Give suggestions to improve Resume** Based on ATS based system analysis, give suggestions to improve resume.
- **Generate custom resumes and cover letters** tailored to the scanned job details using AI.
- **Flag restrictions** on sponsorship or clearance to alert the user of potential ineligibility.
- **Provide user settings** for managing the Gemini API key, selecting the AI model, and uploading/updating the resume PDF.

This plugin aims to save time, personalize applications, and help users assess their fit for job opportunities efficiently.

---

## Technical Requirements

- **Platform**: Chrome browser extension.
- **AI Integration**:
  - **Job Detail Extraction**: Leverage the Gemini API to extract structured job information (e.g., job title, requirements, skills, compensation, sponsorship/clearance restrictions) from webpage text.
  - **Resume Detail Extraction**: Use the Gemini API to extract structured data (e.g., skills, experience, education) from the user’s resume text.
  - **Match Analysis**: Employ the Gemini API to compare job details and resume details, calculating a match rate and providing a detailed breakdown of alignment.
  - **Document Generation**: Utilize the Gemini API to create tailored resumes and cover letters based on job details and the stored resume.
  - **ATS Score and Suggestions**: Utilize the Gemini API to analyze the resume for ATS compatibility (e.g., keyword density, formatting, clarity) and generate an ATS score (0-100) along with actionable suggestions to improve scannability.
- **PDF Handling**: Integrate `pdf.js` to extract text from the user’s resume PDF.
- **Storage**: Use Chrome’s `storage` API to persistently store the resume PDF, Gemini API key, and selected AI model, with Firebase Firestore for user authentication data and usage metrics.
- **Authentication**: Implement Firebase Authentication to support user login via email/password, Google, or Apple accounts, capturing user details (e.g., email, UID) for analytics purposes.
- **Analytics**: Use Firebase Analytics to track usage frequency of the Job Scan, ATS Score, and Resume Modification (document generation) features, logging events like `job_scan`, `ats_score_check`, and `resume_generate`.
- **Crash Reporting**: Integrate Firebase Crashlytics to capture and report extension crashes, including stack traces and user context, for debugging and improvement.
- **API**: Integrate with the Gemini API for text extraction, match analysis, ATS analysis, and document generation, and with Firebase APIs (Authentication, Analytics, Crashlytics, Firestore) for user management and metrics.
- **Deployment**: Distributed via the Chrome Web Store or manual installation.

---

## UI Requirements

- **Popup Interface**:
  - **Scan Button**: Initiates scanning of the current webpage for job details.
  - **Job Details Display**: Presents extracted details (e.g., job title, requirements, skills, compensation, sponsorship/clearance restrictions), with restrictions highlighted or flagged.
  - **Analyze Match Button**: Triggers match analysis between the job details and the user’s resume.
  - **Match Analysis Display**: Shows the match rate (e.g., 85%) and a breakdown of how qualifications align with job requirements.
  - **Generate Button**: Starts the creation of a custom resume and cover letter.
  - **Generated Documents Display**: Displays the generated resume and cover letter for review or download.
  - **ATS Score Button**: Triggers ATS analysis of the stored resume, displaying a score and suggestions.
  - **ATS Score Display**: Shows the ATS score (e.g., "ATS Score: 75/100") and a list of suggestions (e.g., "Add keywords like 'Python,' simplify section headers").
  - **Settings Link**: Navigates to the settings page.
  - **Login/Logout Button**: Prompts user to log in with Firebase-supported methods (email, Google, Apple) or log out, visible if not authenticated.
- **Settings Page**:
  - **Gemini API Key Input**: Text field for entering or updating the API key.
  - **Model Selection**: Dropdown or text input to choose the Gemini AI model (if applicable).
  - **Resume Upload**: File input for uploading or updating the resume PDF.
  - **User Profile**: Displays logged-in user’s email (from Firebase Authentication) and option to manage account data (e.g., view usage summary, delete account).

---

## Directory Structure

```
job-scanner-plugin/
├── background.js          # Manages API calls, PDF processing, and communication
├── content.js             # Extracts webpage text
├── popup.html             # Popup UI
├── popup.js               # Popup logic
├── settings.html          # Settings UI
├── settings.js            # Settings logic
├── manifest.json          # Extension configuration
└── lib/
    ├── pdf.js             # PDF text extraction library
    └── firebase.js        # Firebase SDK initialization and utilities
```

---

## API Integration

- **Gemini API**:
  - **Extract Job Details**:
    - **Request**: POST with webpage text and prompt (e.g., "Extract job title, requirements, skills, compensation, sponsorship, and clearance restrictions from this text: [text]").
    - **Response**: JSON (e.g., `{ "title": "Software Engineer", "requirements": "...", "skills": "...", "compensation": "₹50,000/month", "sponsorship": "No visa sponsorship" }`).
  - **Extract Resume Details**:
    - **Request**: POST with resume text and prompt (e.g., "Extract skills, work experience, and education from this resume: [resume text]").
    - **Response**: JSON (e.g., `{ "skills": ["Java", "C++", "Machine Learning"], "experience": "5 years as a Software Developer", "education": "Master's in Computer Science" }`).
  - **Analyze Match**:
    - **Request**: POST with job and resume details, and prompt (e.g., "Analyze the match between job requirements: [job details] and resume: [resume details]. Provide a match rate and breakdown.").
    - **Response**: JSON (e.g., `{ "match_rate": 85, "details": { "skills": { "matched": ["Java"], "missing": ["Python"], "match_percentage": 50 }, "experience": { "required": "3+ years", "user": "5 years", "meets_requirement": true }, "education": { "required": "Bachelor's", "user": "Master's", "meets_requirement": true } } }`).
  - **Generate Documents**:
    - **Request**: POST with job details and resume text, and prompt (e.g., "Generate a tailored resume and cover letter for this job: [job details] using this resume: [resume text]").
    - **Response**: JSON with generated resume and cover letter text.
  - **Analyze ATS Score**:
    - **Request**: POST with resume text and prompt (e.g., "Analyze this resume for ATS compatibility: [resume text]. Provide a score (0-100) and suggestions to improve scannability.").
    - **Response**: JSON (e.g., `{ "ats_score": 75, "suggestions": ["Add keywords: Python, SQL", "Use standard section headers like 'Experience'", "Remove complex formatting"] }`).
- **Firebase APIs**:
  - **Authentication**:
    - **Request**: Sign in with email/password, Google, or Apple via Firebase Authentication SDK.
    - **Response**: User object with UID, email, and access token, stored locally and synced with Firestore.
  - **Analytics**:
    - **Events**:
      - `job_scan`: Logged when the Scan button is clicked.
      - `ats_score_check`: Logged when the ATS Score button is clicked.
      - `resume_generate`: Logged when the Generate button is clicked.
    - **Properties**: Include user ID (anonymized), timestamp, and feature-specific data (e.g., job title for scans).
    - **Storage**: Events are sent to Firebase Analytics for real-time tracking and reporting.
  - **Crashlytics**:
    - **Request**: Automatically captures unhandled errors and crashes via Firebase Crashlytics SDK.
    - **Response**: Crash reports with stack traces, user context (e.g., UID), and device info, accessible via Firebase Console.
  - **Firestore**:
    - **Collection**: `users/{uid}/usage`
    - **Documents**: Store per-user metrics (e.g., `{ "job_scans": 5, "ats_checks": 2, "resume_generations": 3, "last_updated": timestamp }`).
    - **Purpose**: Backup for analytics data and user-specific usage summaries.

---

## Workflow

1. **Installation**: User installs the extension via the Chrome Web Store or manually.
2. **Authentication**:
   - User opens the popup and is prompted to log in with email/password, Google, or Apple via Firebase Authentication.
   - After login, user details (e.g., UID, email) are stored in Chrome’s `storage` API and synced with Firestore, enabling analytics tracking.
3. **Scanning**:
   - User visits a job listing webpage (e.g., LinkedIn).
   - User opens the popup and clicks "Scan."
   - Content script extracts webpage text and sends it to the background script.
   - Background script sends text to the Gemini API, receiving structured job details.
   - Firebase Analytics logs a `job_scan` event with user ID and job title.
   - Popup displays job details, flagging restrictions.
4. **Resume Storage**:
   - User uploads a resume PDF via the settings page.
   - PDF is stored in Chrome’s `storage` API.
5. **Match Analysis**:
   - User clicks "Analyze Match with Resume" in the popup.
   - Background script extracts resume text using `pdf.js`.
   - Job details and resume text are sent to the Gemini API for analysis.
   - Popup displays the match rate and breakdown.
6. **ATS Score and Suggestions**:
   - User clicks "Check ATS Score" in the popup.
   - Background script extracts resume text using `pdf.js` (if not already cached).
   - Resume text is sent to the Gemini API for ATS analysis.
   - Firebase Analytics logs an `ats_score_check` event with user ID and score.
   - Popup displays the ATS score and a list of suggestions for improvement.
7. **Generation**:
   - User clicks "Generate" in the popup.
   - Background script extracts resume text (if not already done).
   - Job details and resume text are sent to the Gemini API.
   - Firebase Analytics logs a `resume_generate` event with user ID and job title.
   - Popup displays the generated resume and cover letter.
8. **Crash Reporting**:
   - Any unhandled errors or crashes are captured by Firebase Crashlytics.
   - Reports are sent to the Firebase Console with user context (e.g., UID) and stack traces.

---

## Detailed Component Breakdown

### Chrome Extension

- **Manifest File (`manifest.json`)**:
  ```json
  {
    "manifest_version": 3,
    "name": "Job Scanner Plugin",
    "version": "1.0",
    "permissions": ["activeTab", "storage", "identity"],
    "background": { "service_worker": "background.js" },
    "action": { "default_popup": "popup.html" },
    "content_scripts": [
      {
        "matches": ["<all_urls>"],
        "js": ["content.js"]
      }
    ]
  }
  ```
- **Content Script (`content.js`)**:
  - Extracts webpage text via `document.body.innerText`.
  - Sends data to background script using `chrome.runtime.sendMessage`.
- **Background Script (`background.js`)**:
  - Handles Gemini API requests for extraction, match analysis, ATS analysis, and document generation.
  - Manages Firebase Authentication for user login and session handling.
  - Logs events to Firebase Analytics for feature usage (e.g., `job_scan`, `ats_score_check`, `resume_generate`).
  - Initializes Firebase Crashlytics for error reporting.
  - Extracts resume text with `pdf.js`.
  - Syncs usage data with Firestore for persistent metrics.
- **Popup (`popup.html` and `popup.js`)**:
  - Displays UI with "Scan," "Analyze Match," "Check ATS Score," "Generate," and "Login/Logout" buttons.
  - Shows job details, match results, ATS score with suggestions, and generated documents.
  - Integrates Firebase Authentication UI for login/logout flows.
- **Settings (`settings.html` and `settings.js`)**:
  - Manages API key input, model selection, PDF upload, and user account details (e.g., email from Firebase).
  - Displays usage summary (e.g., number of scans) fetched from Firestore.
- **Firebase Utilities (`lib/firebase.js`)**:
  - Initializes Firebase SDK with Authentication, Analytics, Crashlytics, and Firestore.
  - Provides helper functions for login, event logging, and data syncing.

### Data Flow

- **Authentication**: Popup → Firebase Authentication → Storage/Firestore.
- **Scanning**: Content script → Background script → Gemini API → Firebase Analytics → Popup.
- **Match Analysis**: Popup → Background script (PDF extraction) → Gemini API → Popup.
- **ATS Analysis**: Popup → Background script (PDF extraction) → Gemini API → Firebase Analytics → Popup.
- **Generation**: Popup → Background script (PDF extraction) → Gemini API → Firebase Analytics → Popup.
- **Crash Reporting**: Background script → Firebase Crashlytics.

---

## Challenges and Considerations

- **Extraction Accuracy**: Varied job listing formats may challenge Gemini API accuracy.
  - **Mitigation**: Allow manual editing of extracted details.
- **Website Compatibility**: Dynamic content or anti-scraping measures may hinder extraction.
  - **Mitigation**: Test on major platforms and refine logic.
- **PDF Handling**: Image-based PDFs or odd fonts may fail text extraction.
  - **Mitigation**: Recommend text-based PDFs.
- **API Usage**: Frequent calls to Gemini API (especially with match and ATS analysis) may hit limits or incur costs.
  - **Mitigation**: Note API charges in settings; optimize calls.
- **Firebase Usage**: Analytics and Firestore may incur costs with high usage.
  - **Mitigation**: Use lightweight data structures; monitor quotas in Firebase Console.
- **Security**: Local storage of API keys, resumes, and Firebase tokens poses risks.
  - **Mitigation**: Use Chrome security policies; encrypt sensitive data; advise key privacy.
- **Performance**: Large texts, PDFs, or frequent Firebase writes may slow processing.
  - **Mitigation**: Implement async operations, caching, and loading indicators.
- **Crash Reporting**: Crashlytics may miss some extension-specific errors due to Chrome’s sandboxing.
  - **Mitigation**: Add custom error logging to complement Crashlytics.

---

## Non-Functional Requirements

- **Code Documentation**:
  - All critical components (e.g., API handlers, authentication logic, PDF processing) must include inline comments explaining functionality and purpose.
  - Maintain a `README.md` with setup, usage, and contribution guidelines.
  - Use JSDoc for JavaScript functions to document parameters, return values, and exceptions.
- **Logging**:
  - Implement logging for key operations (e.g., API calls, authentication attempts, errors) using `console.log` for development and a lightweight logging library (e.g., `loglevel`) for production.
  - Logs should capture timestamps, operation type, and error details without exposing sensitive data (e.g., API keys, user emails).
  - Firebase Crashlytics logs are used for crash events, supplemented by custom logs for feature usage.
- **Code Organization**:
  - Structure code into logical packages/modules (e.g., `api/`, `auth/`, `ui/`, `utils/`) within the extension directory.
  - Each module should handle a single responsibility (e.g., `api/gemini.js` for Gemini API calls, `auth/firebase.js` for authentication).
  - Separate Firebase-related logic into `lib/firebase.js` for modularity.
- **Code Size Limits**:
  - No file should exceed 500 lines, excluding comments and blank lines.
  - No function should exceed 50 lines to ensure readability and maintainability.
  - Split large files/functions into smaller, focused units if limits are approached.
- **Design Principles**:
  - Adhere to **SOLID principles**:
    - **Single Responsibility**: Each module/class handles one task (e.g., `pdf.js` only processes PDFs).
    - **Open/Closed**: Design for extension (e.g., support additional auth providers via configuration).
    - **Liskov Substitution**: Not heavily applicable due to minimal inheritance, but ensure polymorphic behavior where used.
    - **Interface Segregation**: Keep interfaces (e.g., API handlers) focused to avoid forcing unused methods.
    - **Dependency Inversion**: Depend on abstractions (e.g., generic API caller) rather than concrete implementations.
  - Follow industry standards:
    - Use **ESLint** with Airbnb or Google style guides for consistent code formatting.
    - Apply **Prettier** for automated code formatting.
    - Write unit tests using **Jest** for critical logic (e.g., ATS score parsing, Firebase event logging), targeting 80% coverage.
    - Perform code reviews for all changes to ensure quality and adherence to standards.

---

## Additional Notes

- **Storage Limits**: Chrome’s `storage` API has limits (e.g., 8MB for `sync`). Keep PDFs small.
- **Gemini API**: Verify endpoint details and model options in official documentation.
- **Firebase Configuration**: Set up Firebase project with Authentication, Analytics, Crashlytics, and Firestore enabled; secure with proper rules to limit data access.
- **UI Design**: Use basic HTML/CSS/JS or a framework like React for enhancement.
- **Analytics Data**: Usage metrics (e.g., scan counts) are stored in Firestore and accessible via Firebase Analytics dashboards for developer analysis.
- **ATS Analysis**: Suggestions focus on common ATS requirements (e.g., keywords, simple formatting) to maximize compatibility.
- **Crash Reporting**: Firebase Crashlytics provides real-time alerts and detailed reports to improve extension stability.