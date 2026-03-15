# PinPoint – Campus Event Discovery Platform

PinPoint is a web application that helps students discover and track events happening around campus such as talks, workshops, and club activities.

The goal of the platform is to provide a simple way for students to see **what events are happening, where they are, and how to attend them.**

---

## Features

- View upcoming campus events
- See event details (venue, timing, description)
- Track number of attendees
- Register for events
- Map integration to locate venues easily

---

## Tech Stack

**Frontend**
- React
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express

**Other Tools**
- Git
- GitHub

---

## Project Structure

```
pinpoint/
│
├── pinpoint-frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── pesmap.jpeg
│   │
│   └── src/
│       ├── api/
│       ├── pages/
│       ├── App.js
│       ├── index.js
│       └── styles.css
│
├── pinpoint-backend/
│   ├── server.js
│   ├── package.json
│   └── data/
│       ├── events.json
│       └── users.json
```

---

## Running the Project

### Start the backend

```
npm install
node server.js
```

### Start the frontend

```
npm install
npm start
```

---

## About the Project

This project was built as part of a web development course project to practice **full-stack development using React and Node.js**.

The idea was to create a simple platform where students can easily find and register for events happening across campus.
