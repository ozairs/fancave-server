# Running Fancave Application

1. Run the Teams Service (GRPC service)

```
git clone https://github.com/ozairs/fancave-grpc.git
cd fancave-grpc
node /dist/fancave-server.js
npm run start
> http://localhost:50051/
```

2. Run the Fancave REST service

```
git clone https://github.com/ozairs/fancave-server.git
cd fancave-server
npm install
npm run clean
npm run build
npm run start
> http://localhost:3080/
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
