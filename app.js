const express = require('express');
const bodyParser = require('body-parser');
const morgan = require("morgan");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require('graphql');


const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());

// graphql is a typed language

app.use("/graphql",graphqlHttp({

    // ! is for not null return type
    // mentioning the return type
    schema:buildSchema(`

        type RootQuery{
            events: [String!] 
        }

        type RootMutation{
            createEvent(name: String): String!
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `), // created with graphql package --- this is with the specification of the graphql
    rootValue: { // must matches with the schema
        events:()=>{
            return ['testing','cooking','coding']
        },
        createEvent:(args)=>{
            return args.name;
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

app.listen(3000);