import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { gql, GraphQLClient } from 'graphql-request';
import { User } from './interfaces/user.interface';
import { GetContributorInfoQuery } from './types/queries';

@Injectable()
export class GithubApi {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Gets contributor info from github.
   */
  async getContributorInfo(contributorUsername: string): Promise<User> {
    const ACCESS_TOKEN = this.configService.get('github.access_token');

    const graphQLClient = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    const query = gql`
      {
        user(login: "${contributorUsername}") {
          avatarUrl
          login
          name
        }
      }
    `;
    const result: GetContributorInfoQuery = await graphQLClient.request(query);

    return {
      username: result.user.login,
      name: result.user.name,
      avatarUrl: result.user.avatarUrl,
    };
  }
}