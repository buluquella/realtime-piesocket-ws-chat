# 🚀 Realtime Chat App

A simple and efficient realtime chat application built using PieSocket, WebSockets, PHP, MySQL, and JavaScript. Users can create chat rooms, join existing rooms, and chat with other users in real-time.

> :information_source: You are welcome to use my database for testing purposes. However, for your own projects, it's recommended to set up your own database.

## 🌟 Features

- 🚪 User registration and login system
- 🏠 Create and join chat rooms
- 💬 Real-time messaging
- 📢 Room member join and leave notifications

## 🛠️ Technologies Used

- [PieSocket](https://www.piesocket.com/)
- [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [PHP](https://www.php.net/)
- [MySQL](https://www.mysql.com/)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)

## 📦 Installation

1. 📥 Clone the repository or download the source code.
2. 📚 Import the provided `database.sql` file into your MySQL server to create the necessary tables.
3. ⚙️ Update the `dbconfig.php` file with your MySQL server credentials and connection details.
4. 🌐 Upload the project files to your web server.
5. 🌟 Access the application in your browser by navigating to the corresponding URL.

> :information_source: You can test the app at [here](https://buluquella.fun/test/chatting_app/index.html).

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

#### Inserting and querying data

Inserting data into the hypertable is done via normal SQL commands:

```sql
-- Create the 'users' table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL
);

-- Create the 'rooms' table
CREATE TABLE `rooms` (
  `id` VARCHAR(6) PRIMARY KEY,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```


## 📜 License

[MIT](https://choosealicense.com/licenses/mit/)
