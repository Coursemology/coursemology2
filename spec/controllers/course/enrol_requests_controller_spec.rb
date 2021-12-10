# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::EnrolRequestsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, :enrollable) }
    let(:admin) { course.course_users.first.user }

    before { sign_in(user) }

    describe '#create' do
      subject { post :create, params: { course_id: course } }

      context 'when a user creates a new enrolment request' do
        it 'redirects and sets the proper success flash message' do
          subject
          is_expected.to redirect_to(course_path(course))
          expect(flash[:success]).to eq(I18n.t('course.enrol_requests.create.success'))
        end

        it 'sends an email notification to course owner', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)

          expect(ActionMailer::Base.deliveries.count).to eq(1)
          expect(emails).to include(admin.email)
          expect(email_subjects).to include('course.mailer.user_enrol_requested_email.subject')
        end

        context 'when there is an existing pending request' do
          before do
            create(:course_enrol_request, :pending, course: course, user: user)
          end

          it 'sets the proper danger flash message' do
            subject
            is_expected.to redirect_to(course_path(course))
            expect(flash[:danger]).to eq(I18n.t('activerecord.errors.models.'\
                                                'course/enrol_request.existing_pending_request'))
          end
        end

        context 'when there is no existing pending request' do
          before do
            create(:course_enrol_request, :rejected, course: course, user: user)
          end

          it 'sets the proper danger flash message' do
            subject
            is_expected.to redirect_to(course_path(course))
            expect(flash[:success]).to eq(I18n.t('course.enrol_requests.create.success'))
          end
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: request } }

      context 'when a user cancels an enrolment request' do
        let!(:request) { create(:course_enrol_request, :pending, course: course, user: user) }
        it 'redirects and sets the proper success flash message' do
          subject
          is_expected.to redirect_to(course_path(course))
          expect(flash[:success]).to eq(I18n.t('course.enrol_requests.destroy.success'))
        end
      end

      context 'when a user cancels a processed enrolment request' do
        let!(:request) { create(:course_enrol_request, :approved, course: course, user: user) }
        it 'redirects and sets the proper message' do
          subject
          is_expected.to redirect_to(course_path(course))
          expect(flash[:danger]).to eq(I18n.t('activerecord.errors.models.'\
                                              'course/enrol_request.attributes.base.deletion'))
        end
      end
    end

    describe '#approve' do
      before { sign_in(admin) }
      let!(:request) { create(:course_enrol_request, :pending, course: course, user: user) }

      subject do
        patch :approve, params: { course_id: course,
                                  id: request,
                                  course_user: { name: user.name, role: 'student', phantom: false },
                                  format: 'js' }
      end

      context 'when a valid request is approved' do
        it 'adds the user to the course' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.enrol_requests.approve.success'))

          request.reload
          expect(request.workflow_state).to eq('approved')
          course_user = course.course_users.find_by(user_id: request.user.id)
          expect(course_user).to be_present
        end

        it 'sends an acceptance email notification', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)

          expect(ActionMailer::Base.deliveries.count).to eq(1)
          expect(emails).to include(user.email)
          expect(email_subjects).to include('course.mailer.user_added_email.subject')
        end
      end

      context 'when a course user already exists' do
        let!(:course_user) { create(:course_student, course: course, user: user) }
        it 'flashes an error' do
          subject
          expect(flash[:danger]).not_to be_nil
        end
      end
    end

    describe '#reject' do
      before { sign_in(admin) }
      let!(:request) { create(:course_enrol_request, :pending, course: course, user: user) }

      subject do
        patch :reject, params: { course_id: course,
                                 id: request }
      end

      context 'when a valid request is rejected' do
        it 'does not add the user to the course' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.enrol_requests.reject.success'))

          request.reload
          expect(request.workflow_state).to eq('rejected')
          course_user = course.course_users.find_by(user_id: request.user.id)
          expect(course_user).to be_nil
        end

        it 'sends a rejection email', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)

          expect(ActionMailer::Base.deliveries.count).to eq(1)
          expect(emails).to include(user.email)
          expect(email_subjects).to include('course.mailer.user_rejected_email.subject')
        end
      end
    end
  end
end
