# Vaultigo Password Manager 🔐

## Overview

Vaultigo is a secure, client-side encrypted password manager that prioritizes user privacy and data protection. Built with Next.js and Supabase, Vaultigo offers a comprehensive solution for managing and protecting your digital credentials.

## 🌟 Key Features

### 1. Secure Password Storage

- Client-side encryption using AES-256
- Master password-based key derivation with Argon2
- Zero-knowledge architecture ensures your passwords are never stored in plain text

### 2. Phishing Detection

- AI-powered email phishing detector
- Machine learning models analyze email content for potential threats
- Provides real-time threat assessment and safety recommendations

### 3. Breach Monitoring

- Check passwords and email addresses against known data breaches
- Integrates with Have I Been Pwned (HIBP) API
- Caches and rate-limits breach checks for efficiency

### 4. Import & Export

- Import passwords from Chrome
- Export passwords to CSV
- Secure handling of credential transfers

## 🚀 Tech Stack

- **Frontend**:

  - Next.js 15
  - React
  - Tailwind CSS
  - CryptoJS for encryption

- **Backend**:

  - Supabase (Database & Authentication)
  - FastAPI (Phishing Detection Microservice)
  - Scikit-learn (Machine Learning Models)

- **Security Technologies**:
  - AES-256 Encryption
  - PBKDF2 Key Derivation
  - K-Anonymity for Password Breach Checks

## 📦 Project Structure

```
vaultigo/
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Page components
│   │   ├── components/         # Reusable React components
│   │   ├── lib/                # Utility functions
│   │   └── styles/             # Global styles
│
├── phishing_api/               # Phishing Detection Microservice
    ├── app.py                  # FastAPI application
    ├── levelone_check.py       # Phishing detection logic
    └── localmodel.py           # ML model inference

```

## 🔧 Setup and Installation

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase Account
- Python (for phishing API)

### Frontend Setup

1. Clone the repository
2. Navigate to `frontend/`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=your_phishing_api_url
   HIBP_API_KEY=your_hibp_api_key
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

### Phishing API Setup

1. Navigate to `phishing_api/`
2. Create a virtual environment
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API:
   ```bash
   uvicorn app:app --reload
   ```

## 🛡️ Security Highlights

- **Zero-Knowledge Architecture**: Passwords are encrypted before leaving the client
- **Master Password Verification**: Uses a unique verification mechanism
- **Secure Key Derivation**: PBKDF2 with 100,000 iterations
- **Breach Monitoring**: Uses k-anonymity for secure password checks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙌 Acknowledgments

- [Supabase](https://supabase.com)
- [Have I Been Pwned](https://haveibeenpwned.com)
- [Next.js](https://nextjs.org)
- [Scikit-learn](https://scikit-learn.org)

---

**Disclaimer**: While Vaultigo implements robust security measures, always follow best practices for password management and security.
