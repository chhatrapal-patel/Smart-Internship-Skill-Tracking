const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_super_secret_jwt_key_here';

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH API ---
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  let avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  let color = role === 'student' ? '#3B82F6' : '#22C55E';

  const stmt = db.prepare("INSERT INTO users (name, email, password, role, joined, avatar, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
  stmt.run(name, email, hash, role, today, avatar, color, function (err) {
    if (err) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const token = jwt.sign({ id: this.lastID, email, role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: this.lastID, name, email, role, avatar, color } });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Blocked check
    if (user.status === 'Blocked') {
      return res.status(403).json({ error: 'Your account has been blocked by an administrator for safety concerns.' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  });
});

app.get('/api/users/me', authenticateToken, (req, res) => {
  db.get("SELECT id, name, email, role, status, joined, avatar, color, location, university, bio, phone FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) return res.sendStatus(404);

    // Fetch skills
    db.all("SELECT skill FROM user_skills WHERE user_id = ?", [req.user.id], (err, rows) => {
      user.skills = rows ? rows.map(r => r.skill) : [];
      res.json(user);
    });
  });
});

app.put('/api/users/me', authenticateToken, (req, res) => {
  const { name, phone, location, university, bio, avatar } = req.body;
  
  let query = "UPDATE users SET name=?, phone=?, location=?, university=?, bio=?";
  let params = [name, phone, location, university, bio];
  
  if (avatar) {
    query += ", avatar=?";
    params.push(avatar);
  }
  
  query += " WHERE id=?";
  params.push(req.user.id);

  db.run(query, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post('/api/users/skills', authenticateToken, (req, res) => {
  const { skill } = req.body;
  db.run("INSERT INTO user_skills (user_id, skill) VALUES (?, ?)", [req.user.id, skill], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

app.delete('/api/users/skills/:skill', authenticateToken, (req, res) => {
  db.run("DELETE FROM user_skills WHERE user_id = ? AND skill = ?", [req.user.id, req.params.skill], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- INTERNSHIPS API ---
app.get('/api/internships', authenticateToken, (req, res) => {
  db.all("SELECT * FROM internships ORDER BY id DESC", (err, internships) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all("SELECT * FROM internship_skills", (err, skillsRow) => {
      const skillsMap = {};
      if (skillsRow) {
        skillsRow.forEach(row => {
          if (!skillsMap[row.internship_id]) skillsMap[row.internship_id] = [];
          skillsMap[row.internship_id].push(row.skill);
        });
      }

      db.all("SELECT internship_id, COUNT(*) as applicants FROM applications GROUP BY internship_id", (err, appCountsRow) => {
        const countsMap = {};
        if (appCountsRow) {
          appCountsRow.forEach(row => {
            countsMap[row.internship_id] = row.applicants;
          });
        }

        const enriched = internships.map(i => ({
          ...i,
          skills: skillsMap[i.id] || [],
          applicants: countsMap[i.id] || 0
        }));
        res.json(enriched);
      });
    });
  });
});

app.get('/api/internships/:id', authenticateToken, (req, res) => {
  db.get("SELECT * FROM internships WHERE id = ?", [req.params.id], (err, internship) => {
    if (err || !internship) return res.status(404).json({ error: 'Not found' });

    db.all("SELECT skill FROM internship_skills WHERE internship_id = ?", [internship.id], (err, skillsRow) => {
      internship.skills = skillsRow ? skillsRow.map(s => s.skill) : [];
      res.json(internship);
    });
  });
});

app.post('/api/internships', authenticateToken, (req, res) => {
  if (req.user.role !== 'company') return res.sendStatus(403);

  const { title, location, duration, stipend, type, department, description, skills, work_mode, timing, deadline } = req.body;
  const posted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Get company info
  db.get("SELECT name, color, avatar FROM users WHERE id = ?", [req.user.id], (err, comp) => {
    const stmt = db.prepare("INSERT INTO internships (title, company_id, company_name, location, duration, stipend, type, department, description, posted, color, initial, work_mode, timing, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(title, req.user.id, comp.name, location, duration, stipend, type, department, description, posted, comp.color, comp.avatar, work_mode || 'In-Office', timing || 'Flexible', deadline, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const internshipId = this.lastID;

      if (skills && skills.length > 0) {
        const sStmt = db.prepare("INSERT INTO internship_skills (internship_id, skill) VALUES (?, ?)");
        skills.forEach(skill => sStmt.run(internshipId, skill));
        sStmt.finalize();
      }
      res.json({ success: true, id: internshipId });
    });
  });
});

app.put('/api/internships/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'company') return res.sendStatus(403);
  const { title, location, duration, stipend, type, department, description, skills, work_mode, timing, deadline } = req.body;
  
  db.run("UPDATE internships SET title=?, location=?, duration=?, stipend=?, type=?, department=?, description=?, work_mode=?, timing=?, deadline=? WHERE id=? AND company_id=?",
    [title, location, duration, stipend, type, department, description, work_mode || 'In-Office', timing || 'Flexible', deadline, req.params.id, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Internship not found or unauthorized' });

      // Update skills (simplest: delete all and re-insert)
      db.run("DELETE FROM internship_skills WHERE internship_id = ?", [req.params.id], (err) => {
        if (skills && skills.length > 0) {
          const sStmt = db.prepare("INSERT INTO internship_skills (internship_id, skill) VALUES (?, ?)");
          skills.forEach(skill => sStmt.run(req.params.id, skill));
          sStmt.finalize();
        }
        res.json({ success: true });
      });
    });
});

app.delete('/api/internships/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'company') return res.sendStatus(403);
  
  db.run("DELETE FROM internships WHERE id = ? AND company_id = ?", [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Internship not found or unauthorized' });
    
    // Cleanup related data
    db.run("DELETE FROM internship_skills WHERE internship_id = ?", [req.params.id]);
    db.run("DELETE FROM applications WHERE internship_id = ?", [req.params.id]);
    
    res.json({ success: true });
  });
});

// --- APPLICATIONS API ---
app.post('/api/applications', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') return res.sendStatus(403);

  const { internship_id } = req.body;
  const applied_date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Calculate score based on skill match
  db.all("SELECT skill FROM user_skills WHERE user_id = ?", [req.user.id], (err, uSkills) => {
    db.all("SELECT skill FROM internship_skills WHERE internship_id = ?", [internship_id], (err, iSkills) => {
      const userSkills = uSkills.map(s => s.skill.toLowerCase());
      const requiredSkills = iSkills.map(s => s.skill.toLowerCase());
      
      let score = 0;
      if (requiredSkills.length > 0) {
        const matches = requiredSkills.filter(s => userSkills.includes(s)).length;
        score = Math.round((matches / requiredSkills.length) * 100);
      } else {
        score = 85; // Default for no specified skills
      }

      // Add a bit of randomness for "soft skills"
      score = Math.min(100, score + Math.floor(Math.random() * 15));

      db.run("INSERT INTO applications (student_id, internship_id, status, applied_date, score) VALUES (?, ?, 'New', ?, ?)",
        [req.user.id, internship_id, applied_date, score],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, id: this.lastID });
        });
    });
  });
});

app.get('/api/applications', authenticateToken, (req, res) => {
  if (req.user.role === 'student') {
    // Get student applications
    db.all(`
      SELECT a.*, i.title, i.company_name, i.color, i.initial 
      FROM applications a 
      JOIN internships i ON a.internship_id = i.id 
      WHERE a.student_id = ?
      ORDER BY a.id DESC
    `, [req.user.id], (err, rows) => {
      res.json(rows || []);
    });
  } else if (req.user.role === 'company') {
    // Get applications for company's internships
    db.all(`
      SELECT a.*, u.name as student_name, u.email, u.avatar, u.color as user_color, 
             u.location, u.university, u.qualification, u.experience, u.resume_url, u.languages,
             i.title as role
      FROM applications a
      JOIN users u ON a.student_id = u.id
      JOIN internships i ON a.internship_id = i.id
      WHERE i.company_id = ?
      ORDER BY a.id DESC
    `, [req.user.id], (err, apps) => {
      if (err) return res.status(500).json({ error: err.message });

      // Need skills for these students
      db.all("SELECT * FROM user_skills", (err, skillsRow) => {
        const skillsMap = {};
        if (skillsRow) {
          skillsRow.forEach(row => {
            if (!skillsMap[row.user_id]) skillsMap[row.user_id] = [];
            skillsMap[row.user_id].push(row.skill);
          });
        }

        const enriched = apps.map(app => ({
          ...app,
          skills: skillsMap[app.student_id] || []
        }));
        res.json(enriched);
      });
    });
  } else {
    res.json([]);
  }
});

app.put('/api/applications/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'company') return res.sendStatus(403);
  const { status, stage } = req.body;
  
  let query = "UPDATE applications SET status = ?";
  let params = [status];
  
  if (stage) {
    query += ", stage = ?";
    params.push(stage);
  }
  
  query += " WHERE id = ?";
  params.push(req.params.id);

  db.run(query, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/applications/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') return res.sendStatus(403);
  
  db.run("DELETE FROM applications WHERE id = ? AND student_id = ?", [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Application not found or unauthorized' });
    res.json({ success: true });
  });
});

// --- ADMIN MANAGEMENT API ---
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  db.all(`
    SELECT id, name, email, role, status, joined, location, university, qualification, 
           experience, resume_url, phone, website, industry, founded, cin_number, 
           tax_id, student_id_url, cgpa, current_semester, bio
    FROM users 
    ORDER BY joined DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/admin/users/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { status } = req.body;
  db.run("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    // Cleanup listings if it was a company
    db.run("DELETE FROM internships WHERE company_id = ?", [req.params.id]);
    db.run("DELETE FROM applications WHERE student_id = ?", [req.params.id]);
    res.json({ success: true });
  });
});

app.get('/api/admin/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const stats = { totalUsers: 0, companies: 0, internships: 0, applications: 0 };
  
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    stats.totalUsers = row ? row.count : 0;
    db.get("SELECT COUNT(*) as count FROM users WHERE role='company'", (err, row) => {
      stats.companies = row ? row.count : 0;
      db.get("SELECT COUNT(*) as count FROM internships", (err, row) => {
        stats.internships = row ? row.count : 0;
        db.get("SELECT COUNT(*) as count FROM applications", (err, row) => {
          stats.applications = row ? row.count : 0;
          res.json(stats);
        });
      });
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
