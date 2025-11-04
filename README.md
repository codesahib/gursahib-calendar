# gursahib-calendar

---

## Overview

* **Backend:** Django, Django REST framework.
* **Frontend:** React

---

## Setup the system
1. Download and install Node.js: https://nodejs.org/en/download
2. Confirm Node.js is installed in the system
```
node -v
```
3. Make sure to have python installed in the system
```
python --version
```

---

## Running the frontend

```
cd frontend
npm install
npm start
```

By default, the frontend runs on `http://localhost:3000` and will call the backend at `http://localhost:8000/api`

---

## Running the backend
1. Install and activate a virtual env
```
cd gursahib-calendar/backend
python -m venv venv
source venv/bin/activate or venv/Scripts/activate
```
2. Install Django and other requirements
```
pip install -r requirements.txt
```
3. Setup migrations
```
python manage.py makemigrations
python manage.py migrate
```
4. Run
```
python manage.py runserver
```