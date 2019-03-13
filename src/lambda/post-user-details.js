const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

let conn = null;

exports.handler = async function(event, context, callback) {
  if (event.httpMethod != 'POST') {
    return callback(null, {
      statusCode: 405,
      body: 'Method not allowed',
    });
  }

  context.callbackWaitsForEmptyEventLoop = false;
  const uri = process.env.MONGO_URL;
  console.log('trying');
  const body = JSON.parse(event.body);
  console.log(body);

  const PersonSchema = new mongoose.Schema({
    Email: {
      type: String,
      required: true,
      trime: true,
    },
    Address: {
      type: String,
      required: false,
      trime: true,
    },
    IdentityID: {
      type: String,
      required: true,
    },
    AvatarUrl: {
      type: String,
      required: false,
    },
  });

  PersonSchema.plugin(timestamp);

  if (conn == null || (typeof conn.serverConfig === 'undefined')) {
    conn = await mongoose.createConnection(uri, {
      bufferCommands: false,
      bufferMaxEntries: 0,
      useNewUrlParser: true,
    });
    conn.model('User', PersonSchema);
  }

  const UserModel = conn.model('User');
  const user = new UserModel(body);
  const newUser = await UserModel.findOneAndUpdate({IdentityID: body.IdentityID}, body,{upsert: true, new: true, runValidators: true}, 
    (err,doc)=>{if (err){
      console.log(err)
      return callback(null, {
        statusCode: 502,
        body: err.message,
      });
    }
    console.log(doc)
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(doc),
    });
  })
};
