const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb+srv://admin:denis12k@cluster0.i1n9fj2.mongodb.net/?retryWrites=true&w=majority');

async function db() {
    await client.connect();
    const db = client.db('hltv');
    const teams = db.collection('teams');
    const players = db.collection('players');
    const matches = db.collection('matches');
    return {
        teams,
        players,
        matches
    };
}

module.exports = async function() {
    const database = await db();
    return {
        teams: database.teams,
        players: database.players,
        matches: database.matches
    };
}
