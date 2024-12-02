import { expect, getLastSentEmail, manufacture, test } from 'helpers';

const getHrefURLFromString = (string: string): string | undefined =>
  string.match(/href="(.*(?="))/)?.[1];

test.describe('unregistered user', () => {
  test('can sign up', async ({ signUpPage: page }) => {
    const { name, email, password } = page.getFieldMocks();

    await page.gotoSignUpPage();

    await page.getNameField().fill(name);
    await page.getEmailField().fill(email);
    await page.getPasswordField().fill(password);
    await page.getConfirmPasswordField().fill(password);
    await page.getReCAPTCHA().click();
    await page.getSignUpButton().click();

    await expect.soft(page.getByText(email)).toBeVisible();
    await expect(page.getByText('check your email')).toBeVisible();

    const confirmationEmail = await getLastSentEmail();
    expect(confirmationEmail).not.toBeNull();

    expect.soft(confirmationEmail!.recipient).toEqual(email);
    expect(confirmationEmail!.body).toContain('confirmation_token');

    const confirmationURL = getHrefURLFromString(confirmationEmail!.body);
    expect(confirmationURL).toBeTruthy();

    await page.goto(confirmationURL!);

    await expect.soft(page.getByText(email)).toBeVisible();
    await expect(page.getByText('confirmed')).toBeVisible();
  });
});

test.describe('user invited to a course', () => {
  test('can sign up with invitation', async ({ signUpPage: page }) => {
    const { password } = page.getFieldMocks();

    const course = await manufacture({ course: {} });
    const invitation = await manufacture({
      course_user_invitation: { course_id: course.id, traits: ['phantom'] },
    });

    await page.gotoInvitation(invitation.invitation_key);

    await expect(page.getNameField()).toHaveValue(invitation.name);
    await expect(page.getEmailField()).toHaveValue(invitation.email);

    await page.getPasswordField().fill(password);
    await page.getConfirmPasswordField().fill(password);
    await page.getReCAPTCHA().click();

    await page.getSignUpButton().click();

    await page.signIn(invitation.email, password, true);

    await expect(page).toHaveURL(new RegExp(course.id));
  });

  test('cannot sign up with used invitation', async ({ signUpPage: page }) => {
    const invitation = await manufacture({
      course_user_invitation: { traits: ['confirmed'] },
    });

    await page.gotoInvitation(invitation.invitation_key);

    await expect(page.getByText('has been claimed').count()).toBeTruthy();
    await expect(page.getNameField()).toBeEmpty();
    await expect(page.getEmailField()).toBeEmpty();
  });
});

test.describe('user invited to 2 courses', () => {
  test('can sign up with first invitation', async ({ signUpPage: page }) => {
    const { password } = page.getFieldMocks();

    const course1 = await manufacture({ course: {} });
    const invitation1 = await manufacture({
      course_user_invitation: { course_id: course1.id },
    });

    const course2 = await manufacture({ course: {} });
    const invitation2 = await manufacture({
      course_user_invitation: {
        email: invitation1.email,
        course_id: course2.id,
      },
    });

    await page.gotoInvitation(invitation1.invitation_key);

    await page.getPasswordField().fill(password);
    await page.getConfirmPasswordField().fill(password);
    await page.getReCAPTCHA().click();
    await page.getSignUpButton().click();

    await page.signIn(invitation1.email, password, true);

    await page.goto(`/courses/${course1.id}`);
    await expect(page).toHaveURL(new RegExp(course1.id));
    await expect(page.getByText(invitation1.name)).toBeVisible();

    await page.goto(`/courses/${course2.id}`);
    await expect(page).toHaveURL(new RegExp(course2.id));
    await expect(page.getByText(invitation2.name)).toBeVisible();
  });

  test('can sign up without invitation', async ({ signUpPage: page }) => {
    const { name, email, password } = page.getFieldMocks();

    const course = await manufacture({ course: {} });
    const invitation = await manufacture({
      course_user_invitation: { email, course_id: course.id },
    });

    await page.gotoSignUpPage();

    await page.getNameField().fill(name);
    await page.getEmailField().fill(email);
    await page.getPasswordField().fill(password);
    await page.getConfirmPasswordField().fill(password);
    await page.getReCAPTCHA().click();
    await page.getSignUpButton().click();

    await expect.soft(page.getByText(email)).toBeVisible();
    await expect(page.getByText('check your email')).toBeVisible();

    const confirmationEmail = await getLastSentEmail();
    expect(confirmationEmail).not.toBeNull();

    expect.soft(confirmationEmail!.recipient).toEqual(email);
    expect(confirmationEmail!.body).toContain('confirmation_token');

    const confirmationURL = getHrefURLFromString(confirmationEmail!.body);
    expect(confirmationURL).toBeTruthy();

    await page.goto(confirmationURL!);

    await expect.soft(page.getByText(email)).toBeVisible();
    await expect(page.getByText('confirmed')).toBeVisible();

    await page.signIn(email, password);

    await page.goto(`/courses/${course.id}`);
    await expect(page).toHaveURL(new RegExp(course.id));
    await expect(page.getByText(invitation.name)).toBeVisible();
  });
});
