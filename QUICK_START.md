# Hotel PMS - Quick Start Guide

## 🚀 How to Run the Application

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- MongoDB Atlas account (already configured)

---

## Backend Setup

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Activate virtual environment
```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies (if not already installed)
```bash
pip install fastapi uvicorn beanie motor python-jose[cryptography] passlib[bcrypt] python-multipart
```

### 4. Start the backend server
```bash
uvicorn main:app --reload
```

**Backend will run at:** `http://127.0.0.1:8000`

---

## Frontend Setup

### 1. Open a new terminal and navigate to frontend folder
```bash
cd frontend
```

### 2. Install dependencies (if not already installed)
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

**Frontend will run at:** `http://localhost:5173`

---

## 🎯 Testing the Complete Flow

### Step 1: Register a New User
1. Open `http://localhost:5173`
2. Click "Register here"
3. Fill in the form:
   - Name: Test User
   - Email: test@hotel.com
   - Password: password123
   - Role: Admin
4. Click "Create Account"
5. You'll be redirected to Dashboard

### Step 2: Create a Room
1. Navigate to "Rooms" from sidebar
2. Click "Add Room"
3. Fill in:
   - Room Number: 101
   - Room Type: Standard
   - Price per Night: 2000
   - Status: Available
   - Description: Beautiful standard room
4. Click "Add Room"

### Step 3: Create a Booking
1. Navigate to "Bookings"
2. Click "New Booking"
3. Fill in:
   - Guest Name: John Doe
   - Email: john@example.com
   - Phone: 9876543210
   - No. of Guests: 2
   - Select Room: Room 101
   - Check-In Date: Tomorrow's date
   - Check-Out Date: 3 days from tomorrow
4. Click "Create Booking"

### Step 4: Check In Guest
1. Navigate to "Check-In / Out"
2. You'll see the booking in "Awaiting Check-In" tab
3. Click "Check In" button
4. Confirm the action
5. Booking moves to "Checked In" tab

### Step 5: Check Out Guest
1. In "Check-In / Out" page, go to "Checked In" tab
2. Click "Check Out" button
3. Confirm the action
4. Invoice is automatically generated
5. Booking moves to "Checked Out" tab

### Step 6: View Invoice
1. Navigate to "Invoices"
2. Click on the invoice from the left panel
3. View full invoice details on the right
4. Click "Print / Download PDF" to print

### Step 7: View Calendar
1. Navigate to "Calendar"
2. See the room availability
3. Booked dates shown in red
4. Available dates shown in green

---

## 🧪 Testing All Features

### Dashboard (Auto-refreshes every 30 seconds)
- ✅ View total rooms count
- ✅ View available rooms
- ✅ View occupied rooms
- ✅ View total bookings
- ✅ View checked-in guests
- ✅ View total invoices

### Rooms
- ✅ Add new room
- ✅ Edit existing room
- ✅ Delete room (with confirmation)
- ✅ View room status
- ✅ View empty state

### Bookings
- ✅ Create new booking
- ✅ View all bookings
- ✅ Cancel booking (with confirmation)
- ✅ Date validation (no past dates)
- ✅ Check-out must be after check-in
- ✅ Room number displays correctly
- ✅ View empty state

### Check-In/Out
- ✅ View bookings by status
- ✅ Check in guests (with confirmation)
- ✅ Check out guests (with confirmation)
- ✅ Auto-generate invoice on checkout
- ✅ Room status auto-updates
- ✅ Room number displays correctly
- ✅ View empty state

### Invoices
- ✅ View all invoices
- ✅ Click to see full details
- ✅ Print invoice
- ✅ Professional invoice layout
- ✅ Correct calculations (18% GST)
- ✅ View empty state

### Calendar
- ✅ View monthly calendar
- ✅ Navigate months (prev/next)
- ✅ View room availability
- ✅ Color coding (green/red/yellow)
- ✅ Hover to see guest name
- ✅ View empty state

### Authentication
- ✅ Register new user
- ✅ Login existing user
- ✅ Logout
- ✅ Protected routes redirect to login
- ✅ Token-based authentication

---

## 🔑 Test Credentials

If you already have data:
```
Email: milind@hotel.com
Password: (your password)
```

Or create a new account via Register page.

---

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB Atlas connection string is correct in `.env`
- Make sure virtual environment is activated
- Try: `pip install -r requirements.txt`

### Frontend won't start
- Delete `node_modules` and run `npm install` again
- Clear browser cache
- Try: `npm run build` then `npm run preview`

### Can't connect to backend
- Make sure backend is running on `http://127.0.0.1:8000`
- Check CORS settings in `main.py`
- Check if port 8000 is available

### Authentication not working
- Clear browser localStorage
- Check if JWT_SECRET is set in `.env`
- Try logging out and logging in again

---

## 📊 API Endpoints

### Auth
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user
- GET `/auth/me` - Get current user

### Rooms
- GET `/rooms/` - Get all rooms
- POST `/rooms/` - Create room
- PUT `/rooms/{id}` - Update room
- DELETE `/rooms/{id}` - Delete room
- GET `/rooms/available/list` - Get available rooms

### Bookings
- GET `/bookings/` - Get all bookings
- POST `/bookings/` - Create booking
- PUT `/bookings/{id}/cancel` - Cancel booking
- GET `/bookings/room/{room_id}` - Get bookings for room

### Check-In/Out
- POST `/checkin/checkin/{booking_id}` - Check in guest
- POST `/checkin/checkout/{booking_id}` - Check out guest

### Invoices
- GET `/invoices/all` - Get all invoices
- GET `/invoices/{id}` - Get invoice by ID
- GET `/invoices/booking/{booking_id}` - Get invoice by booking

---

## 🎉 Everything is Working!

All bugs have been fixed and the application is fully functional. Enjoy using Hotel PMS!

For any issues, check the `TESTING_REPORT.md` and `CHANGES_SUMMARY.md` files.
