# Classdy - Student Attendance & Schedule Assistant

Classdy is a modern, offline-first Progressive Web App (PWA) designed to help students manage their academic life. It provides a comprehensive suite of tools for tracking attendance, viewing schedules, analyzing performance, and staying organized with a helpful chat assistant.

![Classdy Screenshot](https://raw.githubusercontent.com/mhmzdev/classdy/main/public/screenshot.png)

---

## ✨ Features

- **📊 Overview Dashboard**: Get a quick glance at your key stats, including average arrival time, on-time rate, and arrival time trends over various periods.
- **🗓️ Daily Dashboard**: See your status for the current day, your on-time streak, and your full schedule for today with integrated task management.
- **📅 Schedule Management**: A detailed weekly and daily view of your class schedules. The built-in schedule editor allows for full customization.
- **📈 Analytics & Reports**:
    - **Punctuality Pie Chart**: A visual breakdown of your on-time, late, and absent days.
    - **Lateness Trend**: An area chart showing your average lateness by week.
    - **Calendar Heatmap**: A GitHub-style heatmap providing a year-long overview of your daily attendance status.
- **🤖 Chat Assistant**: A rule-based, offline chat assistant that can answer questions about your schedule and tasks (e.g., "What's my schedule for Monday?", "Do I have any homework?").
- **⚙️ Comprehensive Settings**:
    - Customize the app's theme and accent color.
    - Manage subject colors and icons.
    - Import and export all your application data as a single JSON file for backup and portability.
- **🌐 Offline First (PWA)**: Classdy is a fully-featured Progressive Web App. It works 100% offline, ensuring you always have access to your data.
- **📱 Responsive Design**: A clean and intuitive UI that works seamlessly on both desktop and mobile devices.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) (with Hooks)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/en/) (version 18.x or later) and [npm](https://www.npmjs.com/) installed on your computer.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/YOUR_USERNAME/classdy.git
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd classdy
    ```

3.  **Install dependencies:**
    ```sh
    npm install
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

The application should now be running on `http://localhost:5173` (or the next available port).

---

## 🏗️ Building for Production

To create a production-ready build of the application, run the following command:

```sh
npm run build
```

This will generate a `dist` folder containing the optimized static assets of your application. You can preview the production build locally with:

```sh
npm run preview
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
