# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User::Email, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:emails) }

  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:email) { build(:user_email) }
    it 'rejects invalid email addresses' do
      email.email = 'wrong'
      expect(email.valid?).to eq(false)
    end

    context 'when a user has multiple emails' do
      let(:user) { create(:user) }
      let(:primary_email) { user.emails.first }

      context 'when unset a primary email' do
        subject { primary_email }
        before { primary_email.primary = false }

        it { is_expected.to be_valid }
      end
    end

    context 'when email has already been taken' do
      let(:existing_email) { create(:user_email).email }
      subject { build(:user_email, email: existing_email) }

      it 'is not valid' do
        expect(subject).not_to be_valid
        expect(subject.errors[:email].count).to eq(1)
      end
    end

    context 'when the email is not confirmed' do
      subject { create(:user_email, :unconfirmed) }

      with_active_job_queue_adapter(:test) do
        it 'sends email with ActiveJob queue' do
          expect { subject }.to have_enqueued_job.on_queue('highest')
        end
      end
    end

    describe '#accept_all_pending_invitations' do
      let(:email_address) { generate(:email) }

      # Confirms a new user's email on the given instance, triggering invitation resolution.
      def sign_up_on(sign_up_instance)
        ActsAsTenant.with_tenant(sign_up_instance) do
          create(:user_email, email: email_address)
        end
      end

      context 'when the invitation is on the same tenant as the sign-up' do
        let!(:course) { create(:course) }
        let!(:pending_invitation) do
          create(:course_user_invitation, course: course, email: email_address)
        end

        it 'confirms the invitation' do
          sign_up_on(instance)
          expect(pending_invitation.reload).to be_confirmed
        end

        it 'creates a CourseUser for the invited course' do
          email_record = sign_up_on(instance)
          expect(email_record.user.course_users.map(&:course_id)).to include(course.id)
        end
      end

      context 'when the invitation is on a different tenant than the sign-up' do
        let(:other_instance) { create(:instance) }
        let!(:course) do
          ActsAsTenant.with_tenant(other_instance) { create(:course) }
        end
        let!(:pending_invitation) do
          ActsAsTenant.with_tenant(other_instance) do
            create(:course_user_invitation, course: course, email: email_address)
          end
        end

        it 'confirms the invitation' do
          sign_up_on(instance)
          expect(pending_invitation.reload).to be_confirmed
        end

        it 'creates a CourseUser for the invited course' do
          email_record = sign_up_on(instance)
          ActsAsTenant.without_tenant do
            expect(CourseUser.exists?(user: email_record.user, course: course)).to be true
          end
        end
      end

      context 'when there are pending invitations across multiple tenants' do
        let(:other_instance) { create(:instance) }
        let(:third_instance) { create(:instance) }

        let!(:course_on_instance) { create(:course) }
        let!(:course_on_other_instance) do
          ActsAsTenant.with_tenant(other_instance) { create(:course) }
        end

        let!(:invitation_on_instance) do
          create(:course_user_invitation, course: course_on_instance, email: email_address)
        end
        let!(:invitation_on_other_instance) do
          ActsAsTenant.with_tenant(other_instance) do
            create(:course_user_invitation, course: course_on_other_instance, email: email_address)
          end
        end

        it 'confirms all invitations regardless of tenant' do
          sign_up_on(third_instance)
          expect(invitation_on_instance.reload).to be_confirmed
          expect(invitation_on_other_instance.reload).to be_confirmed
        end

        it 'creates CourseUsers for all invited courses' do
          email_record = sign_up_on(third_instance)
          ActsAsTenant.without_tenant do
            enrolled_course_ids = email_record.user.course_users.map(&:course_id)
            expect(enrolled_course_ids).to include(course_on_instance.id, course_on_other_instance.id)
          end
        end
      end

      context 'when the user is already enrolled in the invited course' do
        let(:course) { create(:course) }
        let(:user) { create(:user) }
        let!(:course_user) { create(:course_user, course: course, user: user) }
        let!(:pending_invitation) do
          create(:course_user_invitation, course: course, email: email_address)
        end

        it 'confirms the invitation without creating a duplicate CourseUser' do
          email_record = create(:user_email, user: user, email: email_address, primary: false)
          expect(pending_invitation.reload).to be_confirmed
          expect(email_record.user.course_users.where(course: course).count).to eq(1)
        end
      end
    end
  end
end
