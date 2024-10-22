# Sniffer Application Setup Guide

Follow this to run the packet sniffer, it has a backend service built with FastAPI and a frontend application built with React.

## Running the FastApi service
1. **Install python packages:**
   ```bash
   $ pip install -r requirements.txt

## Running the FastApi service

1. **Navigate to the server directory:**
   ```bash
   $ cd /server

2. **Run the FastApi server:**
   ```bash
   $ uvicorn main:app --reload

## Running the Frontend service

1. **Navigate to the fronted/sniffer-app directory:**
   ```bash
   $ cd /frontend/sniffer-app

2. **Run the react app:**
   ```bash
   $ npm install
   $ npm run dev
