require 'rails_helper'

RSpec.describe NotificationMailer, type: :mailer do
  describe 'notification email' do
    TEST_CONTENT = '<h3> This is a test</h3>'
    TEST_URL = '../../spec/fixtures/notification_mailer/test_email.html.slim'

    let(:user) { create(:user, name: 'tester') }
    let(:mail) do
      NotificationMailer.notification_email(user, title: 'test mailer',
                                                  content: TEST_CONTENT,
                                                  html_link: TEST_URL,
                                                  user_defined_option: 'option')
    end

    it 'renders the headers' do
      expect(mail.subject).to eq('test mailer')
      expect(mail.to).to eq([user.email])
      expect(mail.from).to eq(['noreply@coursemology.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to match(TEST_CONTENT)
    end

    it 'renders user-input html link' do
      expect(mail.body.encoded).to match('Render Test')
    end

    it 'uses user-input options in user-input html link' do
      expect(mail.body.encoded).to match('option')
    end
  end
end
