-- Master Data Migration: India, States, and Districts

-- 1. Create Countries table if not exists
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE,
    phone_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Insert India
INSERT INTO countries (name, code, phone_code) 
VALUES ('India', 'IN', '+91')
ON CONFLICT (name) DO NOTHING;

-- 3. Modify States table to link to Country
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='states' AND column_name='country_id') THEN 
        ALTER TABLE states ADD COLUMN country_id INTEGER REFERENCES countries(id);
    END IF;
END $$;

-- Update existing states to link to India (assuming India ID is 1)
UPDATE states SET country_id = (SELECT id FROM countries WHERE code = 'IN') WHERE country_id IS NULL;

-- 4. Create Cities (Districts) table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(state_id, name)
);

-- 5. Insert All Indian States and Union Territories
-- Clear old states to ensure fresh start with country linkage
DELETE FROM states WHERE country_id = (SELECT id FROM countries WHERE code = 'IN');

INSERT INTO states (country_id, name, code, zone) VALUES
((SELECT id FROM countries WHERE code = 'IN'), 'Andhra Pradesh', 'AP', 'SOUTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Arunachal Pradesh', 'AR', 'NE'),
((SELECT id FROM countries WHERE code = 'IN'), 'Assam', 'AS', 'NE'),
((SELECT id FROM countries WHERE code = 'IN'), 'Bihar', 'BR', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Chhattisgarh', 'CG', 'CENTRAL'),
((SELECT id FROM countries WHERE code = 'IN'), 'Goa', 'GA', 'WEST'),
((SELECT id FROM countries WHERE code = 'IN'), 'Gujarat', 'GJ', 'WEST'),
((SELECT id FROM countries WHERE code = 'IN'), 'Haryana', 'HR', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Himachal Pradesh', 'HP', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Jharkhand', 'JH', 'EAST'),
((SELECT id FROM countries WHERE code = 'IN'), 'Karnataka', 'KA', 'SOUTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Kerala', 'KL', 'SOUTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Madhya Pradesh', 'MP', 'CENTRAL'),
((SELECT id FROM countries WHERE code = 'IN'), 'Maharashtra', 'MH', 'WEST'),
((SELECT id FROM countries WHERE code = 'IN'), 'Manipur', 'MN', 'NE'),
((SELECT id FROM countries WHERE code = 'IN'), 'Meghalaya', 'ML', 'NE'),
((SELECT id FROM countries WHERE code = 'IN'), 'Mizoram', 'MZ', 'NE'),
((SELECT id FROM countries WHERE code = 'IN'), 'Nagaland', 'NL', 'NE'),
((SELECT id FROM countries WHERE code = 'IN'), 'Odisha', 'OR', 'EAST'),
((SELECT id FROM countries WHERE code = 'IN'), 'Punjab', 'PB', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Rajasthan', 'RJ', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Sikkim', 'SK', 'NE'),
((SELECT id FROM countries WHERE code = 'IN'), 'Tamil Nadu', 'TN', 'TN'),
((SELECT id FROM countries WHERE code = 'IN'), 'Telangana', 'TG', 'SOUTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Tripura', 'TR', 'NE'),
((SELECT id FROM countries WHERE code = 'IN'), 'Uttar Pradesh', 'UP', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Uttarakhand', 'UK', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'West Bengal', 'WB', 'EAST'),
((SELECT id FROM countries WHERE code = 'IN'), 'Andaman and Nicobar Islands', 'AN', 'REST'),
((SELECT id FROM countries WHERE code = 'IN'), 'Chandigarh', 'CH', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Dadra and Nagar Haveli and Daman and Diu', 'DN', 'WEST'),
((SELECT id FROM countries WHERE code = 'IN'), 'Delhi', 'DL', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Jammu and Kashmir', 'JK', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Ladakh', 'LA', 'NORTH'),
((SELECT id FROM countries WHERE code = 'IN'), 'Lakshadweep', 'LD', 'REST'),
((SELECT id FROM countries WHERE code = 'IN'), 'Puducherry', 'PY', 'SOUTH');

-- 6. Insert Districts (Selection of major districts for each state)
-- Tamil Nadu Districts
INSERT INTO cities (state_id, name) VALUES
((SELECT id FROM states WHERE code = 'TN'), 'Ariyalur'),
((SELECT id FROM states WHERE code = 'TN'), 'Chengalpattu'),
((SELECT id FROM states WHERE code = 'TN'), 'Chennai'),
((SELECT id FROM states WHERE code = 'TN'), 'Coimbatore'),
((SELECT id FROM states WHERE code = 'TN'), 'Cuddalore'),
((SELECT id FROM states WHERE code = 'TN'), 'Dharmapuri'),
((SELECT id FROM states WHERE code = 'TN'), 'Dindigul'),
((SELECT id FROM states WHERE code = 'TN'), 'Erode'),
((SELECT id FROM states WHERE code = 'TN'), 'Kallakurichi'),
((SELECT id FROM states WHERE code = 'TN'), 'Kanchipuram'),
((SELECT id FROM states WHERE code = 'TN'), 'Kanyakumari'),
((SELECT id FROM states WHERE code = 'TN'), 'Karur'),
((SELECT id FROM states WHERE code = 'TN'), 'Krishnagiri'),
((SELECT id FROM states WHERE code = 'TN'), 'Madurai'),
((SELECT id FROM states WHERE code = 'TN'), 'Mayiladuthurai'),
((SELECT id FROM states WHERE code = 'TN'), 'Nagapattinam'),
((SELECT id FROM states WHERE code = 'TN'), 'Namakkal'),
((SELECT id FROM states WHERE code = 'TN'), 'Nilgiris'),
((SELECT id FROM states WHERE code = 'TN'), 'Perambalur'),
((SELECT id FROM states WHERE code = 'TN'), 'Pudukkottai'),
((SELECT id FROM states WHERE code = 'TN'), 'Ramanathapuram'),
((SELECT id FROM states WHERE code = 'TN'), 'Ranipet'),
((SELECT id FROM states WHERE code = 'TN'), 'Salem'),
((SELECT id FROM states WHERE code = 'TN'), 'Sivaganga'),
((SELECT id FROM states WHERE code = 'TN'), 'Tenkasi'),
((SELECT id FROM states WHERE code = 'TN'), 'Thanjavur'),
((SELECT id FROM states WHERE code = 'TN'), 'Theni'),
((SELECT id FROM states WHERE code = 'TN'), 'Thoothukudi'),
((SELECT id FROM states WHERE code = 'TN'), 'Tiruchirappalli'),
((SELECT id FROM states WHERE code = 'TN'), 'Tirunelveli'),
((SELECT id FROM states WHERE code = 'TN'), 'Tirupathur'),
((SELECT id FROM states WHERE code = 'TN'), 'Tiruppur'),
((SELECT id FROM states WHERE code = 'TN'), 'Tiruvallur'),
((SELECT id FROM states WHERE code = 'TN'), 'Tiruvannamalai'),
((SELECT id FROM states WHERE code = 'TN'), 'Tiruvarur'),
((SELECT id FROM states WHERE code = 'TN'), 'Vellore'),
((SELECT id FROM states WHERE code = 'TN'), 'Viluppuram'),
((SELECT id FROM states WHERE code = 'TN'), 'Virudhunagar');

-- Kerala Districts
INSERT INTO cities (state_id, name) VALUES
((SELECT id FROM states WHERE code = 'KL'), 'Alappuzha'),
((SELECT id FROM states WHERE code = 'KL'), 'Ernakulam'),
((SELECT id FROM states WHERE code = 'KL'), 'Idukki'),
((SELECT id FROM states WHERE code = 'KL'), 'Kannur'),
((SELECT id FROM states WHERE code = 'KL'), 'Kasaragod'),
((SELECT id FROM states WHERE code = 'KL'), 'Kollam'),
((SELECT id FROM states WHERE code = 'KL'), 'Kottayam'),
((SELECT id FROM states WHERE code = 'KL'), 'Kozhikode'),
((SELECT id FROM states WHERE code = 'KL'), 'Malappuram'),
((SELECT id FROM states WHERE code = 'KL'), 'Palakkad'),
((SELECT id FROM states WHERE code = 'KL'), 'Pathanamthitta'),
((SELECT id FROM states WHERE code = 'KL'), 'Thiruvananthapuram'),
((SELECT id FROM states WHERE code = 'KL'), 'Thrissur'),
((SELECT id FROM states WHERE code = 'KL'), 'Wayanad');

-- Karnataka Districts
INSERT INTO cities (state_id, name) VALUES
((SELECT id FROM states WHERE code = 'KA'), 'Bagalkot'),
((SELECT id FROM states WHERE code = 'KA'), 'Ballari'),
((SELECT id FROM states WHERE code = 'KA'), 'Belagavi'),
((SELECT id FROM states WHERE code = 'KA'), 'Bengaluru Rural'),
((SELECT id FROM states WHERE code = 'KA'), 'Bengaluru Urban'),
((SELECT id FROM states WHERE code = 'KA'), 'Bidar'),
((SELECT id FROM states WHERE code = 'KA'), 'Chamarajanagar'),
((SELECT id FROM states WHERE code = 'KA'), 'Chikkaballapur'),
((SELECT id FROM states WHERE code = 'KA'), 'Chikkamagaluru'),
((SELECT id FROM states WHERE code = 'KA'), 'Chitradurga'),
((SELECT id FROM states WHERE code = 'KA'), 'Dakshina Kannada'),
((SELECT id FROM states WHERE code = 'KA'), 'Davanagere'),
((SELECT id FROM states WHERE code = 'KA'), 'Dharwad'),
((SELECT id FROM states WHERE code = 'KA'), 'Gadag'),
((SELECT id FROM states WHERE code = 'KA'), 'Hassan'),
((SELECT id FROM states WHERE code = 'KA'), 'Haveri'),
((SELECT id FROM states WHERE code = 'KA'), 'Kalaburagi'),
((SELECT id FROM states WHERE code = 'KA'), 'Kodagu'),
((SELECT id FROM states WHERE code = 'KA'), 'Kolar'),
((SELECT id FROM states WHERE code = 'KA'), 'Koppal'),
((SELECT id FROM states WHERE code = 'KA'), 'Mandya'),
((SELECT id FROM states WHERE code = 'KA'), 'Mysuru'),
((SELECT id FROM states WHERE code = 'KA'), 'Raichur'),
((SELECT id FROM states WHERE code = 'KA'), 'Ramanagara'),
((SELECT id FROM states WHERE code = 'KA'), 'Shivamogga'),
((SELECT id FROM states WHERE code = 'KA'), 'Tumakuru'),
((SELECT id FROM states WHERE code = 'KA'), 'Udupi'),
((SELECT id FROM states WHERE code = 'KA'), 'Uttara Kannada'),
((SELECT id FROM states WHERE code = 'KA'), 'Vijayapura'),
((SELECT id FROM states WHERE code = 'KA'), 'Yadgir');

-- Andhra Pradesh Districts
INSERT INTO cities (state_id, name) VALUES
((SELECT id FROM states WHERE code = 'AP'), 'Anantapur'),
((SELECT id FROM states WHERE code = 'AP'), 'Chittoor'),
((SELECT id FROM states WHERE code = 'AP'), 'East Godavari'),
((SELECT id FROM states WHERE code = 'AP'), 'Guntur'),
((SELECT id FROM states WHERE code = 'AP'), 'Kadapa'),
((SELECT id FROM states WHERE code = 'AP'), 'Krishna'),
((SELECT id FROM states WHERE code = 'AP'), 'Kurnool'),
((SELECT id FROM states WHERE code = 'AP'), 'Nellore'),
((SELECT id FROM states WHERE code = 'AP'), 'Prakasam'),
((SELECT id FROM states WHERE code = 'AP'), 'Srikakulam'),
((SELECT id FROM states WHERE code = 'AP'), 'Visakhapatnam'),
((SELECT id FROM states WHERE code = 'AP'), 'Vizianagaram'),
((SELECT id FROM states WHERE code = 'AP'), 'West Godavari');

-- Telangana Districts
INSERT INTO cities (state_id, name) VALUES
((SELECT id FROM states WHERE code = 'TG'), 'Adilabad'),
((SELECT id FROM states WHERE code = 'TG'), 'Hyderabad'),
((SELECT id FROM states WHERE code = 'TG'), 'Jagtial'),
((SELECT id FROM states WHERE code = 'TG'), 'Jangaon'),
((SELECT id FROM states WHERE code = 'TG'), 'Kamareddy'),
((SELECT id FROM states WHERE code = 'TG'), 'Karimnagar'),
((SELECT id FROM states WHERE code = 'TG'), 'Khammam'),
((SELECT id FROM states WHERE code = 'TG'), 'Mahabubabad'),
((SELECT id FROM states WHERE code = 'TG'), 'Mahabubnagar'),
((SELECT id FROM states WHERE code = 'TG'), 'Mancherial'),
((SELECT id FROM states WHERE code = 'TG'), 'Medak'),
((SELECT id FROM states WHERE code = 'TG'), 'Medchal-Malkajgiri'),
((SELECT id FROM states WHERE code = 'TG'), 'Nalgonda'),
((SELECT id FROM states WHERE code = 'TG'), 'Nizamabad'),
((SELECT id FROM states WHERE code = 'TG'), 'Rangareddy'),
((SELECT id FROM states WHERE code = 'TG'), 'Sangareddy'),
((SELECT id FROM states WHERE code = 'TG'), 'Siddipet'),
((SELECT id FROM states WHERE code = 'TG'), 'Suryapet'),
((SELECT id FROM states WHERE code = 'TG'), 'Vikarabad'),
((SELECT id FROM states WHERE code = 'TG'), 'Warangal');

-- Maharashtra Districts
INSERT INTO cities (state_id, name) VALUES
((SELECT id FROM states WHERE code = 'MH'), 'Ahmednagar'),
((SELECT id FROM states WHERE code = 'MH'), 'Akola'),
((SELECT id FROM states WHERE code = 'MH'), 'Amravati'),
((SELECT id FROM states WHERE code = 'MH'), 'Aurangabad'),
((SELECT id FROM states WHERE code = 'MH'), 'Beed'),
((SELECT id FROM states WHERE code = 'MH'), 'Bhandara'),
((SELECT id FROM states WHERE code = 'MH'), 'Buldhana'),
((SELECT id FROM states WHERE code = 'MH'), 'Chandrapur'),
((SELECT id FROM states WHERE code = 'MH'), 'Dhule'),
((SELECT id FROM states WHERE code = 'MH'), 'Gadchiroli'),
((SELECT id FROM states WHERE code = 'MH'), 'Gondia'),
((SELECT id FROM states WHERE code = 'MH'), 'Hingoli'),
((SELECT id FROM states WHERE code = 'MH'), 'Jalgaon'),
((SELECT id FROM states WHERE code = 'MH'), 'Jalna'),
((SELECT id FROM states WHERE code = 'MH'), 'Kolhapur'),
((SELECT id FROM states WHERE code = 'MH'), 'Latur'),
((SELECT id FROM states WHERE code = 'MH'), 'Mumbai City'),
((SELECT id FROM states WHERE code = 'MH'), 'Mumbai Suburban'),
((SELECT id FROM states WHERE code = 'MH'), 'Nagpur'),
((SELECT id FROM states WHERE code = 'MH'), 'Nanded'),
((SELECT id FROM states WHERE code = 'MH'), 'Nandurbar'),
((SELECT id FROM states WHERE code = 'MH'), 'Nashik'),
((SELECT id FROM states WHERE code = 'MH'), 'Osmanabad'),
((SELECT id FROM states WHERE code = 'MH'), 'Palghar'),
((SELECT id FROM states WHERE code = 'MH'), 'Parbhani'),
((SELECT id FROM states WHERE code = 'MH'), 'Pune'),
((SELECT id FROM states WHERE code = 'MH'), 'Raigad'),
((SELECT id FROM states WHERE code = 'MH'), 'Ratnagiri'),
((SELECT id FROM states WHERE code = 'MH'), 'Sangli'),
((SELECT id FROM states WHERE code = 'MH'), 'Satara'),
((SELECT id FROM states WHERE code = 'MH'), 'Sindhudurg'),
((SELECT id FROM states WHERE code = 'MH'), 'Solapur'),
((SELECT id FROM states WHERE code = 'MH'), 'Thane'),
((SELECT id FROM states WHERE code = 'MH'), 'Wardha'),
((SELECT id FROM states WHERE code = 'MH'), 'Washim'),
((SELECT id FROM states WHERE code = 'MH'), 'Yavatmal');

-- North India (UP, Delhi, Rajasthan)
INSERT INTO cities (state_id, name) VALUES
((SELECT id FROM states WHERE code = 'DL'), 'New Delhi'),
((SELECT id FROM states WHERE code = 'DL'), 'Central Delhi'),
((SELECT id FROM states WHERE code = 'UP'), 'Lucknow'),
((SELECT id FROM states WHERE code = 'UP'), 'Kanpur'),
((SELECT id FROM states WHERE code = 'UP'), 'Varanasi'),
((SELECT id FROM states WHERE code = 'UP'), 'Agra'),
((SELECT id FROM states WHERE code = 'UP'), 'Noida'),
((SELECT id FROM states WHERE code = 'RJ'), 'Jaipur'),
((SELECT id FROM states WHERE code = 'RJ'), 'Jodhpur'),
((SELECT id FROM states WHERE code = 'RJ'), 'Udaipur');
