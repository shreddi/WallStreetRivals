# backend/Docker 

FROM python:3.11.3

WORKDIR /app

COPY requirements.txt ./
RUN pip install -r requirements.txt

ENV PYTHONUNBUFFERED=1

COPY . .

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]