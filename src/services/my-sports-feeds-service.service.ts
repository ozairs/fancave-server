import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {MySportsFeedsDataSource} from '../datasources';

export interface MySportsFeedsService {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  getScores(league: string, season: string, date: string, accessToken: string): Promise<Object[]>;

  getPlayers(league: string, team: string, accessToken: string): Promise<Object[]>;

  getNews(league: string): Promise<Object[]>;
}

export class MySportsFeedsServiceProvider implements Provider<MySportsFeedsService> {
  constructor(
    // MySportsFeeds must match the name property in the datasource json file
    @inject('datasources.MySportsFeeds')
    protected dataSource: MySportsFeedsDataSource = new MySportsFeedsDataSource(),
  ) {}

  value(): Promise<MySportsFeedsService> {
    return getService(this.dataSource);
  }
}
