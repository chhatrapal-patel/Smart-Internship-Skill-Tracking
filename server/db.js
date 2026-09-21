const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database', err);
  } else {
    console.log('Connected to SQLite database');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Users table - Added verification fields (CIN, TaxID, Website, StudentID, etc.)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      joined TEXT NOT NULL,
      avatar TEXT,
      color TEXT,
      location TEXT,
      university TEXT,
      qualification TEXT,
      experience TEXT,
      resume_url TEXT,
      bio TEXT,
      phone TEXT,
      languages TEXT,
      website TEXT,
      industry TEXT,
      founded TEXT,
      cin_number TEXT,
      tax_id TEXT,
      student_id_url TEXT,
      cgpa TEXT,
      current_semester TEXT
    )`);

    // Internships table
    db.run(`CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company_id INTEGER NOT NULL,
      company_name TEXT NOT NULL,
      location TEXT NOT NULL,
      duration TEXT NOT NULL,
      stipend TEXT NOT NULL,
      type TEXT NOT NULL,
      department TEXT,
      description TEXT,
      posted TEXT NOT NULL,
      color TEXT,
      initial TEXT,
      work_mode TEXT DEFAULT 'In-Office',
      timing TEXT DEFAULT 'Standard Business Hours',
      deadline TEXT
    )`);

    // Applications table
    db.run(`CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      internship_id INTEGER NOT NULL,
      status TEXT DEFAULT 'Application Received',
      stage TEXT DEFAULT 'Application Received',
      applied_date TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      FOREIGN KEY(student_id) REFERENCES users(id),
      FOREIGN KEY(internship_id) REFERENCES internships(id)
    )`);

    // Skills table
    db.run(`CREATE TABLE IF NOT EXISTS internship_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      internship_id INTEGER NOT NULL,
      skill TEXT NOT NULL,
      FOREIGN KEY(internship_id) REFERENCES internships(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      skill TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
      if (row && row.count === 0) {
        seedDb();
      }
    });
  });
}

function seedDb() {
  console.log("Initializing Trust-Verified Demo Environment...");
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('password123', salt);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // 1. System Administrator
  db.run("INSERT OR IGNORE INTO users (name, email, password, role, joined, avatar, color, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    ["Super Admin", "admin@skillbridge.com", hash, "admin", today, "SA", "#EF4444", "Active"]);

  // 2. Verified Companies
  const insertComp = db.prepare("INSERT OR IGNORE INTO users (name, email, password, role, joined, avatar, color, location, bio, website, industry, founded, cin_number, tax_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertComp.run("Google Cloud", "hiring@google.com", hash, "company", today, "G", "#4285F4", "Bangalore, KA", "Leading the future of cloud computing.", "https://cloud.google.com", "Technology", "1998", "L72200KA1998PLC023534", "AAACG1234F", "Active");
  insertComp.run("Meta Labs", "careers@meta.com", hash, "company", today, "M", "#0668E1", "Mumbai, MH", "Building the metaverse.", "https://about.meta.com", "Social Media", "2004", "U74900MH2004PTC123456", "BBBCG5678G", "Active");
  insertComp.finalize();

  // 3. Verified Students
  const insertStudent = db.prepare("INSERT OR IGNORE INTO users (name, email, password, role, joined, avatar, color, university, qualification, experience, cgpa, current_semester, student_id_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertStudent.run("Aryan Sharma", "aryan@iit.edu", hash, "student", today, "AS", "#3B82F6", "IIT Bombay", "B.Tech Computer Science", "Freelancer", "9.2/10", "6th Semester", "https://example.com/ids/aryan.jpg", "Active");
  insertStudent.run("Priya Verma", "priya@nit.edu", hash, "student", today, "PV", "#10B981", "NIT Trichy", "B.Tech Electronics", "Fresher", "8.5/10", "4th Semester", "https://example.com/ids/priya.jpg", "Active");
  insertStudent.finalize();

  setTimeout(() => {
    // Basic internship data
    const insertInt = db.prepare("INSERT INTO internships (title, company_id, company_name, location, duration, stipend, type, posted, color, initial) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    insertInt.run("Cloud Engineering Intern", 2, "Google Cloud", "Remote", "6 Months", "₹50,000/mo", "Full-time", "Today", "#4285F4", "G");
    insertInt.finalize();
    console.log("Trust-Verified Data Seeded.");
  }, 500);
}

module.exports = db;
