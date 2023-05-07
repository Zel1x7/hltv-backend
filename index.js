const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./init/db');

app.use(express.json(), cors());

let teamIdCounter = 0;

const addTeam = async (req, res) => {
    const { name, logo, wr, country } = req.body;
    if (!name || !logo || !wr || !country) {
        return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    const newTeam = {
        id: `${++teamIdCounter}`,
        name,
        logo,
        wr,
        country
    }

    try {
        const database = await db();
        const team = await database.teams.insertOne(newTeam);
        return res.status(200).json({
            message: "Team added successfully",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


const teamsList = async (req, res) => {
    try {
        const database = await db();
        const query = {};
        const teams = await database.teams.find(query).toArray();
        return res.json(teams);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
}

const findTeam = async (req, res) => {
    try {
        const database = await db();
        const team = await database.teams.findOne({ id: req.params.id });
        if (!team) {
            return res.status(404).send('Team not found');
        }
        return res.json(team);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
}

const deleteTeam = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.sendStatus(422);
        }
        const database = await db();
        const team = await database.teams.findOne({ id: req.params.id });
        if (!team) {
            return res.sendStatus(404);
        }
        database.teams.deleteOne({ id: req.params.id }, (err, n) => {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(n ? 200 : 404);
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
}

const updateTeam = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.sendStatus(422);
    }

    const database = await db();
    const team = await database.teams.findOne({ id: req.params.id });
    if (!team) {
      return res.sendStatus(404);
    }

    const { name, logo, wr, country } = req.body;
    const updated = {
      name,
      logo,
      wr,
      country
    };

    const result = await database.teams.updateOne({ id: req.params.id }, { $set: updated });
    if (result.modifiedCount === 0) {
      return res.sendStatus(500);
    }

    const updatedTeam = await database.teams.findOne({ id: req.params.id });
    return res.json({
      team: updatedTeam,
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

app.post('/api/teams', addTeam);

app.get('/api/teams/:id', findTeam)

app.get('/api/teams', teamsList)

app.delete('/api/teams/:id', deleteTeam)

app.patch('/api/teams/:id', updateTeam)

app.listen(process.env.PORT || 8080, () => {
    console.log("Server started normally");
});