# SwiftBite 🍔

A full-stack food delivery mobile app built with React Native and Expo.

## 📱 Screenshots

> Add screenshots here after building APK

## 🚀 Features

### Customer
- 🔐 Login & Register with JWT authentication
- 🏠 Browse restaurants with category filters & search
- 🍽️ View restaurant menus with category tabs
- 🛒 Add items to cart with quantity control
- 🎟️ Apply promo codes & discounts
- 💵 Cash on Delivery payment
- 📍 Real-time order tracking with Socket.io
- 🗺️ Driver location tracking on map
- ⭐ Rate & review restaurants
- 📦 Order history with reorder feature
- 👤 Edit profile (name, phone, address)
- 🔑 Forgot password & reset via email

### Restaurant Owner
- 📊 Analytics dashboard (revenue, orders, popular items)
- 🔥 Real-time incoming orders
- ✅ Update order status in real-time
- 🍽️ Menu management (add, toggle, delete items)

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Mobile framework |
| Expo SDK 53 | Development platform |
| Expo Router | File-based navigation |
| TypeScript | Type safety |
| Zustand | State management |
| Socket.io Client | Real-time updates |
| React Native Maps | Map & location |
| Axios | API calls |

## 📁 Project Structure

SwiftBite/
├── app/
│   ├── (auth)/          # Login, Register, Forgot Password
│   ├── (tabs)/          # Customer screens
│   ├── (owner)/         # Restaurant owner screens
│   ├── restaurant/      # Restaurant detail
│   └── order/           # Order detail
├── constants/           # Colors, API URL
├── store/               # Zustand stores
├── services/            # Notification service
└── types/               # TypeScript types


## 🔧 Setup & Installation

1. Clone the repo:
```bash
git clone https://github.com/talhaansari77/SwiftBite-frontend.git
cd SwiftBite-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the app:
```bash
npx expo start
```

4. Scan QR code with Expo Go app

## 🌐 Backend

The backend is deployed at:
https://swiftbite-backend-1ioe.onrender.com

Backend repo: [SwiftBite Backend](https://github.com/talhaansari77/SwiftBite-backend)

## 👨‍💻 Author

**Talha Ansari**
- GitHub: [@talhaansari77](https://github.com/talhaansari77)

## 📄 License

MIT License