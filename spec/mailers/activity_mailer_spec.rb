require 'rails_helper'

RSpec.describe ActivityMailer, type: :mailer do
  describe 'Activity email' do
    TEMPLATE_PATH = '../../spec/fixtures/activity_mailer/test_email'
    let(:user) { create(:user, name: 'tester') }
    let(:mail) { ActivityMailer.email(user, user, TEMPLATE_PATH) }
    let(:body) { mail.body.encoded }

    it 'renders the headers' do
      expect(mail.subject).to eq('test mailer')
      expect(mail.to).to eq([user.email])
    end

    it 'renders the template' do
      expect(body).to match('Html test')
      expect(body).to match('Plain text test')
    end

    it 'uses input object in template' do
      expect(body).to match(user.email)
    end

    it 'shows layout content' do
      expect(body).to match(I18n.t('layouts.email.greeting', user: user.name))
      expect(body).to match(I18n.t('layouts.email.complimentary_close'))
      expect(body).to match(I18n.t('layouts.email.sign_off'))
    end
  end
end
