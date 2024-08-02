const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;


app.use(cors());
app.use(bodyParser.json());


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'chat',
    password: '12345',
    port: 5432,
});

// Kullanıcıların listesi
app.get('/users', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, username, isactive FROM users');
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Kullanıcı girişi
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, username FROM users WHERE username = $1 AND password = $2', [username, password]);

        if (result.rows.length > 0) {
            const userId = result.rows[0].id;
         
            await client.query('UPDATE users SET isactive = TRUE WHERE id = $1', [userId]);
            client.release();
            res.json({ success: true, userId, message: 'Login successful' });
        } else {
            client.release();
            res.json({ success: false, message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Kullanıcı kaydı
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        const client = await pool.connect();
        const existingUser = await client.query('SELECT * FROM users WHERE username = $1', [username]);

        if (existingUser.rows.length > 0) {
            client.release();
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        await client.query('INSERT INTO users (username, password, isactive) VALUES ($1, $2, FALSE)', [username, password]);
        client.release();

        res.json({ success: true, message: 'Registration successful' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Kullanıcı çıkışı 
app.post('/logout', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        const client = await pool.connect();
        await client.query('UPDATE users SET isactive = FALSE WHERE id = $1', [userId]);
        client.release();

        res.json({ success: true, message: 'Logout successful' });
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Önceki sohbetler
app.get('/previous-chats/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`
            SELECT DISTINCT ON (CASE WHEN sender = $1 THEN receiver ELSE sender END) 
                m.id, 
                CASE WHEN sender = $1 THEN receiver ELSE sender END AS chatUserId,
                u.username AS chatUser,
                u.isactive AS chatUserStatus
            FROM messages m
            JOIN users u ON (CASE WHEN m.sender = $1 THEN m.receiver ELSE m.sender END) = u.id
            WHERE m.sender = $1 OR m.receiver = $1
        `, [userId]);
        client.release();

        res.json(result.rows.length > 0 ? result.rows : []);
    } catch (err) {
        console.error('Error fetching previous chats:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Mesajlar
app.get('/messages/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT id, message, sender, receiver 
             FROM messages 
             WHERE (sender = $1 AND receiver = $2) 
                OR (sender = $2 AND receiver = $1) 
             ORDER BY id ASC`, [senderId, receiverId]
        );
        client.release();

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('login', async ({ username }) => {
        try {
            const client = await pool.connect();
            await client.query('UPDATE users SET isactive = TRUE WHERE username = $1', [username]);
            client.release();
            io.emit('userStatusChange', { username, isActive: true });
        } catch (err) {
            console.error('Error during login:', err);
        }
    });

    socket.on('logout', async ({ username }) => {
        try {
            const client = await pool.connect();
            await client.query('UPDATE users SET isactive = FALSE WHERE username = $1', [username]);
            client.release();
            io.emit('userStatusChange', { username, isActive: false });
        } catch (err) {
            console.error('Error during logout:', err);
        }
    });

    socket.on('fetchPreviousChats', async ({ userId }) => {
        try {
            const client = await pool.connect();
            const result = await client.query(
                `SELECT DISTINCT ON (CASE WHEN sender = $1 THEN receiver ELSE sender END) id, 
                 CASE WHEN sender = $1 THEN receiver ELSE sender END AS chatUser
                 FROM messages
                 WHERE sender = $1 OR receiver = $1`, [userId]
            );
            client.release();
            socket.emit('previousChats', result.rows);
        } catch (err) {
            console.error('Error fetching previous chats:', err);
        }
    });

    socket.on('sendMessage', async (messageData) => {
        try {
            console.log(messageData);
            const { message, sender, receiver } = messageData;
            const client = await pool.connect();
            await client.query(
                'INSERT INTO messages (message, sender, receiver) VALUES ($1, $2, $3)',
                [message, sender, receiver]
            );
            client.release();
            io.emit('newMessage', messageData);
        } catch (err) {
            console.error('Error saving message to database:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    pool.end(() => {
        console.log('PostgreSQL pool has ended');
        server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
    });
});
