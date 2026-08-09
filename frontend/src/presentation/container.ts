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
  CreateUser,
  DeleteUser,
  ListUsers,
  UpdateUser,
} from '@/application/user/useCases/ManageUsers';
import {
  FindWorkshop,
  ListWorkshopAssessments,
  ListWorkshopCheckIns,
  ListWorkshops,
} from '@/application/workshop/useCases/ManageWorkshops';
import { HttpAuthRepository } from '@/infrastructure/auth/HttpAuthRepository';
import { HttpCompanyRepository } from '@/infrastructure/company/HttpCompanyRepository';
import { AxiosHttpClient } from '@/infrastructure/http/AxiosHttpClient';
import { createApiClient } from '@/infrastructure/http/createApiClient';
import { BrowserSessionStorage } from '@/infrastructure/storage/BrowserSessionStorage';
import { HttpUserRepository } from '@/infrastructure/user/HttpUserRepository';
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
    checkIns: new ListWorkshopCheckIns(workshopRepository),
    assessments: new ListWorkshopAssessments(workshopRepository),
  },
  companies: {
    list: new ListCompanies(companyRepository),
    create: new CreateCompany(companyRepository),
    update: new UpdateCompany(companyRepository),
    remove: new DeleteCompany(companyRepository),
  },
} as const;

export type Container = typeof container;
