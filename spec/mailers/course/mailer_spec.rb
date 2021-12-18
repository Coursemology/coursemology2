# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Mailer, type: :mailer do
  subject { mail }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_creator) { course.course_users.first }
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

      def set_user_new_enrol_email_setting(course, setting, regular, phantom)
        email_setting = course.
                        setting_emails.
                        where(component: :users,
                              course_assessment_category_id: nil,
                              setting: setting).first
        email_setting.update!(regular: regular, phantom: phantom)
      end

      it 'sends to the course staff' do
        expect(subject.to).to contain_exactly(*course.managers.map(&:user).map(&:email))
      end

      it 'sets the correct subject' do
        expect(subject.subject).to eq(I18n.t('course.mailer.user_enrol_requested_email.subject'))
      end

      context 'when a user unsubscribes' do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :users,
                                course_assessment_category_id: nil,
                                setting: :new_enrol_request).first
          course_creator.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          expect(subject.to).to be_nil
        end
      end

      context 'when "new enrol request" email setting is disabled for regular staff' do
        before { set_user_new_enrol_email_setting(course, :new_enrol_request, false, true) }

        it 'does not send email notifications to regular staff' do
          expect(subject.to).to be_nil
        end

        it 'sends email notifications to phantom staff' do
          course_creator.update!(phantom: true)
          expect(subject.to).to contain_exactly(*course.managers.map(&:user).map(&:email))
        end
      end

      context 'when "new enrol request" email setting is disabled for phantom staff' do
        before { set_user_new_enrol_email_setting(course, :new_enrol_request, true, false) }

        it 'does not send email notifications to phantom staff' do
          course_creator.update!(phantom: true)
          expect(subject.to).to be_nil
        end

        it 'sends email notifications to regular staff' do
          expect(subject.to).to contain_exactly(*course.managers.map(&:user).map(&:email))
        end
      end

      context 'when "new enrol request" email setting is disabled' do
        before { set_user_new_enrol_email_setting(course, :new_enrol_request, false, false) }

        it 'does not send email notifications' do
          expect(subject.to).to be_nil
        end
      end
    end
  end
end
