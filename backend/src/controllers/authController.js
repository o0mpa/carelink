import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//age calculator helper
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

//Client sign up "registering":
export const signupClient= async (req, res) => {
  try {
    const {username, password, full_name, gender, date_of_birth, city, area,
      full_address, phone_number, email, allergies,
      blood_type, doctor_facility, medical_specialties_required, skills,
      emergency_contact1_name, emergency_contact1_phone, 
      emergency_contact2_name, emergency_contact2_phone,
      securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2} = req.body;
      const age = calculateAge(date_of_birth);

      //ensure the username is unique
      const [existing] = await db.promise().query(
        `SELECT user_id FROM users WHERE username = ?`, [username]
      );
      if (existing.length > 0) {
        return res.status(409).json({message: 'Username Already Taken'});
      };
  
      //hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const hashedAnswer1 = await bcrypt.hash(securityAnswer1, 10);
      const hashedAnswer2 = await bcrypt.hash(securityAnswer2, 10);

      //insert into users
      const [result] = await db.promise().query(
        `INSERT INTO users (username, password, role, security_question1, security_answer1, security_question2, security_answer2) VALUES (?, ?, 'Client', ?, ?, ?, ?)`,
        [username, hashedPassword, securityQuestion1, hashedAnswer1, securityQuestion2, hashedAnswer2]
      );
      const userId = result.insertId;

      // Get file paths from multer
      const national_id = req.files.national_id?.[0].path || null;
      const diagnoses   = req.files.diagnoses?.[0].path || null;
      const conditions  = req.files.conditions?.[0].path || null;


      //insert into client profiles
      await db.promise().query(
        `INSERT INTO client_profiles (user_id, full_name, gender, date_of_birth, age, city, area, full_address, phone_number, email, national_id, diagnoses, conditions, allergies, blood_type, doctor_facility, medical_specialties_required, skills, emergency_contact1_name, emergency_contact1_phone, emergency_contact2_name, emergency_contact2_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, full_name, gender, date_of_birth, age, city, area, full_address, phone_number, email,
          national_id, diagnoses, conditions, JSON.stringify(allergies), blood_type, doctor_facility, medical_specialties_required,
          JSON.stringify(skills), emergency_contact1_name, emergency_contact1_phone, emergency_contact2_name, emergency_contact2_phone]
      )

      res.status(201).json({message: 'Client Registered Successfully'});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};


//Caregiver sign up "registering":
export const signupCaregiver = async (req, res) => {
  try {
    const {username, password, full_name, gender, date_of_birth,
      city, area, full_address, phone_number, email,
      skills, day_rate_a, day_rate_b, day_rate_c, day_rate_d,
      securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2} = req.body;
      const age = calculateAge(date_of_birth);

      //ensure the username is unique
      const [existing] = await db.promise().query(
        `SELECT user_id FROM users WHERE username = ?`, [username]
      );
      if (existing.length > 0) {
        return res.status(409).json({message: 'Username Already Taken'});
      };
      
      //password validation
      if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password) || !/[a-z]/.test(password)) {
        return res.status(400).json({message: 'Password must be at least 8 characters long and include a special character, a number, a capital letter, and at least one small letter.'})
      }

      //hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const hashedAnswer1 = await bcrypt.hash(securityAnswer1, 10);
      const hashedAnswer2 = await bcrypt.hash(securityAnswer2, 10);
      //insert into users
      const [result] = await db.promise().query(
        `INSERT INTO users (username, password, role, security_question1, security_answer1, security_question2, security_answer2) VALUES (?, ?, 'Caregiver', ?, ?, ?, ?)`,
        [username, hashedPassword, securityQuestion1, hashedAnswer1, securityQuestion2, hashedAnswer2]
      );
      const userId = result.insertId;

      // Get file paths from multer
      const education_docs   = req.files.education_docs?.[0].path || null;
      const certificates     = req.files.certificates?.[0].path || null;
      const national_id      = req.files.national_id?.[0].path || null;
      const criminal_record  = req.files.criminal_record?.[0].path || null;
      const references       = req.files.references?.[0].path || null;

      //insert into caregiver profiles + admin approval
      await db.promise().query(
        `INSERT INTO caregiver_profiles (user_id, full_name, gender, date_of_birth, age, city, area, full_address, phone_number, email,
       education_docs, certificates, national_id, criminal_record, references, skills,
       day_rate_a, day_rate_b, day_rate_c, day_rate_d, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
       [userId, full_name, gender, date_of_birth, age, city, area, full_address, phone_number, email,
        education_docs, certificates, national_id, criminal_record, references,
        JSON.stringify(skills), day_rate_a, day_rate_b, day_rate_c, day_rate_d]
      );
      //tell the caregiver their account is under review
      res.status(201).json({message: 'Registration submitted. Your account is pending admin approval.'});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

//user sign in
//caregivers are blocked from signing in if their approval_status is not 'Active'
export const signin = async (req, res) => {
  try {
    const {username, password} = req.body;
    //locate user
    const [users] = await db.promise().query(`SELECT * FROM users WHERE username = ?`, [username]);
    if (users.length === 0) return res.status(404).json({message: 'User Not Found'});
    const user = users[0];
    //verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({message: 'Invalid Credentials'});
    //access controls
    //fetching the profile
    let profile = null;
    if (user.role === 'Client') {
      const [rows] = await db.promise().query(`SELECT * from client_profiles WHERE user_id = ?`, [user.user_id]);
      profile = rows[0];
    }
    else if (user.role === 'Caregiver') {
      const [rows] = await db.promise().query(`SELECT * FROM caregiver_profiles WHERE user_id = ?`, [user.user_id]);
      if (rows.length === 0) return res.status(404).json({message: 'Caregiver profile not found'});
      profile = rows[0];
      //caregiver approval gate
      if (profile.approval_status === 'Pending') {
        return res.status(403).json({message: 'Your account is pending admin approval. Please check back later.'});
      }
      if (profile.approval_status === 'Rejected') {
        return res.status(403).json({message: 'Your account application was rejected. Please contact support.'});
      }
    }
    else if (user.role === 'Admin') {
      profile = {username: user.username};
    }
    //generate token with role included for role-based routes
    const token = jwt.sign(
      {id: user.user_id, role: user.role},
      process.env.JWT_SECRET,
      {expiresIn: '1h'}
    );
    //return token + profile
    res.json({token, role: user.role, profile});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

//logout
export const logout = async (req, res) => {
  try {
    const token = req.token;
    if (!token) return res.status(400).json({message: 'No token to invalidate'});
    await db.promise().query(`INSERT IGNORE INTO blacklisted_tokens (token) VALUES (?)`, [token]);
    res.json({message: 'Logged Out Successfully'});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

//forgot password
export const getSecurityQuestions = async (req, res) => {
  try {
    const {username} = req.params;
    const [rows] = await db.promise().query(
      `SELECT security_question1, security_question2 FROM users WHERE username = ?`, [username]
    );
    if (rows.length === 0) return res.status(404).json({message: 'User Not Found'});
    res.json({
      security_question1: rows[0].security_question1,
      security_question2: rows[0].security_question2,
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

export const forgotPasswordSecurity = async (req, res) => {
  try {
    const {username, securityAnswer1, securityAnswer2, newPassword} = req.body;
    //find user
    const [rows] = await db.promise().query(
      `SELECT user_id, role, security_question1, security_answer1, security_question2, security_answer2 FROM users WHERE username = ?`,
      [username]);
    if (rows.length === 0) return res.status(404).json({message: 'User Not Found'});
    const user = rows[0];
    //validate security answers
    const valid1 = await bcrypt.compare(securityAnswer1, user.security_answer1);
    const valid2 = await bcrypt.compare(securityAnswer2, user.security_answer2);
    if (!valid1 || !valid2) return res.status(401).json({message: 'Security Answers Incorrect'});
    //hash new password
    const hashedNew = await bcrypt.hash(newPassword, 10);
    //update password
    await db.promise().query(
      `UPDATE users SET password = ? WHERE user_id = ?`, [hashedNew, user.user_id]
    );
    //issue new jwt
    const newToken = jwt.sign(
      {id: user.user_id, role: user.user_role},
      process.env.JWT_SECRET,
      {expiresIn: '1h'}
    );
    res.json({nessage: 'Reset Password Successful', token: newToken})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};