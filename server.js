const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'railways.json');
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-change-me';
const CLASSES = ['1A', '2A', '3A', 'SL'];
const SEED_TRAINS = [
  { id: 'train-12601', trainNumber: '12601', trainName: 'Chennai Mail', fromStation: 'Chennai', toStation: 'Bengaluru', departureTime: '22:50', arrivalTime: '05:40', duration: '6h 50m', fares: { '1A': 1850, '2A': 1120, '3A': 780, SL: 320 }, seats: 72 },
  { id: 'train-12609', trainNumber: '12609', trainName: 'Bengaluru Express', fromStation: 'Chennai', toStation: 'Bengaluru', departureTime: '13:30', arrivalTime: '20:00', duration: '6h 30m', fares: { '1A': 1760, '2A': 1050, '3A': 720, SL: 290 }, seats: 64 },
  { id: 'train-12635', trainNumber: '12635', trainName: 'Vaigai Express', fromStation: 'Chennai', toStation: 'Madurai', departureTime: '13:50', arrivalTime: '21:20', duration: '7h 30m', fares: { '1A': 2100, '2A': 1280, '3A': 890, SL: 360 }, seats: 80 },
  { id: 'train-12605', trainNumber: '12605', trainName: 'Pallavan Express', fromStation: 'Chennai', toStation: 'Tiruchirappalli', departureTime: '15:45', arrivalTime: '21:50', duration: '6h 05m', fares: { '1A': 1600, '2A': 980, '3A': 670, SL: 270 }, seats: 60 },
  { id: 'train-22623', trainNumber: '22623', trainName: 'Madurai Express', fromStation: 'Bengaluru', toStation: 'Madurai', departureTime: '18:15', arrivalTime: '07:00', duration: '12h 45m', fares: { '1A': 2450, '2A': 1490, '3A': 1020, SL: 420 }, seats: 72 },
  { id: 'train-16859', trainNumber: '16859', trainName: 'Cholan Express', fromStation: 'Chennai', toStation: 'Thanjavur', departureTime: '22:00', arrivalTime: '05:30', duration: '7h 30m', fares: { '1A': 1750, '2A': 1080, '3A': 740, SL: 300 }, seats: 48 },
  { id: 'train-12673', trainNumber: '12673', trainName: 'Cheran Express', fromStation: 'Chennai', toStation: 'Coimbatore', departureTime: '22:10', arrivalTime: '06:50', duration: '8h 40m', fares: { '1A': 2200, '2A': 1350, '3A': 930, SL: 380 }, seats: 72 },
  { id: 'train-16127', trainNumber: '16127', trainName: 'Guruvayur Express', fromStation: 'Chennai', toStation: 'Tiruchirappalli', departureTime: '10:15', arrivalTime: '17:20', duration: '7h 05m', fares: { '1A': 1580, '2A': 960, '3A': 660, SL: 260 }, seats: 56 }
];

function readStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const initial = { users: [], bookings: [], trains: SEED_TRAINS };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return { users: store.users || [], bookings: store.bookings || [], trains: store.trains?.length ? store.trains : SEED_TRAINS };
  } catch (error) {
    throw new Error(`Could not read ${DATA_FILE}: ${error.message}`);
  }
}
function writeStore(store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temporary = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(store, null, 2));
  fs.renameSync(temporary, DATA_FILE);
}
function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Your session expired. Please log in again.' });
  }
}

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'Railways', storage: 'local-json' }));

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 80) return res.status(400).json({ message: 'Enter a name between 2 and 80 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (password.length < 8 || password.length > 72) return res.status(400).json({ message: 'Password must be 8–72 characters.' });
    const store = readStore();
    if (store.users.some(user => user.email === email)) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = { id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, email, passwordHash: await bcrypt.hash(password, 10), createdAt: new Date().toISOString() };
    store.users.push(user);
    writeStore(store);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: safeUser(user) });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const store = readStore();
    const user = store.users.find(item => item.email === email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: safeUser(user) });
  } catch (error) { next(error); }
});

app.get('/api/trains', (req, res) => {
  const { from, to, date, passengers = '1', travelClass = 'SL' } = req.query;
  const count = Number(passengers);
  if (!from || !to || !date) return res.status(400).json({ message: 'From, to and date are required.' });
  if (from.toLowerCase() === String(to).toLowerCase()) return res.status(400).json({ message: 'Choose two different stations.' });
  if (!Number.isInteger(count) || count < 1 || count > 6) return res.status(400).json({ message: 'Passenger count must be between 1 and 6.' });
  if (!CLASSES.includes(String(travelClass))) return res.status(400).json({ message: 'Choose a valid travel class.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || Number.isNaN(Date.parse(`${date}T00:00:00`))) return res.status(400).json({ message: 'Choose a valid journey date.' });
  const store = readStore();
  const trains = store.trains.filter(train => train.fromStation.toLowerCase() === String(from).toLowerCase() && train.toStation.toLowerCase() === String(to).toLowerCase())
    .map(train => {
      const booked = store.bookings.filter(item => item.trainId === train.id && item.journeyDate === date && item.travelClass === travelClass && item.status === 'confirmed').reduce((total, item) => total + item.passengers.length, 0);
      return { ...train, availableSeats: Math.max(0, train.seats - booked), fare: train.fares[travelClass] };
    }).filter(train => train.availableSeats >= count);
  res.json({ trains, date, passengers: count, travelClass });
});

app.get('/api/bookings', auth, (req, res) => {
  const store = readStore();
  res.json(store.bookings.filter(booking => booking.userId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

app.post('/api/bookings', auth, (req, res) => {
  const { trainId, journeyDate, travelClass, passengers, contact } = req.body;
  if (!trainId || !/^\d{4}-\d{2}-\d{2}$/.test(String(journeyDate || '')) || !CLASSES.includes(travelClass)) return res.status(400).json({ message: 'Train, journey date and a valid class are required.' });
  if (Date.parse(`${journeyDate}T00:00:00`) < Date.parse(new Date().toISOString().slice(0, 10) + 'T00:00:00')) return res.status(400).json({ message: 'Journey date cannot be in the past.' });
  if (!Array.isArray(passengers) || passengers.length < 1 || passengers.length > 6 || passengers.some(p => !String(p.name || '').trim() || !Number.isInteger(Number(p.age)) || Number(p.age) < 1 || Number(p.age) > 120)) return res.status(400).json({ message: 'Enter valid passenger names and ages (1–120). Up to 6 passengers are allowed.' });
  const store = readStore();
  const train = store.trains.find(item => item.id === trainId);
  if (!train) return res.status(404).json({ message: 'Train not found.' });
  const alreadyBooked = store.bookings.filter(item => item.trainId === trainId && item.journeyDate === journeyDate && item.travelClass === travelClass && item.status === 'confirmed').reduce((total, item) => total + item.passengers.length, 0);
  if (train.seats - alreadyBooked < passengers.length) return res.status(409).json({ message: 'Not enough seats remain. Please search again.' });
  const booking = {
    id: `RW${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    userId: req.user.id, trainId: train.id, trainNumber: train.trainNumber, trainName: train.trainName,
    fromStation: train.fromStation, toStation: train.toStation, departureTime: train.departureTime,
    arrivalTime: train.arrivalTime, journeyDate, travelClass, passengers: passengers.map(p => ({ name: String(p.name).trim().slice(0, 80), age: Number(p.age) })),
    contact: { email: String(contact?.email || req.user.email).trim().slice(0, 120), phone: String(contact?.phone || '').trim().slice(0, 20) },
    totalFare: train.fares[travelClass] * passengers.length, status: 'confirmed', createdAt: new Date().toISOString()
  };
  store.bookings.push(booking);
  writeStore(store);
  res.status(201).json({ booking });
});

app.delete('/api/bookings/:id', auth, (req, res) => {
  const store = readStore();
  const booking = store.bookings.find(item => item.id === req.params.id && item.userId === req.user.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.status !== 'confirmed') return res.status(409).json({ message: 'This booking has already been cancelled.' });
  booking.status = 'cancelled';
  booking.cancelledAt = new Date().toISOString();
  writeStore(store);
  res.json({ booking, message: 'Booking cancelled.' });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use((req, res) => res.status(404).json({ message: 'Not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Check the server logs.' });
});

if (require.main === module) {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required in production.');
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Railways is running at http://localhost:${PORT}`));
}
module.exports = { app, SEED_TRAINS };
