require 'rails_helper'

RSpec.describe ActivityMailer, type: :mailer do
  let(:template_path) { '../../spec/fixtures/activity_mailer/test_email' }
  let(:user) { create(:user, name: 'tester') }
  let(:mail) { ActivityMailer.email(user, user, template_path) }
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
