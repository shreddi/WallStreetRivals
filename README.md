# WallStreetRivals
A demo website for Wall Street Rivals, a Fantasy Football-like stock trading game. 

### Features

#### **Portfolio Management**
- View total portfolio value (cash + holdings).
- See detailed information about individual holdings, including stock details and total value.
- Calculate each holding's percentage contribution to the portfolio.

#### **Stock Data Integration**
- Fetch stock details (e.g., ticker, name, trade price) dynamically.
- Filter and search through available stocks in real-time.

---

### Tech Stack

#### **Backend**
- **Django**: Python-based web framework used for building the backend logic, APIs, and database models.
- **PostgreSQL**: Relational database used to store portfolio and stock data.

#### **Frontend**
- **React**: JavaScript library for building the user interface.
- **Mantine**: React component library used for the UI elements.

#### **Additional Tools**
- **Docker**: Used for containerizing the application, ensuring consistency across development and deployment environments.
- **Alpaca API**: Integrated for fetching real stock data (e.g., prices, attributes).

---

### Installation

#### **Prerequisites**
- Docker and Docker Compose installed on your machine.
- Python 3.11+ for backend development.

#### **Steps**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/portfolio-management-system.git
   cd portfolio-management-system

2. **Set Up the Backend**
   - Update the `.env` file with your environment variables (e.g., database credentials, Alpaca API keys).
   - Run the backend container:
     ```bash
     docker-compose up backend
     ```

3. **Set Up the Frontend**
   - Navigate to the frontend directory and install dependencies:
     ```bash
     cd frontend
     npm install
     ```
   - Start the development server:
     ```bash
     npm start
     ```

4. **Run the Full Application**
   - Use Docker Compose to start all services (backend, frontend, and database):
     ```bash
     docker compose up --build
     ```

5. **Access the Application**
   - Visit the frontend at `http://localhost:5173`.
   - Access the backend API at `http://localhost:8000`.
