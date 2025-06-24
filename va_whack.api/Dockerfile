# 1. Use an official Python runtime as a parent image
FROM python:3.11-slim

# 2. Set the working directory in the container
WORKDIR /code

# 3. Copy the dependencies file to the working directory
COPY ./requirements.txt /code/requirements.txt

# 4. Install any needed dependencies specified in requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 5. Copy the application code into the container
COPY ./app /code/app

# 6. Command to run the application
# Uvicorn is run on host 0.0.0.0 to be accessible from outside the container.
# Render automatically sets the PORT environment variable.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]