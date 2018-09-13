# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Mailer, type: :mailer do
  subject { mail }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:text) { mail.body.parts.find { |part| part.content_type.start_with?('text/plain') }.to_s }
    let(:html) { mail.body.parts.find { |part| part.content_type.start_with?('text/html') }.to_s }

    describe '#user_invitation_email' do
      let(:invitation) { create(:course_user_invitation, course: course) }
      let(:mail) { Course::Mailer.user_invitation_email(invitation) }

      it 'sends to the correct person' do
        expect(subject.to).to contain_exactly(invitation.email)
      end

      it 'sets the correct subject' do
        expect(subject.subject).to eq(I18n.t('course.mailer.user_invitation_email.subject'))
      end

      it 'provides the invitation key' do
        expect(text).to include(invitation.invitation_key)
        expect(html).to include(invitation.invitation_key)
      end
    end

    describe '#user_added_email' do
      let(:course_user) { create(:course_user, course: course) }
      let(:mail) { Course::Mailer.user_added_email(course_user) }

      it 'sends to the correct person' do
        expect(subject.to).to contain_exactly(course_user.user.email)
      end

      it 'sets the correct subject' do
        expect(subject.subject).to eq(I18n.t('course.mailer.user_added_email.subject'))
      end
    end

    describe '#user_enrol_requested_email' do
      let(:enrol_request) { create(:course_enrol_request, course: course) }
      let(:mail) { Course::Mailer.user_enrol_requested_email(enrol_request) }

      it 'sends to the course staff' do
        expect(subject.to).to contain_exactly(*course.managers.map(&:user).map(&:email))
      end

      it 'sets the correct subject' do
        expect(subject.subject).to eq(I18n.t('course.mailer.user_enrol_requested_email.subject'))
      end

      context 'when email notification for new enrol request is disabled' do
        before do
          context = OpenStruct.new(key: Course::UsersComponent.key, current_course: course)
          Course::Settings::UsersComponent.new(context).
            update_email_setting('key' => 'new_enrol_request', 'enabled' => false)
          course.save!
        end

        it 'does not send an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end
    end
  end
end
