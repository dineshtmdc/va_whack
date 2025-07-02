# Vision Testing App API

This project contains the back-end API for the "Vision Testing App with Gamification". It is built with Python and FastAPI and is designed for deployment on Render with a PostgreSQL database.

---

## Project Overview

This API serves as the central hub for the application, with the following key responsibilities:

- **Player Management:** Handles new player registration and a secure, passwordless login flow using one-time PINs sent via email.
- **Multi-Game Support:** Designed to process data from multiple types of visual acuity games (Engagement Mode, VA OKN Fast Mode & VA Scal Mode ).
- **Data Processing:** Receives raw trial data from game sessions, validates it, and uses game-specific algorithms to calculate clinical metrics like logMAR scores.
- **Data Persistence:** Securely stores all player information, game sessions, raw trial data, and calculated analysis results in a PostgreSQL database.
- **AI-Powered Reporting:** Integrates with the OpenAI API to generate user-friendly, narrative summaries of a player's performance after each session.
- **Email Notifications:** Uses SendGrid to deliver both authentication PINs and the final AI-generated summary reports directly to the player's email.

---

## How to Run Locally (For First-Time Setup)

Follow these instructions to get the API running on your local machine for development.

### **Prerequisites**
- **Python** (version 3.8 or newer)
- **Docker Desktop** (must be installed and running)

---

### **Step 1: Get the Code**
Clone the repository to your local machine:
```bash
git clone git@gitlab.com:group_g4/va_whack.git
cd va_whack.api
```

### **Step 2: Set Up the Local Database**
This command will start a PostgreSQL database inside a Docker container. You only need to run this once.

In your terminal, run:
```bash
 docker run --name vision-app-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=vision_app_db -p 5432:5432 -d postgres
```
This will run the database in the background. You can stop or start it from the Docker Desktop application.

### **Step 3: Configure Environment Variables**
1. In the project's root directory, create a new file named `.env`.
2. Copy the content below into your new `.env` file.
3. **Important:** Replace the values for your SendGrid API key, sender email, OpenAI key, and generate a new SECRET_KEY.

```env
# .env file content

# This URL connects to the local Docker database you just started
DATABASE_URL="ppostgresql://user:password@localhost:5432/vision_app_db"

# Get your API key from your SendGrid account
SENDGRID_API_KEY="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"

# This must be an email address you have verified as a sender in SendGrid
SENDER_EMAIL="visionwhack@gmail.com"```
# Get your API key from your OpenAI account
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"

# --- AI Model Configuration (Optional) ---
OPENAI_MODEL="gpt-4o"
OPENAI_TEMPERATURE=0.6
OPENAI_MAX_TOKENS=200
# Generate a strong secret key by running this in a Python shell:

Generate a strong secret key. You can run this in a Python shell:
import secrets; secrets.token_hex(32)
  
SECRET_KEY="7796b7e46734d6fe1647903c981f287c0c7ceb0160f47872cc1c10c970ee1d6c"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

### **Step 4: Set Up Python Environment & Install Dependencies**
1.  **Create a virtual environment:**
    From the root directory (`va_whack.api/`)    
    ```bash
    python -m venv .venv
    ```
2.  **Activate the virtual environment:**
    - On Windows: `.venv\Scripts\activate`
    - On macOS/Linux: `source .venv/bin/activate`

3.  **Install all required libraries:**
    ```bash
    pip install -r requirements.txt
    ```

### **Step 5: Run the API Server**
Now you are ready to start the application.

From the root directory (`va_whack.api/`), run:
```bash
uvicorn app.main:app --reload
```
The server will start, and you will see output confirming it's running on `http://127.0.0.1:8000`.

### **Step 6: Access the API Docs**
Open your web browser and go to the following URL to see the interactive API documentation and test the endpoints:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

