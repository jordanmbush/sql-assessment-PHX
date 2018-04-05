const express = require('express');
const massive = require('massive');
const bodyParser = require('body-parser');
require('dotenv').config();


massive(process.env.CONNECTION_STRING).then( db => {
  app.set('db', db);

  // Initialize user table and vehicle table.
  db.init_tables.user_create_seed().then( response => {
    console.log('User table init');
    db.init_tables.vehicle_create_seed().then( response => {
      console.log('Vehicle table init');
    }).catch( err => console.log('vehicle_create_seed err: ', err));
  }).catch( err => console.log('user_create_seed err: ', err));
});

const app = express();
app.use(bodyParser.json());

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

//  that will query the database and get all users.
app.get('/api/users', (req, res) => {
  const db = req.app.get('db');
  db.get_users().then( users => {
    res.json(users);
  }).catch(err => console.log('api_1: get users err: ', err));
});

// that will query the database and get all vehicles.
app.get('/api/vehicles', (req, res) => {
  const db = req.app.get('db');
  db.get_vehicles().then( vehicles => {
    res.json(vehicles);
  }).catch(err => console.log('api_2: get vehicles err: ', err));
});

// that will take a user from the body and add them to the database.
// Use the RETURNING clause to return the added user information.
app.post('/api/users', (req, res) => {
  const db = req.app.get('db');
  const {name, email} = req.body;
  db.post_users(name, email).then( user => {
    res.json(user);
  }).catch(err => console.log('api_3: post user err: ', err));
})

// that will take a vehicle from the body and add it to the database.
// Use the RETURNING clause to return the added vehicle information.
app.post('/api/vehicles', (req, res) => {
  const db = req.app.get('db');
  const {make, model, year, owner_id} = req.body;
  db.post_vehicles(make, model, year, owner_id).then( vehicle => {
    res.json(vehicle);
  }).catch(err => console.log('api_4: post vehicle err: ', err));
})

// that will return a count of how many vehicles belong to the given user.
// Response should be an object with a count property, ie: { count: 1 }
app.get('/api/user/:userId/vehiclecount', (req, res) => {
  const db = req.app.get('db');
  const userId = req.params.userId;
  db.get_vehicles_by_user_id(userId).then( vehicles => {
    let count = [{count: vehicles.length}];
    res.json(count);
  }).catch(err => console.log('api_5: get vehicle count by user err: ', err));
})

// that will find all vehicles that belong to the user with the provided users id.
app.get('/api/user/:userId/vehicle', (req, res) => {
  const db = req.app.get('db');
  const userId = req.params.userId;
  db.get_vehicles_by_user_id(userId).then( vehicles => {
    res.json(vehicles);
  }).catch(err => console.log('api_6: get vehicles by user err: ', err));
})

// that will find all vehicles that belong to the user with the provided user's email.
// The uses email will be send on the request url as a query. Example: ?userEmail=[user email]
// Use the above endpoint to also handle the query ?userFirstStart=[letters] to get all vehicles for any user whose first name starts with the provided letters.
app.get('/api/vehicle', (req, res) => {
  const db = req.app.get('db');
  let {userEmail, userFirstStart} = req.query;
  // userFirstStart = userFirstStart ? userFirstStart + '*' : '*';
  // console.log(userFirstStart);
  if(userEmail) {
    db.get_vehicles_by_user_email(userEmail).then( vehicles => {
      res.json(vehicles);
    }).catch(err => console.log('api_7: get vehicles by email: ', err));
  } else if(userFirstStart) {
    userFirstStart = userFirstStart + '%';
    console.log(userFirstStart)
    db.get_vehicles_by_letters(userFirstStart).then( vehicles => {
      res.json(vehicles);
    }).catch(err => console.log('api_7: get vehicles by letters: ', err));
  }
})

app.get('/api/newervehiclesbyyear', (req, res) => {
  const db = req.app.get('db');
  db.get_new_vehicles_by_year().then( vehicles => {
    res.json(vehicles);
  }).catch(err => console.log('api_8: get new vehicles err: ', err));
})
// that gets all vehicles newer than 2000 and sorted by year with the newest car first. Include the owner's name from the users table.

// that changes the ownership of the provided vehicle using the new owner's user id (userId param).
// Use the RETURNING clause to return the updated vehicle information.
app.put('/api/vehicle/:vehicleId/user/:userId', (req, res) => {
  const db = req.app.get('db');
  const {vehicleId, userId} = req.params;
  db.update_vehicle_owner(vehicleId, userId).then( vehicle => {
    res.json(vehicle)
  }).catch( err => console.log('api_9: update_vehicle_owner err: ', err));
})

app.delete('/api/user/:userId/vehicle/:vehicleId', (req, res) => {
  const db = req.app.get('db');
  const {vehicleId, userId} = req.params;
  
  db.delete_vehicle_owner(vehicleId).then( vehicle => {
    res.json(vehicle)
  }).catch( err => console.log('api_9: delete_vehicle_owner err: ', err));
})
// that removes ownership of that vehicle from the provided user, but does not delete the vehicle.
// Use the RETURNING clause to return the updated vehicle information.

app.delete('/api/vehicle/:vehicleId', (req, res) => {
  const db = req.app.get('db');
  const {vehicleId} = req.params;
  
  db.delete_vehicle(vehicleId).then( vehicle => {
    res.json(vehicle)
  }).catch( err => console.log('api_9: delete_vehicle_owner err: ', err));
})
// that deletes the specified vehicle.
// Use the RETURNING clause to return the removed vehicle information.