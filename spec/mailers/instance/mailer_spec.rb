# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Instance::Mailer, type: :mailer do
  subject { mail }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:text) { mail.body.parts.find { |part| part.content_type.start_with?('text/plain') }.to_s }
    let(:html) { mail.body.parts.find { |part| part.content_type.start_with?('text/html') }.to_s }

    describe '#user_invitation_email' do
      let(:invitation) { create(:instance_user_invitation, instance: instance) }
      let(:mail) { Instance::Mailer.user_invitation_email(invitation) }

      it 'sends to the correct person' do
        expect(subject.to).to contain_exactly(invitation.email)
      end

      it 'sets the correct subject' do
        expect(subject.subject).to eq(I18n.t('instance.mailer.user_invitation_email.subject'))
      end
    end

    describe '#user_added_email' do
      let(:instance_user) { create(:instance_user, instance: instance) }
      let(:mail) { Instance::Mailer.user_added_email(instance_user) }

      it 'sends to the correct person' do
        expect(subject.to).to contain_exactly(instance_user.user.email)
      end

      it 'sets the correct subject' do
        expect(subject.subject).to eq(I18n.t('instance.mailer.user_added_email.subject'))
      end
    end
  end
end
