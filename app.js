const express = require('express');
const bodyParser = require('body-parser');
const morgan = require("morgan");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require("./models/events");

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

        type RootQuery{
            events: [Event!]! 
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootMutation{
            createEvent(eventInput: EventInput): Event!
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
            return events;
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
                            return {...result._doc}
                        })
                        .catch(err=>{
                            console.log(err);
                            throw err;
                        });
        } 
    },// point at js object which have all the resolver function in it match by name
    graphiql:true

}));


// api testing code
// app.get("/",(req,res,next)=>{
//     res.status = 200;
//     res.json({
//         message:"Testing"
//     })
// });
mongoose.connect("mongodb+srv://admin:"+process.env.MONGO_PASSWORD+"@node-rest-api-tispt.mongodb.net/graphQL?retryWrites=true&w=majority",{useNewUrlParser:true})
.then(()=>{
    console.log("successfully Connected to database");
    app.listen(3000);
})
.catch(err=>console.log(err));
//start server only if the database is connected

