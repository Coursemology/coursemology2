require 'rails_helper'

RSpec.describe Course::Mailer, type: :mailer do
  subject { mail }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:text) { mail.body.parts.find { |part| part.content_type.start_with?('text/plain') }.to_s }
    let(:html) { mail.body.parts.find { |part| part.content_type.start_with?('text/html') }.to_s }

    describe '#user_invitation_email' do
      let(:invitation) { create(:course_user_invitation, course: course) }
      let(:mail) { Course::Mailer.user_invitation_email(course, invitation) }

      it 'sends to the correct person' do
        expect(subject.to).to contain_exactly(invitation.user_email.email)
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
      let(:mail) { Course::Mailer.user_added_email(course, course_user) }

      it 'sends to the correct person' do
        expect(subject.to).to contain_exactly(course_user.user.email)
      end

      it 'sets the correct subject' do
        expect(subject.subject).to eq(I18n.t('course.mailer.user_added_email.subject'))
      end
    end
  end
end
