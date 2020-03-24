const proxy = require('proxy-agent');
const { GraphQLClient } = require('graphql-request');


const TOKEN = process.env.HUBOT_GITHUB_TOKEN;
const HTTPS_PROXY = process.env.HTTPS_PROXY || "";


const client = new GraphQLClient("https://api.github.com/graphql", {
    headers: {
        'authorization': 'Bearer ' + TOKEN,
        'content-type': 'application/json'
    },
    agent: proxy(HTTPS_PROXY, true)
});


module.exports = async function graphQuery(query) {
    const data = await client.request(query);
    return data;
}
