import {inject, Provider} from '@loopback/core';
import {TeamsDataSource} from '../datasources';
import {Team} from '../models';
const grpc = require('grpc');
// const protoLoader = require('@grpc/proto-loader');

// const messages = require('../models/fancave-teams_pb');
// const services = require('../models/fancave-teams_grpc_pb');
import {TeamRequest} from '../grpc/fancave-teams_pb';
import {TeamServiceClient} from '../grpc/fancave-teams_grpc_pb';
import {credentials} from 'grpc';

export interface TeamsService {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  getTeams(league: string, team: string): Promise<Team[]>;
}

/**
 * gRPC based service
 */
export class TeamsServiceProvider implements Provider<TeamsService> {
  constructor(
    @inject('datasources.teams_grpc')
    protected dataSource: TeamsDataSource = new TeamsDataSource(),
  ) {}

  async value(): Promise<TeamsService> {
    // const PROTO_PATH = __dirname + '/../datasources/fancave-teams.proto';

    // const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    //   keepCase: true,
    //   longs: String,
    //   enums: String,
    //   defaults: true,
    //   oneofs: true,
    // });
    // const fancaveProto = grpc.loadPackageDefinition(packageDefinition).fancave;
    const url = this.dataSource.config.url;
    console.log('Teams service URL %s', url);

    // let credentials = grpc.credentials.createSsl(fs.readFileSync('./ssl/server.crt'),
    // fs.readFileSync('./ssl/client.key'), fs.readFileSync('./ssl/client.crt'));
    // const client = new TeamServiceClient(url, credentials);
    const client = new TeamServiceClient(url, grpc.credentials.createInsecure());

    const service: TeamsService = {
      getTeams: (league: string, team: string) => {
        const teamRequest = new TeamRequest();
        teamRequest.setLeague(league);
        teamRequest.setTeam(team);
        let teamResponse = '';
        return new Promise<Team[]>((resolve, reject) => {
          client.getTeams(teamRequest, function (error, request) {
            if (error) {
              console.error('Unable to invoke service with error %s', error);
              return;
            }
            //console.log('request %s', JSON.stringify(request));
            teamResponse = request.getTeams();
            return resolve(JSON.parse(teamResponse) as Team[]);
          });
        });
      },
    };
    return service;
  }
}
