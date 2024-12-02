import {
  APIRequestContext,
  Locator,
  Page as BasePage,
  test as base,
  expect,
} from '@playwright/test';

import packageJSON from './package.json';
import { configureCoverage } from './coverage';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

interface Page extends BasePage {
  getReCAPTCHA: () => Locator;
  getUserMenuButton: () => Locator;
  signIn: (
    email: string,
    password: string,
    isPageRendered?: boolean
  ) => Promise<void>;
}

interface SignInPage extends Page {
  originalPage: Page;
  getEmailField: () => Locator;
  getPasswordField: () => Locator;
  getSignInButton: () => Locator;
  manufactureUser: () => Promise<User>;
}

interface SignUpPage extends Page {
  getNameField: () => Locator;
  getEmailField: () => Locator;
  getPasswordField: () => Locator;
  getConfirmPasswordField: () => Locator;
  getSignUpButton: () => Locator;
  gotoSignUpPage: () => ReturnType<Page['goto']>;
  gotoInvitation: (token: string) => ReturnType<Page['goto']>;
  getFieldMocks: () => Pick<User, 'name' | 'email' | 'password'>;
}

interface AuthenticatedPage extends Page {
  user: User;
  signOut: () => Promise<void>;
}

interface TestFixtures {
  page: Page;
  signInPage: SignInPage;
  signUpPage: SignUpPage;
  authedPage: AuthenticatedPage;
}

let apiContext: APIRequestContext;

const getEmail = (index: number) => `${Date.now()}+${index}@example.org`;

const extend = <T extends Page>(
  use: (r: T) => Promise<void>,
  page: Page,
  extension: Omit<T, keyof Page>
) => use(Object.assign(page, extension) as T);

export const test = base.extend<TestFixtures>({
  context: async ({ context }, use) => {
    await configureCoverage(context, use);
  },
  page: async ({ page }, use) => {
    await extend(use, page, {
      getReCAPTCHA: () =>
        page.frameLocator('[title="reCAPTCHA"]').getByLabel("I'm not a robot"),
      getUserMenuButton: () => page.getByTestId('user-menu-button'),
      signIn: async (
        email: string,
        password: string,
        isPageRendered: boolean = false
      ) => {
        if (!isPageRendered) await page.goto('/users/sign_in');
        await page.getByPlaceholder('Email').fill(email);
        await page.getByPlaceholder('Password').fill(password);
        await page.getByRole('button', { name: 'Sign in' }).click();
        try {
          await page.waitForURL(/\?from=auth/, { timeout: 1000 });
          await page.waitForURL(/^(?!.*\?from=auth)/);
        } catch {}
      },
    } satisfies Omit<Page, keyof BasePage>);
  },
  signInPage: async ({ page }, use, testInfo) => {
    await page.goto('/users/sign_in');

    await extend(use, page, {
      originalPage: page,
      getEmailField: () => page.getByPlaceholder('Email'),
      getPasswordField: () => page.getByPlaceholder('Password'),
      getSignInButton: () => page.getByRole('button', { name: 'Sign In' }),
      manufactureUser: async () => {
        const email = getEmail(testInfo.workerIndex);
        const password = 'lolololol';

        const { id, name, role } = await manufacture({
          user: { emails_count: 0, email, password },
        });

        return { email, password, id, name, role };
      },
    });
  },
  signUpPage: async ({ page }, use, testInfo) => {
    await extend(use, page, {
      getNameField: () => page.getByLabel('Name'),
      getEmailField: () => page.getByLabel('Email address'),
      getPasswordField: () => page.getByLabel('Password *', { exact: true }),
      getConfirmPasswordField: () => page.getByLabel('Confirm password'),
      getSignUpButton: () => page.getByRole('button', { name: 'Sign up' }),
      gotoSignUpPage: () => page.goto('/users/sign_up'),
      gotoInvitation: (token: string) =>
        page.goto(`/users/sign_up?invitation=${token}`),
      getFieldMocks: () => ({
        name: 'John Doe',
        email: getEmail(testInfo.workerIndex),
        password: 'lolololol',
      }),
    });
  },
  authedPage: async ({ signInPage: page }, use) => {
    const user = await page.manufactureUser();

    await page.getEmailField().fill(user.email);
    await page.getPasswordField().fill(user.password);
    await page.getSignInButton().click();
    await page.waitForURL('/?from=auth');

    await extend(use, page.originalPage, {
      user,
      signOut: async () => {
        await page.getUserMenuButton().click();
        await page.getByRole('button', { name: 'Sign out' }).click();
        await page.getByRole('button', { name: 'Logout' }).click();
      },
    });
  },
});

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: packageJSON.servers.serverURL,
  });
});

test.afterAll(async () => {
  apiContext.dispose();
});

type FactoryPayload = Record<
  string,
  Record<string, unknown> & { traits?: string[] }
>;

export const manufacture = async (payload: FactoryPayload) => {
  const response = await apiContext.post('/test/create', {
    data: { factory: payload },
  });

  return await response.json();
};

interface EmailPayload {
  sender: string;
  recipient: string;
  subject: string;
  body: string;
}

export const getLastSentEmail = async (): Promise<EmailPayload | null> => {
  const response = await apiContext.get('/test/last_sent_email');
  const payload = await response.json();
  if (!payload) return null;

  return {
    sender: payload.header[1].unparsed_value,
    recipient: payload.header[2].unparsed_value,
    subject: payload.header[4].unparsed_value,
    body: payload.body.raw_source,
  };
};

export const clearEmails = () => apiContext.delete('/test/clear_emails');

export { expect } from '@playwright/test';
