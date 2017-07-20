const notesFs = require('./fs');
const notesMemory = require('./memory');
const mongoDb = require('./mongoDb');
const sequelize = require('./sequelize');

function defineStorageModel(model) {
    switch (model) {
        case 'MEMORY': return notesMemory;
        case 'FS': return notesFs;
        case 'MONGO_DB': return mongoDb;
        case 'MYSQL': return sequelize;
        default: return notesMemory;
    }
}

module.exports = defineStorageModel(process.env.NOTES_MODEL);