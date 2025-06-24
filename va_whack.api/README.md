# VA-Whack API

This project contains the back-end API for the visual acuity testing game. It is built with Python and FastAPI and is designed and deployment on Render which is a modern cloud hosting platform with a PostgreSQL database.

## Project Overview

This API is responsible for:
- Player registration and email verification using a PIN sent via SendGrid.
- Receiving game session data from the front-end client (`va_whack.web`).
- Validating and storing player and game data in a PostgreSQL database.
- Calculating a visual acuity score (in logMAR) based on the game trials.

## How to Run the Application

## **Prerequisites**
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

```env
# .env file content

# This URL connects to the local Docker database you just started
DATABASE_URL="ppostgresql://user:password@localhost:5432/vision_app_db"

# Get your API key from your SendGrid account
SENDGRID_API_KEY="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"

# This must be an email address you have verified as a sender in SendGrid
SENDER_EMAIL="visionwhack@gmail.com"
```

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

