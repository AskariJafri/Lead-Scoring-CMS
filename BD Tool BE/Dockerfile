# Dockerfile
FROM python:3.11

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

# Install ping
RUN apt-get update && apt-get install -y iputils-ping

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 8000

CMD ["python", "main.py"]
