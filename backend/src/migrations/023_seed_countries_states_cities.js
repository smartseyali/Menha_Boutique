'use strict';

exports.up = async function (pgm) {
  // Insert India as a country
  const indiaResult = await pgm.db.query(`
    INSERT INTO countries (id, name, code, is_active) 
    VALUES (gen_random_uuid(), 'India', 'IN', true)
    ON CONFLICT (code) DO NOTHING
    RETURNING id
  `);
  
  let indiaId;
  if (indiaResult.rows && indiaResult.rows.length > 0) {
    indiaId = indiaResult.rows[0].id;
  } else {
    // If India already exists, get its ID
    const existingIndia = await pgm.db.query(`SELECT id FROM countries WHERE code = 'IN'`);
    indiaId = existingIndia.rows[0].id;
  }

  // Insert Indian states
  const states = [
    { name: 'Gujarat', code: 'GJ' },
    { name: 'Goa', code: 'GA' },
    { name: 'Haryana', code: 'HR' },
    { name: 'Maharashtra', code: 'MH' },
    { name: 'Delhi', code: 'DL' },
    { name: 'Karnataka', code: 'KA' },
    { name: 'Tamil Nadu', code: 'TN' },
    { name: 'West Bengal', code: 'WB' },
  ];

  for (const state of states) {
    const stateResult = await pgm.db.query(`
      INSERT INTO states (id, country_id, name, code, is_active)
      VALUES (gen_random_uuid(), $1, $2, $3, true)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [indiaId, state.name, state.code]);
    
    let stateId;
    if (stateResult.rows && stateResult.rows.length > 0) {
      stateId = stateResult.rows[0].id;
    } else {
      const existingState = await pgm.db.query(
        `SELECT id FROM states WHERE country_id = $1 AND name = $2`,
        [indiaId, state.name]
      );
      if (existingState.rows.length > 0) {
        stateId = existingState.rows[0].id;
      }
    }

    if (stateId) {
      // Insert cities for each state
      let cities = [];
      if (state.name === 'Gujarat') {
        cities = ['Surat', 'Bhavnagar', 'Amreli', 'Rajkot', 'Ahmedabad', 'Vadodara', 'Gandhinagar'];
      } else if (state.name === 'Goa') {
        cities = ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'];
      } else if (state.name === 'Haryana') {
        cities = ['Gurgaon', 'Faridabad', 'Ambala', 'Karnal', 'Panipat'];
      } else if (state.name === 'Maharashtra') {
        cities = ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'];
      } else if (state.name === 'Delhi') {
        cities = ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'];
      } else if (state.name === 'Karnataka') {
        cities = ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'];
      } else if (state.name === 'Tamil Nadu') {
        cities = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'];
      } else if (state.name === 'West Bengal') {
        cities = ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'];
      }

      for (const cityName of cities) {
        await pgm.db.query(`
          INSERT INTO cities (id, state_id, name, is_active)
          VALUES (gen_random_uuid(), $1, $2, true)
          ON CONFLICT DO NOTHING
        `, [stateId, cityName]);
      }
    }
  }
};

exports.down = async function (pgm) {
  // Delete all cities, states, and countries
  await pgm.db.query('DELETE FROM cities');
  await pgm.db.query('DELETE FROM states');
  await pgm.db.query('DELETE FROM countries');
};

