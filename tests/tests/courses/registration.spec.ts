import {
  test,
  expect,
  manufacture,
  getLastSentEmail,
  clearEmails,
} from 'helpers';

test.describe('with an unconfirmed invitation', () => {
  let course: { id: number };
  let invitation;

  test.beforeEach(async () => {
    course = await manufacture({ course: { traits: ['published']} });
    invitation = await manufacture({
      course_user_invitation: { course_id: course.id },
    });
  });

  test('can register with invitation code', async ({ authedPage: page }) => {
    await page.goto(`/courses/${course.id}`);

    await expect(page.getByText(invitation.name)).not.toBeVisible();

    const registerButton = page.getByRole('button', { name: 'Register' });
    await registerButton.click();

    await expect(page.getByText('enter an invitation code')).toBeVisible();

    const invitationCodeField = page.getByLabel('Invitation code');
    await invitationCodeField.fill('definitelyTheWrongCode');
    await registerButton.click();

    await expect(page.getByText('code is incorrect')).toBeVisible();

    await invitationCodeField.fill(invitation.invitation_key);
    await registerButton.click();

    await expect(page.getByText(invitation.name)).toBeVisible();
  });
});

test.describe('allows enrol requests', () => {
  let course: { id: number };

  test.beforeEach(async () => {
    course = await manufacture({ course: { traits: ['published', 'enrollable'] } });

    await clearEmails();
  });

  test('can request', async ({ authedPage: page }) => {
    await page.goto(`/courses/${course.id}`);

    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText('Instructors', { exact: true })).toBeVisible();

    page.getByRole('button', { name: 'Request to enrol' }).click();

    await expect(
      page.getByText('enrol request has been submitted'),
    ).toBeVisible();

    const notificationEmail = await getLastSentEmail();
    expect(notificationEmail?.subject).toContain('Enrol Request');

    page.getByRole('button', { name: 'Cancel request' }).click();

    await expect(
      page.getByText('enrol request has been cancelled'),
    ).toBeVisible();
  });

  test('cannot request if already enrolled', async ({ authedPage: page }) => {
    const student = await manufacture({
      course_student: { course_id: course.id, user_id: page.user.id },
    });

    await page.goto(`/courses/${course.id}`);

    await expect(page.getByText(student.name)).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Request to enrol' }),
    ).not.toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Cancel request' }),
    ).not.toBeVisible();
  });
});
