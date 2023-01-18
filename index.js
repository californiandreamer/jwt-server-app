const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

const users = [
  {
    id: '1',
    username: 'John',
    password: 'password123',
    isAdmin: true,
  },
  {
    id: '2',
    username: 'Jane',
    password: 'password123',
    isAdmin: false,
  },
];

let refreshTokens = [];

const generateAccessToken = user => {
  const accessToken = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    'secretKey',
    { expiresIn: '15m' },
  );

  return accessToken;
};

const generateRefreshToken = user => {
  const refreshToken = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    'refreshSecretKey',
    { expiresIn: '15m' },
  );

  return refreshToken;
};

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    console.log('token', token);

    jwt.verify(token, 'secretKey', (err, user) => {
      if (err) {
        return res.status(403).json('Token is not valid!');
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    res.status(401).json('You are not authenticated!');
  }
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(item => {
    return item.username === username && item.password === password;
  });

  if (user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.push(refreshToken);
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json('Username or password is incorrect!');
  }
});

app.post('/api/logout', verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.status(200).json('You were logged out successfully!');
});

app.post('/api/refresh', (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.status(401).json('You are not authenticated!');
  }
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json('Refresh token is not valid!');
  }
  jwt.verify(refreshToken, 'refreshSecretKey', (err, user) => {
    if (err) {
      console.warn(err);
      return;
    }

    refreshTokens = refreshTokens.filter(token => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

app.delete('/api/users/:userId', verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json('User has been deleted');
  } else {
    res.status(403).json("You can't delete this user!");
  }
});

app.listen(4000, () => console.log('Server is working!'));
