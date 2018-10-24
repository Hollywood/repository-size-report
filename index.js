require('dotenv').config()
const fs = require('fs')
const path = require('path')
const Json2csvParser = require('json2csv').Parser;
const github = require('@octokit/rest')({
    headers: {
        accept: 'application/vnd.github.hellcat-preview+json'
    },
    //Set this to GHE API url if on GitHub Enterprise
    baseUrl: 'https://api.github.com'
})
require('./pagination')(github)

//Add a PAT to the .env file to authenticate against the instance.
github.authenticate({
    type: 'token',
    token: process.env.ghToken
})

async function getRepoData() {
    var table = []

    //Get List of Repos and their sizes
    const repoResponse = [].concat.apply([], 
        (await github.paginate(github.repos.getAll())).map(n => n.data.map((n) => [n.html_url])))
    
    for(const repo of repoResponse){
    table.push({
        html_url: repo[0]
        })
    }
        
    //Write to CSV file
    var jsonResults = JSON.stringify(table)
    const fields = ['html_url']
    var json2csvParser = new Json2csvParser({
      fields,
      delimiter: ';'
    })
    const csv = json2csvParser.parse(table)
    console.log(csv)
    fs.writeFile('repo-addresses.csv', csv, function (err) {
      if (err) throw err
      console.log('file saved!')
    })
}


getRepoData()
