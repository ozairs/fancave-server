# Running Fancave Application

1. Run the Teams Service (GRPC service)

```
cd fancave-grpc
node /dist/fancave-server.js
npm run start
> http://localhost:50051/
```

2. Run the Fancave REST service

```
cd fancave-server
npm run start
> http://localhost:3000/
```

3. Run the Fancave GraphQL service

```
cd fancave-server
npx openapi-to-graphql --port=3001 http://localhost:3000/openapi-app.json
> http://localhost:3001/graphql
```

Note: default file, openapi-app.json must remove field `contentType: application/json`

Run sample queries

```
  query {
    apiListNews {
      description
      title
      url
      urlToImage
    }
  }

  query {
    apiListNews(league : "nba") {
      description
    }
  }

  query {
    apiListTeam(league: "nba", team: "tor") {
      arena
      city
      description
      lat
      league
      logo
      long
      name
      shortname
    }
  }

  query {
    apiListPlayers(league: "nba", team: "tor") {
      birthplace
      league
      logo
      name
      picture
      position
      twitter
    }
}
```
