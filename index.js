require('dotenv').config()
const fs = require('fs')
const path = require('path')
const Json2csvParser = require('json2csv').Parser;
const github = require('@octokit/rest')({
    headers: {
        accept: 'application/vnd.github.hellcat-preview+json'
    },
    //Set this to GHE url
    baseUrl: 'https://api.github.com'
})
require('./pagination')(github)

//Create a local .env file with a single var named 'ghToken' containing a PAT of a user with access to all repos you want information on.
github.authenticate({
    type: 'token',
    token: process.env.ghToken
})

async function getRepoData() {
    var table = []

    //Get List of Repos and their sizes
    const repoResponse = [].concat.apply([], 
        (await github.paginate(github.repos.getAll())).map(n => n.data.map((n) => [n.name , n.size + ' kb'])))
    
    for(const repo of repoResponse){
    table.push({
        repo: repo[0],
        size: repo[1]
        })
    }
        
    //Write to CSV file
    var jsonResults = JSON.stringify(table)
    const fields = ['repo', 'size']
    var json2csvParser = new Json2csvParser({
      fields,
      delimiter: ';'
    })
    const csv = json2csvParser.parse(table)
    console.log(csv)
    fs.writeFile('repo-sizes.csv', csv, function (err) {
      if (err) throw err
      console.log('file saved!')
    })
}


getRepoData()
