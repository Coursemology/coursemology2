# frozen_string_literal: true
require 'rails_helper'

RSpec.describe DeviseMailer, type: :mailer do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }

    describe '#confirmation_instructions' do
      context 'when a tenant host is provided' do
        let(:tenant_instance) { create(:instance) }
        let(:mail) { DeviseMailer.confirmation_instructions(user, 'token', host: tenant_instance.host) }

        it 'uses the tenant host in the confirmation URL' do
          expect(mail.body.encoded).to include(tenant_instance.host)
        end
      end

      context 'when no host is provided' do
        let(:mail) { DeviseMailer.confirmation_instructions(user, 'token') }

        it 'falls back to the default URL options host' do
          expect(mail.body.encoded).to include(ActionMailer::Base.default_url_options[:host])
        end
      end
    end

    describe '#reset_password_instructions' do
      context 'when a tenant host is provided' do
        let(:tenant_instance) { create(:instance) }
        let(:mail) { DeviseMailer.reset_password_instructions(user, 'token', host: tenant_instance.host) }

        it 'uses the tenant host in the reset password URL' do
          expect(mail.body.encoded).to include(tenant_instance.host)
        end
      end

      context 'when no host is provided' do
        let(:mail) { DeviseMailer.reset_password_instructions(user, 'token') }

        it 'falls back to the default URL options host' do
          expect(mail.body.encoded).to include(ActionMailer::Base.default_url_options[:host])
        end
      end
    end
  end
end
