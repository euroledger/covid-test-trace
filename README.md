NEW COVID APP

To run the app:

`npm run start`

This will bring up the Test&Trace app on localhost:3000

The app uses a json server as a mock REST API to a data repository.

To start the json server:

`json-server --watch db.json --port 3004` 

The data store persists restaurant data (real app would persist to restaurant wallet), and the user keys:

`1. The NHS test&trace key
`2. The connection id with a particular restaurant


The NHS Key provides the 'glue' between the NHS, the app, and restaurants, so that our customer matcher can find all instances of
a particular customer's recorded locations by searching for this key.

Each record will give a place and date for the presence of that person and with that data we can pull out all the distinct
connection IDs of all other customers who visited a particular place at the same time.

The app then fires one - and only one - message to each customer in this list to advise them that they were present in the same place and time as a person who has tested positive.



