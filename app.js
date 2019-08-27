const express = require('express');
const bodyParser = require('body-parser');
const morgan = require("morgan");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Model imports
const Event = require("./models/events");
const User = require("./models/user");

// nodemon consume the nodemon.json file for extra data
mongoose.Promise = global.Promise;

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());

// graphql is a typed language

app.use("/graphql",graphqlHttp({

    // ! is for not null return type
    // mentioning the return type
    schema:buildSchema(`
        type Event{
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date : String!
        }

        type User{
            _id: ID!
            email: String!
            password: String
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery{
            events: [Event!]!
            users: [User!]! 
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootMutation{
            createEvent(eventInput: EventInput): Event!
            createUser(userInput: UserInput): User!
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `), // created with graphql package --- this is with the specification of the graphql
    rootValue: { // must matches with the schema
        events:()=>{
            
            return Event.find() // must return the promise
            .then((events)=>{
                console.log(events);
                // remove the meta data from the mongoDB return
                return events.map(event=>{
                    return {...event._doc};
                })

            })
            .catch(err=>{
                console.log(err);
            });
        },
        createEvent: (args)=>{
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
            });

            return event.save() // must return the promise
                        .then(result=>{
                            console.log(result);
                            // must return the actual doc
                            console.log(result)
                            return {...result._doc, _id:event._doc._id.toString() } 
                            // automatically replace the _id in _doc by the second parameter in javascript extraction sytax
                        })
                        .catch(err=>{
                            console.log(err);
                            throw err;
                        });
        },
        createUser:(args)=>{

            // look for user with existing in the data base and return response accordling

            return User.findOne({email:args.userInput.email})
            .then(user=>{
                if(user){
                    throw new Error("User Already Exist");
                }
                return bcrypt.hash(args.userInput.password, 12);
            })
            .then(hashPassword=>{
                    const user = new User({
                        email:args.userInput.email,
                        password:hashPassword
                    });
                    return user.save(); // this return promise which will be handles in the upper promise resolver
                    
                })
            .then(result=>{
                    console.log(result);
                    return {...result._doc,password:null };
                })
            .catch(err=>{
                    console.log(err);
                    throw err; // this will pass the error to the high level promise and resolving of promise works fine
            }) // 12 rounds of salting knows as 12 round of salts
      
                

        },
        users:()=>{

            return User.find()
            .then(result => {
                return result.map(user=>{
                    return {...user._doc,password:null};
                })
            })
            .catch(err=>{
                console.log(err);
            });
            
        }
         
    },
    // point at js object which have all the resolver function in it match by name
    graphiql:true

}));


// api testing code
// app.get("/",(req,res,next)=>{
//     res.status = 200;
//     res.json({
//         message:"Testing"
//     })
// });

if(require("os").userInfo().username==="rupanshu.verma"){
    //mongodb://127.0.0.1:27017/
    mongoose.connect("mongodb://127.0.0.1:27017/graphQL",{useNewUrlParser:true})
    .then(()=>{
        console.log("successfully Connected to database");
        app.listen(3000);
    })
    .catch(err=>{
        console.log(err);
    });
}else{

    mongoose.connect("mongodb+srv://admin:"+process.env.MONGO_PASSWORD+"@node-rest-api-tispt.mongodb.net/graphQL?retryWrites=true&w=majority",{useNewUrlParser:true})
    .then(()=>{
        console.log("successfully Connected to database");
        app.listen(3000);
    })
    .catch(err=>{
        console.log(err)
        console.log()
    });
    //start server only if the database is connected
}


