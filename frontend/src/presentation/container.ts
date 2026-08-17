import { RestoreSession } from '@/application/auth/useCases/RestoreSession';
import { SignIn } from '@/application/auth/useCases/SignIn';
import { SignOut } from '@/application/auth/useCases/SignOut';
import {
  CreateCompany,
  DeleteCompany,
  ListCompanies,
  UpdateCompany,
} from '@/application/company/useCases/ManageCompanies';
import {
  CreateDiary,
  FindWorkshopDiary,
  UpdateDiary,
} from '@/application/diary/useCases/ManageDiaries';
import { GetMoodSummary } from '@/application/mood/useCases/GetMoodSummary';
import { FindSector, ListSectors } from '@/application/sector/useCases/ManageSectors';
import {
  CreateUser,
  DeleteUser,
  ListUsers,
  UpdateUser,
} from '@/application/user/useCases/ManageUsers';
import {
  CreateWorkshop,
  DeleteWorkshop,
  FindWorkshop,
  ListWorkshopAssessments,
  ListWorkshopCheckIns,
  ListWorkshops,
  UpdateWorkshop,
} from '@/application/workshop/useCases/ManageWorkshops';
import {
  FindPublicWorkshop,
  RegisterAssessment,
  RegisterCheckIn,
} from '@/application/workshop/useCases/PublicWorkshopAccess';
import { HttpAuthRepository } from '@/infrastructure/auth/HttpAuthRepository';
import { HttpCompanyRepository } from '@/infrastructure/company/HttpCompanyRepository';
import { HttpDiaryRepository } from '@/infrastructure/diary/HttpDiaryRepository';
import { AxiosHttpClient } from '@/infrastructure/http/AxiosHttpClient';
import { createApiClient } from '@/infrastructure/http/createApiClient';
import { HttpMoodRepository } from '@/infrastructure/mood/HttpMoodRepository';
import { HttpSectorRepository } from '@/infrastructure/sector/HttpSectorRepository';
import { BrowserSessionStorage } from '@/infrastructure/storage/BrowserSessionStorage';
import { HttpUserRepository } from '@/infrastructure/user/HttpUserRepository';
import { HttpPublicWorkshopRepository } from '@/infrastructure/workshop/HttpPublicWorkshopRepository';
import { HttpWorkshopRepository } from '@/infrastructure/workshop/HttpWorkshopRepository';

const sessions = new BrowserSessionStorage();

const apiClient = createApiClient({
  sessions,
  onSessionExpired: () => {
    window.dispatchEvent(new CustomEvent('mentis:session-expired'));
  },
});

const http = new AxiosHttpClient(apiClient);

const authRepository = new HttpAuthRepository(http);
const userRepository = new HttpUserRepository(http);
const companyRepository = new HttpCompanyRepository(http);
const workshopRepository = new HttpWorkshopRepository(http);
const publicWorkshopRepository = new HttpPublicWorkshopRepository(http);
const diaryRepository = new HttpDiaryRepository(http);
const sectorRepository = new HttpSectorRepository(http);
const moodRepository = new HttpMoodRepository(http);

export const container = {
  sessions,
  auth: {
    signIn: new SignIn(authRepository, sessions),
    signOut: new SignOut(authRepository, sessions),
    restoreSession: new RestoreSession(authRepository, sessions),
  },
  users: {
    list: new ListUsers(userRepository),
    create: new CreateUser(userRepository),
    update: new UpdateUser(userRepository),
    remove: new DeleteUser(userRepository),
  },
  workshops: {
    list: new ListWorkshops(workshopRepository),
    find: new FindWorkshop(workshopRepository),
    create: new CreateWorkshop(workshopRepository),
    update: new UpdateWorkshop(workshopRepository),
    remove: new DeleteWorkshop(workshopRepository),
    checkIns: new ListWorkshopCheckIns(workshopRepository),
    assessments: new ListWorkshopAssessments(workshopRepository),
  },
  publicWorkshops: {
    findByToken: new FindPublicWorkshop(publicWorkshopRepository),
    checkIn: new RegisterCheckIn(publicWorkshopRepository),
    assess: new RegisterAssessment(publicWorkshopRepository),
  },
  diaries: {
    findByWorkshop: new FindWorkshopDiary(diaryRepository),
    create: new CreateDiary(diaryRepository),
    update: new UpdateDiary(diaryRepository),
  },
  companies: {
    list: new ListCompanies(companyRepository),
    create: new CreateCompany(companyRepository),
    update: new UpdateCompany(companyRepository),
    remove: new DeleteCompany(companyRepository),
  },
  sectors: {
    list: new ListSectors(sectorRepository),
    find: new FindSector(sectorRepository),
  },
  moods: {
    summary: new GetMoodSummary(moodRepository),
  },
} as const;

export type Container = typeof container;
