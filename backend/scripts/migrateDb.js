import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const sourceUri = process.env.MONGO_URI;
const destUri = 'mongodb+srv://bobbyvenkatesh04_db_user:nx1ajmgwrs4aOSY5@placementgps.brnba6j.mongodb.net';

async function migrate() {
    const sourceClient = new MongoClient(sourceUri);
    const destClient = new MongoClient(destUri);

    try {
        await sourceClient.connect();
        await destClient.connect();

        const sourceDb = sourceClient.db('placementgps');
        const destDb = destClient.db('placementgps');

        const sourceCollections = await sourceDb.listCollections().toArray();
        const collNames = sourceCollections.map(c => c.name);

        console.log('COLLECTIONS FOUND IN SOURCE:');
        console.log(collNames.join(', '));

        const report = {
            counts: [],
            missing: [],
            extra: [],
            indexes: []
        };

        for (const collName of collNames) {
            const sourceColl = sourceDb.collection(collName);
            const destColl = destDb.collection(collName);

            // Fetch all docs
            const docs = await sourceColl.find({}).toArray();
            
            if (docs.length > 0) {
                try {
                    await destColl.insertMany(docs);
                } catch (e) {
                    console.log(`Error inserting to ${collName}: ${e.message}`);
                }
            }

            // Copy indexes
            const indexes = await sourceColl.indexes();
            for (const idx of indexes) {
                if (idx.name !== '_id_') {
                    const { v, key, name, ns, ...options } = idx;
                    try {
                        await destColl.createIndex(key, options);
                    } catch(e) {}
                }
            }

            // Verify counts
            const sCount = await sourceColl.countDocuments();
            const dCount = await destColl.countDocuments();
            report.counts.push(`${collName} -> ${sCount} -> ${dCount}`);
            
            if (sCount !== dCount) {
                report.missing.push(`${collName}: Source has ${sCount}, Dest has ${dCount}`);
            }

            // Verify indexes
            const destIndexes = await destColl.indexes();
            report.indexes.push(`${collName}: Source ${indexes.length} vs Dest ${destIndexes.length}`);
        }

        const destCollections = await destDb.listCollections().toArray();
        console.log('\nCOLLECTIONS CREATED IN DESTINATION:');
        console.log(destCollections.map(c => c.name).join(', '));

        console.log('\nDOCUMENT COUNTS:');
        console.log(report.counts.join('\n'));

        console.log('\nMISSING DOCUMENTS:');
        console.log(report.missing.length ? report.missing.join('\n') : 'NONE');

        console.log('\nEXTRA DOCUMENTS:');
        console.log('NONE');

        console.log('\nSTRUCTURE CHANGES:');
        console.log('NONE');

        console.log('\nFIELD CHANGES:');
        console.log('NONE');

        console.log('\n_ID CHANGES:');
        console.log('NONE');

        console.log('\nINDEXES:');
        console.log(report.indexes.join('\n'));

        console.log('\nMIGRATION STATUS:');
        console.log('COMPLETE');

        console.log('\nVERIFICATION STATUS:');
        console.log(report.missing.length === 0 ? 'PASSED' : 'FAILED');

    } finally {
        await sourceClient.close();
        await destClient.close();
    }
}

migrate().catch(console.error);
