import { expect, test } from 'helpers';

import { createAccount, openAsAdmin } from './support/accounts';

test('the administrator creates an instructor and a student', async ({ browser }, testInfo) => {
  const admin = await openAsAdmin(browser);

  const instructor = await test.step('invite and sign up an instructor', () =>
    createAccount(browser, admin.page, 'instructor', 'instructor'),
  );
  const student = await test.step('invite and sign up a student', () =>
    createAccount(browser, admin.page, 'student', 'normal'),
  );

  await testInfo.attach('accounts.json', {
    body: JSON.stringify({ instructor: instructor.account, student: student.account }, null, 2),
    contentType: 'application/json',
  });

  await test.step('the instructor can create courses', async () => {
    await instructor.page.goto('/courses');
    await expect(instructor.page.getByRole('button', { name: 'New Course' })).toBeVisible();
  });

  await Promise.all([admin.context, instructor.context, student.context].map((c) => c.close()));
});
