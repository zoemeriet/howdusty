import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CommandTestFactory } from 'nest-commander-testing';
import configuration from '@/config/configuration';
import { GithubApiMock, GithubApi, GithubService } from '@/github';
import {
  Contributor,
  ContributorsService,
  ContributorsRepositoryMock,
} from '@/contributors';
import { OnlydustApi, OnlydustApiMock, OnlydustService } from '@/onlydust';
import { SynchronizationService } from '@/synchronization';
import { OnlydustImportCommand } from './onlydust-import.command';
import { MetricsService } from '@/metrics';

describe('OnlydustImportCommand', () => {
  let command: OnlydustImportCommand;
  let onlydustApi: OnlydustApiMock;

  const CONTRIBUTOR_REPOSITORY_TOKEN = getRepositoryToken(Contributor);

  beforeEach(async () => {
    const module: TestingModule = await CommandTestFactory.createTestingCommand(
      {
        imports: [
          ConfigModule.forRoot({
            load: [configuration],
          }),
        ],
        providers: [
          OnlydustImportCommand,
          ContributorsService,
          {
            provide: CONTRIBUTOR_REPOSITORY_TOKEN,
            useClass: ContributorsRepositoryMock,
          },
          MetricsService,
          GithubService,
          {
            provide: GithubApi,
            useClass: GithubApiMock,
          },
          OnlydustService,
          {
            provide: OnlydustApi,
            useClass: OnlydustApiMock,
          },
          SynchronizationService,
        ],
      },
    ).compile();

    command = module.get(OnlydustImportCommand);
    onlydustApi = module.get<OnlydustApiMock>(OnlydustApi);
  });

  it('should get onlydust users and synchronizes them', async () => {
    const logSpy = jest.spyOn(global.console, 'log');
    await command.run();
    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      `synchronizing ${onlydustApi.users[0].login}, 1/${onlydustApi.users.length}`,
    );
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      `synchronizing ${onlydustApi.users[1].login}, 2/${onlydustApi.users.length}`,
    );
    expect(logSpy).toHaveBeenNthCalledWith(
      3,
      `synchronizing ${onlydustApi.users[2].login}, 3/${onlydustApi.users.length}`,
    );
    logSpy.mockRestore();
  });
});
