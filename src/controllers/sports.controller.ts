import {inject} from '@loopback/core';
import {get, getModelSchemaRef, param} from '@loopback/rest';

import {Scores, ScoresResponse} from '../models/scores.model';
import {MySportsFeedsService} from '../services/my-sports-feeds-service.service';
import {News, NewsResponse, NewsItem, Player, PlayerResponse, Team} from '../models';
import config from '../datasources/config.json';
import teamsDS from '../datasources/teams.json';
import {TeamsService} from '../services';

const cheerio = require('cheerio');
const convert = require('xml-js');

/**
 * Main class that handles incoming requests and sends response
 */
export class SportsController {
  accessToken = config.feed.access_token;
  teams = teamsDS;
  newsURL = config.news.url;
  imagesURL = config.images.url;

  constructor(
    @inject('services.MySportsFeedsService')
    protected sportsService: MySportsFeedsService,
    @inject('services.TeamsService')
    protected teamsService: TeamsService,
  ) {}

  /**
   *
   * Returns an array of scores for a given league, season and date
   *
   * @param league: shortname of sports league [nba, nhl, nfl, mlb]
   * @param season: shortname of season [2019-2020-regular, 2019-2020-playoff, 2020-regular, etc ..]
   * @param date: date in the format (YYYYMMDD)
   */
  @get('/api/team/scores', {
    responses: {
      '200': {
        description: 'Array of Score instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Scores)},
          },
        },
      },
    },
  })
  async findScores(
    @param.query.string('league') league: string,
    @param.query.string('season') season: string,
    @param.query.string('date') date: string,
  ): Promise<Object[]> {
    console.log('<< findScores');

    //validates input parameters
    const validateResp = this.validateParams(league, season, date);

    if (validateResp !== '') {
      console.error(validateResp);
      return [];
    }

    try {
      //get scores synchronously
      const response = await this.sportsService.getScores(league, season, date, this.accessToken);
      //get teams synchronously
      const currentTeams = await this.getTeams(league, '');

      //scores is successful (if team fails, we still continue)
      if (response && !response['error']) {
        console.log('Successfully obtained response');
        //build the scores array
        return await new Promise<Scores[]>((resolve, reject) => {
          resolve(this.parseScores(response, league, date, currentTeams));
        });
      } else {
        console.log('Error fetching response');
      }
    } catch (error) {
      console.log('Error occured during search operation.');
    }

    console.log('>> findScores');
    return [];
  }

  /**
   *
   * Parses an object to build a consolidated array of score objects
   *
   * @param response: object containing list of games requested for a given date and league
   * @param league: shortname of sports league [nba, nhl, nfl, mlb]
   * @param date: date in the format (YYYYMMDD)
   * @param currentTeams: list of teams for the given league
   */
  private parseScores(response: Object[], league: string, date: string, currentTeams: Team[]): Array<Scores> {
    console.log('<< parseScores');

    const scoresResponse: ScoresResponse[] = response[0] as ScoresResponse[];
    if (!scoresResponse) {
      return [];
    }

    const data: Array<Scores> = [];

    //iterate over the each game
    for (const item of scoresResponse) {
      let awayTeam = '';
      let homeTeam = '';
      let numResults = 0;
      //find the fully qualified team name from the list of teams - used to build URL for game
      //interate over all teams from a league
      for (const element of currentTeams) {
        //each game consists of two teams (home and away), so we are done when we find two teams
        if (numResults === 2) break;
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore: shortname exists but is flagged incorrectly
        if (element.shortname === item.schedule.awayTeam.abbreviation) {
          awayTeam = element.name.toLowerCase().split(' ').join('-');
          numResults = numResults + 1;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore: shortname exists but is flagged incorrectly
        else if (element.shortname === item.schedule.homeTeam.abbreviation) {
          homeTeam = element.name.toLowerCase().split(' ').join('-');
          numResults = numResults + 1;
        }
      }

      //build the scores array
      const scoresItem = new Scores({
        away: item.schedule.awayTeam.abbreviation,
        awayScore: item.score.awayScoreTotal,
        awayLogo: this.imagesURL + '/images/' + league + '/' + awayTeam + '.svg',
        home: item.schedule.homeTeam.abbreviation,
        homeScore: item.score.homeScoreTotal,
        homeLogo: this.imagesURL + '/images/' + league + '/' + homeTeam + '.svg',
        url: this.newsURL + '/' + league + '/' + awayTeam + '-' + homeTeam + '-' + date + '/',
      });
      data.push(scoresItem);
    }
    console.log('>> parseScores');
    return data;
  }

  /**
   *
   * Returns the latest news for a given league
   *
   * @param league: shortname of sports league [nba, nhl, nfl, mlb]
   */
  @get('/api/list/news', {
    responses: {
      '200': {
        description: 'Array of News instances',
        contentType: 'application/json',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(News)},
          },
        },
      },
    },
  })
  async findNews(@param.query.string('league') league: string): Promise<News[]> {
    //validate input parameters
    const validateResp = this.validateParams(league, null, null);

    if (validateResp !== '') {
      console.error(validateResp);
      return [];
    }

    //call the news service
    const response = await this.sportsService.getNews(league);
    if (response) {
      console.log('Successfully obtained response');
      //convert response into JSON
      const responseJSON = JSON.parse(convert.xml2json(response, {compact: true, spaces: 4}));
      //parse the relevant details from the object
      return new Promise<News[]>((resolve, reject) => {
        resolve(this.parseNews(responseJSON));
      });
    } else {
      console.log('Error fetching response');
    }
    return [];
  }

  /**
   * build list of news articles, filtering the data to provide a nicely formatted JSON response
   *
   * @param response: object with response from news service
   */
  private parseNews(response: NewsResponse): Array<News> {
    console.log('<< parseNews');

    const data: Array<News> = [];
    const filterLinks = 'www.thestar.com'; //excludes sites for news articles
    //check response from REST call
    if (response.rss) {
      console.log('Successfully obtained news feed.');

      //loop through the articles
      response.rss.channel.item.forEach(function (newsItem: NewsItem) {
        // const item = newsItem || {link: '', title: ''};
        //don't include articles in the excluded list
        if (newsItem.link._text.toLowerCase().indexOf(filterLinks) < 0) {
          //parse the image
          const $ = cheerio.load(newsItem['content:encoded']._cdata);
          const image = $('img').attr('src');
          const article = new News({
            url: newsItem.link._text,
            title: newsItem.title._text,
            urlToImage: image,
            description: newsItem.description._text,
            publishedAt: newsItem.pubDate._text,
          });
          data.push(article);
        } else {
          console.log('Filtering article ' + newsItem.link);
        }
      });
    } else if (response.err) {
      console.log('Error obtaining news feed.' + response.err.toString());
    } else {
      console.log('No articles found with matching criteria');
    }
    console.log('>> parseNews');
    return data;
  }

  /**
   *
   * Returns list of players for a given league and team
   *
   * @param league: shortname of sports league [nba, nhl, nfl, mlb]
   * @param team: shortname of team
   */
  @get('/api/list/players', {
    responses: {
      '200': {
        description: 'Array of Players instances',
        contentType: 'application/json',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Player)},
          },
        },
      },
    },
  })
  async findPlayers(
    @param.query.string('league') league: string,
    @param.query.string('team') team: string,
  ): Promise<Player[]> {
    //validate input parameters
    const validateResp = this.validateParams(league, null, null);

    if (validateResp !== '') {
      console.error(validateResp);
      return [];
    }

    //get list of players for a given league and team
    const response = await this.sportsService.getPlayers(league, team, this.accessToken);
    //get list of teams for a league
    const currentTeams = await this.getTeams(league, team);

    if (response) {
      console.log('Successfully obtained response');
      return new Promise<Player[]>((resolve, reject) => {
        return resolve(this.parsePlayers(response, league, currentTeams));
      });
    } else {
      console.log('Error fetching response');
    }
    return [];
  }

  /**
   * build list of players
   *
   * @param response: object with response from players service
   * @param league: shortname of sports league [nba, nhl, nfl, mlb]
   * @param currentTeams: list of teams for the given league
   */
  private parsePlayers(response: Object[], league: string, currentTeams: Array<Team>): Array<Player> {
    console.log('<< parsePlayers');

    const playerResponse: PlayerResponse[] = response[0] as PlayerResponse[];
    const data: Array<Player> = [];

    if (!playerResponse) {
      return [];
    }

    //iterate over the list of players
    for (const item of playerResponse) {
      let logo = '';
      let team = '';
      // for (const element of currentTeams.teams) {
      for (const element of currentTeams) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore: shortname exists but is flagged incorrectly
        // console.log(JSON.stringify(item.player));
        if (item.player.currentTeam && element.shortname === item.player.currentTeam.abbreviation) {
          team = item.player.currentTeam.abbreviation;
          logo = element.name.toLowerCase().split(' ').join('-');
        }
      }
      //check if social media account exists
      const socialMedia = item.player.socialMediaAccounts[0];
      let twitter = '';
      if (socialMedia) twitter = socialMedia.value;

      //build player object
      const playerItem = new Player({
        playerId: item.player.id,
        name: item.player.firstName + ' ' + item.player.lastName,
        position: item.player.primaryPosition,
        league: league,
        team: team,
        school: item.player.college,
        birthplace: item.player.birthCity + ' ' + item.player.birthCountry,
        picture: item.player.officialImageSrc,
        twitter: twitter,
        logo: this.imagesURL + '/images/' + league + '/' + logo + '.svg',
      });
      data.push(playerItem);
    }
    console.log('>> parsePlayers');
    return data;
  }

  /**
   *
   * Returns list of teams for a given league and team search query
   *
   * @param league: shortname of sports league [nba, nhl, nfl, mlb]
   * @param team: team query parameter
   */
  @get('/api/list/team', {
    responses: {
      '200': {
        description: 'Array of Team instances',
        contentType: 'application/json',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Team)},
          },
        },
      },
    },
  })
  public async getTeams(@param.query.string('league') league: string, @param.query.string('team') team: string) {
    //validate input parameters
    const validateResp = this.validateParams(league, null, null);

    if (validateResp !== '') {
      console.error(validateResp);
      return [];
    }

    //get list of teams
    const response = await this.teamsService.getTeams(league, team);
    if (response) {
      console.log('Successfully obtained response');
      return new Promise<Team[]>((resolve, reject) => {
        return resolve(response);
      });
    } else {
      console.log('Error fetching response from teamsService.getTeams');
    }
    return [];
  }

  /**
   *
   * @param league shortname of sports league [nba, nhl, nfl, mlb]
   * @param season validate season format (yyyy-yyyy-regular or yyyy-yyyy-playoff)
   * @param date validate date format of yyyymmdd
   */
  private validateParams(league: string, season: string, date: string): string {
    let message = '';

    //validate league parameter if it exists
    if (league) {
      const leagueRE = new RegExp('^(mlb|nba|nfl|nhl)$');
      if (!leagueRE.test(league)) {
        message = message + 'Invalid league parameter ' + league + '.';
      }
    }

    //validate season parameter if it exists
    if (season) {
      //|current|latest|upcoming
      const seasonRE = new RegExp('^(20\\d{2})-(20\\d{2}-)?(regular|playoff)$');
      if (!seasonRE.test(season)) {
        message = message + ' Invalid season parameter ' + season + '.';
      }
    }

    //validate date parameter if it exists
    if (date) {
      const dateRE = new RegExp('^(20\\d{2})(\\d{2})(\\d{2})$');
      if (!dateRE.test(date)) {
        message = message + ' Invalid date parameter ' + date + '.';
      }
    }
    //return message with validation messages
    return message;
  }
}
