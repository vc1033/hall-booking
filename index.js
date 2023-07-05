const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

let rooms = [];
let bookings = [];

// Create a room
app.post('/rooms', (req, res) => {
  const { roomName, seats, amenities, pricePerHour } = req.body;
  const room = { roomName, seats, amenities, pricePerHour };
  rooms.push(room);
  res.status(201).json({ success: true, message: 'Room created successfully', room });
});

// Book a room
app.post('/bookings', (req, res) => {
  const { customerName, roomId, date, startTime, endTime } = req.body;
  const room = rooms.find(room => room.roomId === roomId);
  
  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }
  
  const booking = { customerName, roomId, date, startTime, endTime };
  
  // Check if the room is already booked for the given date and time
  const conflict = bookings.find(booking => booking.roomId === roomId && booking.date === date && (
    (booking.startTime <= startTime && startTime < booking.endTime) ||
    (booking.startTime < endTime && endTime <= booking.endTime) ||
    (startTime <= booking.startTime && booking.endTime <= endTime)
  ));
  
  if (conflict) {
    res.status(400).json({ success: false, message: 'Room already booked for the given date and time' });
    return;
  }
  
  bookings.push(booking);
  res.status(201).json({ success: true, message: 'Room booked successfully', booking });
});

// List all rooms with bookings
app.get('/rooms', (req, res) => {
  const roomsWithBookings = rooms.map(room => {
    const roomBookings = bookings.filter(booking => booking.roomId === room.roomId);
    return {
      ...room,
      bookings: roomBookings
    };
  });
  res.json({ success: true, rooms: roomsWithBookings });
});

// List all customers with bookings
app.get('/customers', (req, res) => {
  const customersWithBookings = bookings.map(booking => {
    const room = rooms.find(room => room.roomId === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName: room ? room.roomName : null,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    };
  });
  res.json({ success: true, customers: customersWithBookings });
});

// List booking history for a customer
app.get('/customers/:customerName/history', (req, res) => {
  const { customerName } = req.params;
  const customerBookings = bookings.filter(booking => booking.customerName === customerName);
  res.json({ success: true, bookings: customerBookings });
});
