
# Real-Time Chat App

This project is a simple real-time chat application built using Node.js, Express, and Socket.IO. It allows users to join different chat rooms, exchange messages, and see a list of active users in each room.

## Features

- User authentication using a unique username.
- Joining and leaving chat rooms.
- Real-time message exchange.
- Displaying a list of users and active rooms.
- Typing activity indicator.

## Technologies Used

- Node.js
- Express
- Socket.IO
- HTML
- CSS

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine. You can download it from [https://nodejs.org/](https://nodejs.org/).

### Installation

1. Clone the repository to your local machine.

```bash
git clone https://github.com/Mohith-o07/Chat-app.git
```

2. Navigate to the project directory.

```bash
cd server
```

3. Install the dependencies.

```bash
npm install
```

### Usage

1. Start the server.

```bash
npm run dev
```

2. Open your browser and go to [http://localhost:3500](http://localhost:3500).

3. Enter your username and the chat room you want to join.

4. Start chatting in real-time!

## File Structure

- `public`: Contains the client-side files.
  - `index.html`: The main HTML file for the chat app.
  - `styles.css`: The stylesheet for styling the chat app.
  - `app.js`: The main JavaScript file handling client-side logic.

- `index.js`: The server-side code for handling Socket.IO connections and managing chat functionality.

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push to your branch.
4. Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Socket.IO Documentation](https://socket.io/docs/)
- [Express Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/en/docs/)

---
