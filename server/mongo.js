// driver to mongoDB
const { MongoClient, CURSOR_FLAGS } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://SHU:mongo@cluster0.5jvke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    
    const client = new MongoClient(uri);

    try {
      await client.connect();

      await deleteListingsScrapedBeforeDate(client, new Date("2019-02-15"));

    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }

}

main().catch(console.error);

async function deleteListingsScrapedBeforeDate(client, date) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
        .deleteMany({ "last_scraped": { $lt: date } });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("Sample_airbnb").collection("listingsAndReviews").deleteOne({ name: nameOfListing });

    console.log(`${result.deleteCount} document(s) was/were deleted`);
}

async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        .updateMany({ property_type: { $exists: false } }, 
                                    { $set: { property_type: "Unknown" } });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        .updateOne({ name: nameOfListing }, { $set: updatedListing }, {upsert: true});

    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    
    if (result.upsertedCount > 0) {
        console.log(`One document was inserted with the id ${result.upsertedId}`);
    } else {
      console.log(`${result.modifiedCount} document(s) was/were updated`);
    }
}

async function updateListingByName (client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        .updateOne({ name: nameOfListing }, { $set: updatedListing });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews (client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBethrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {
    const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms : { $gte: minimumNumberOfBedrooms},
        bathrooms: { $gte: minimumNumberOfBethrooms}
     }).sort({ last_review: -1})
          .limit(maximumNumberOfResults);

     const results = await cursor.toArray();

     if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBethrooms} bathrooms:`);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}

async function findOneListingbyName(client, nameofListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name: nameofListing });

    if(result) {
      console.log(`found a Listing in the collection with the name '${nameofListing}'`);
      console.log(result);
    } else {
      console.log(`No listing found with the name '${nameofListing}'`);
    }
}

async function createMultipleListings(client, newListings){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);

    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds);       
}

async function createListing(client, newListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);

    console.log(`New listing created with the following id: ${result.insertedId}`);
}

async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();

    console.log("Database:");
    databasesList.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
}