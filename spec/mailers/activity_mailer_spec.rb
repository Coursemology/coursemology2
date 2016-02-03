# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ActivityMailer, type: :mailer do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:template) { 'activity_mailer/test_email' }
    let(:user) { create(:user, name: 'tester') }
    let(:activity) { create(:activity, object: user) }
    let(:notification) { create(:user_notification, activity: activity) }
    let(:mail) { ActivityMailer.email(user, notification, template) }
    let(:text) { mail.body.parts.find { |part| part.content_type.start_with?('text/plain') }.to_s }
    let(:html) { mail.body.parts.find { |part| part.content_type.start_with?('text/html') }.to_s }

    it 'sets the correct headers' do
      expect(mail.subject).to eq('test mailer')
      expect(mail.to).to include(user.email)
    end

    it 'renders the layout' do
      expect(text).to include(I18n.t('layouts.mailer.greeting', user: user.name))
      expect(text).to include(I18n.t('layouts.mailer.complimentary_close'))
      expect(text).to include(I18n.t('layouts.mailer.sign_off'))

      expect(html).to include(I18n.t('layouts.mailer.greeting', user: user.name))
      expect(html).to include(I18n.t('layouts.mailer.complimentary_close'))
      expect(html).to include(I18n.t('layouts.mailer.sign_off'))
    end

    it 'sends a multipart email' do
      expect(html).to include('HTML test')
      expect(text).to include('Plain text test')
    end

    it 'provides views with the given object' do
      expect(html).to include(user.email)
      expect(text).to include(user.email)
    end
  end
end
