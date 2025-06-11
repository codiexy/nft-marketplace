const { ObjectId } = require('mongodb');

const User = async (database, address, type = "admin") => {
    try {
        if (!['user', 'admin', "authorizer"].includes(type)) { throw new Error('Invalid type!') }
        if (address) {
            const collection = database.collection('users');
            const result = await collection.find({
                ethAddress: address
            }).toArray();
            if (result.length) {
                const user = result.shift();
                let role = "USER";
                if(type === "admin") role = "ADMIN";
                if(type === "artist") role = "ARTIST";
                if(type === "authorizer") role = "AUTHORIZER";
                const res = await collection.updateOne(
                    {
                        _id: new ObjectId(user._id)
                    },
                    {
                        $set: {
                            role: role,
                            isApproved: true
                        }
                    }
                )
                if (res.acknowledged) {
                    console.log('Data updates successfully!');
                }
            }
        } else {
            console.log("Address must be required!");
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports = User;