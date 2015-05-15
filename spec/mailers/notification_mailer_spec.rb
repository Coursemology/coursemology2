require 'rails_helper'

RSpec.describe NotificationMailer, type: :mailer do
  describe 'Notification email' do
    TEMPLATE_URL = '../../spec/fixtures/notification_mailer/test_email.html.slim'
    let(:user) { create(:user, name: 'tester') }
    let(:mail) do
      NotificationMailer.notify(user, nil, user, TEMPLATE_URL)
    end
    it 'renders the headers' do
      expect(mail.subject).to eq('test mailer')
      expect(mail.to).to eq([user.email])
    end

    it 'renders the template' do
      expect(mail.body.encoded).to match('This is a test')
    end

    it 'uses input object in template' do
      expect(mail.body.encoded).to match(user.email)
    end

    it 'shows layout content' do
      expect(mail.body.encoded).to match(I18n.t('notification_mailer.notification.greeting',
                                                user: user.name))
      expect(mail.body.encoded).
        to match(I18n.t('notification_mailer.notification.complimentary_close'))
      expect(mail.body.encoded).to match(I18n.t('notification_mailer.notification.sign_off'))
    end
  end
end
