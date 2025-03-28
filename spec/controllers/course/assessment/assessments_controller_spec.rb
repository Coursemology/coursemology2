# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::AssessmentsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:category) { course.assessment_categories.first }
    let(:tab) { category.tabs.first }
    let!(:immutable_assessment) do
      create(:assessment, course: course).tap do |stub|
        allow(stub).to receive(:destroy).and_return(false)
      end
    end

    before { controller_sign_in(controller, user) }

    describe '#index' do
      context 'when a category is given' do
        before do
          post :index, as: :json, params: {
            course_id: course,
            id: immutable_assessment,
            assessment: { title: '' },
            category: category
          }
        end
        it { expect(controller.instance_variable_get(:@category)).to eq(category) }
      end

      context 'when a tab is given' do
        before do
          post :index, as: :json, params: {
            course_id: course,
            id: immutable_assessment,
            assessment: { title: '' },
            category: category,
            tab: tab
          }
        end
        it { expect(controller.instance_variable_get(:@tab)).to eq(tab) }
      end
    end

    describe '#edit' do
      let!(:assessment) do
        assessment = create(:assessment, course: course)
        assessment.acting_as.update_column(:description, "<script>alert('boo');</script>")
        assessment
      end

      subject { get :edit, as: :json, params: { course_id: course, id: assessment } }

      context 'when edit page is loaded' do
        it 'sanitizes the description text' do
          subject
          expect(assigns(:assessment).description).not_to include('script')
        end
      end
    end

    describe '#update' do
      let(:student) { create(:course_student, course: course).user }
      let(:assessment) do
        create(:assessment, :published_with_mrq_question, course: course, start_at: 1.day.from_now)
      end

      context 'when update fails' do
        it 'renders JSON errors' do
          patch :update, params: { course_id: course, id: assessment, assessment: { title: '' } }

          body = JSON.parse(response.body)
          expect(body['errors']).to be_present
        end
      end

      it 'updates the start_at and end_at' do
        student

        patch :update, params: {
          course_id: course, id: assessment,
          assessment: { start_at: Time.zone.now, end_at: Time.zone.now + 1.hour }
        }

        perform_enqueued_jobs
        wait_for_job

        emails = unread_emails_for(student.email).map(&:subject)
        closing_subject = 'course.mailer.assessment_closing_reminder_email.subject'
        expect(emails).to include(closing_subject)

        manager_emails = unread_emails_for(user.email).map(&:subject)
        reminder_subject = 'course.mailer.assessment_closing_summary_email.subject'
        expect(manager_emails).to include(reminder_subject)
      end

      context 'when the assessment is autograded' do
        let(:assessment) { create(:assessment, :autograded, course: course) }
        it 'does not update attributes tabbed_view and password' do
          patch :update, params: {
            course_id: course, id: assessment,
            assessment: { skippable: true, tabbed_view: true, session_password: 'password' }
          }

          expect(assessment).not_to be_skippable
          assessment.reload

          expect(assessment).to be_skippable
          expect(assessment.tabbed_view).to be_falsy
          expect(assessment.session_password).to be_blank
        end
      end

      context 'when the assessment is not autograded' do
        let(:assessment) { create(:assessment, course: course) }
        it 'does not update attribute skippable' do
          patch :update, params: {
            course_id: course, id: assessment,
            assessment: { skippable: true, tabbed_view: true, session_password: 'password' }
          }

          expect(assessment).not_to be_skippable
          expect(assessment.tabbed_view).not_to be_truthy
          expect(assessment.session_password).not_to be_present
          assessment.reload

          expect(assessment).not_to be_skippable
          expect(assessment.tabbed_view).to be_truthy
          expect(assessment.session_password).to be_present
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: immutable_assessment } }

      context 'when destroy fails' do
        before { controller.instance_variable_set(:@assessment, immutable_assessment) }

        it 'responds bad request with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(immutable_assessment.errors.full_messages.to_sentence)
        end
      end
    end

    describe '#reorder' do
      let!(:questions) do
        create_list(:course_assessment_question, 2, assessment: immutable_assessment)
      end

      context 'when a valid ordering is given' do
        let(:reversed_order) { immutable_assessment.question_assessments.map(&:id).reverse }

        before do
          post :reorder,
               as: :js,
               params: { course_id: course, id: immutable_assessment, question_order: reversed_order.map(&:to_s) }
        end

        it 'reorders questions' do
          expect(immutable_assessment.question_assessments.order(:weight).pluck(:id)).to eq(reversed_order)
        end
      end

      context 'when an invalid ordering is given' do
        subject do
          post :reorder,
               as: :js,
               params: { course_id: course, id: immutable_assessment, question_order: [questions.first.id] }
        end

        it 'responds bad request with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(I18n.t('course.assessment.assessments.invalid_questions_order'))
        end
      end
    end

    describe '#remind' do
      course_users_array = ['my_students', 'my_students_w_phantom', 'students', 'students_w_phantom']
      let!(:course_users) { '' }
      subject do
        post :remind, as: :json, params:
          { course_id: course.id, id: immutable_assessment, course_users: course_users }
      end

      course_users_array.each do |course_user|
        context 'when the reminder is intended for course users with valid paras' do
          let!(:course_users) { course_user }

          it 'sends reminder to the recipients' do
            allow(Course::Assessment::ReminderService).to receive(:send_closing_reminder)
            subject
            expect(Course::Assessment::ReminderService).to have_received(:send_closing_reminder)
            expect(response).to have_http_status(:ok)
          end
        end
      end

      context 'when the reminder recipient param contains a garbage value' do
        let!(:course_users) { 'sheesh' }

        it 'sends reminder to students' do
          allow(Course::Assessment::ReminderService).to receive(:send_closing_reminder)
          subject
          expect(Course::Assessment::ReminderService).not_to have_received(:send_closing_reminder)
          expect(response).to have_http_status(:bad_request)
        end
      end
    end

    describe '#auto_feedback_count' do
      let(:student) { create(:user, name: 'Student') }
      let(:assessment) { create(:assessment, :with_programming_question, course: course) }
      let!(:course_user) { create(:course_student, course: course, user: student) }
      let(:submission) { create(:submission, :submitted, assessment: assessment, creator: student) }
      let(:answer) { submission.answers.first }
      let(:file) { answer.actable.files.first }
      let(:annotation) { create(:course_assessment_answer_programming_file_annotation, file: file) }
      let!(:post) do
        annotation.posts.create(title: assessment.title,
                                text: 'sample draft auto feedback',
                                creator: User.system,
                                updater: User.system,
                                workflow_state: :draft)
      end
      subject do
        get :auto_feedback_count, as: :json, params: {
          course_id: course,
          id: assessment,
          course_users: Course::Assessment::AssessmentsController::COURSE_USERS[:students]
        }
      end

      context 'when auto feedback count is fetched' do
        it 'returns the correct count of student auto feedback' do
          subject
          expect(JSON.parse(response.body).count).to eq(1)
        end
      end
    end

    describe '#publish_auto_feedback' do
      let(:student) { create(:user, name: 'Student') }
      let(:assessment) { create(:assessment, :with_programming_question, course: course) }
      let!(:course_user) { create(:course_student, course: course, user: student) }
      let(:submission) { create(:submission, :submitted, assessment: assessment, creator: student) }
      let(:answer) { submission.answers.first }
      let(:file) { answer.actable.files.first }
      let(:annotation) { create(:course_assessment_answer_programming_file_annotation, file: file) }
      let!(:post) do
        annotation.posts.create(title: assessment.title,
                                text: 'sample draft auto feedback',
                                creator: User.system,
                                updater: User.system,
                                workflow_state: :draft)
      end
      let!(:codaveri_feedback) do
        post.create_codaveri_feedback(codaveri_feedback_id: '12345',
                                      original_feedback: 'sample',
                                      status: :pending_review)
      end
      subject do
        patch :publish_auto_feedback, as: :json, params: {
          course_id: course,
          id: assessment,
          course_users: Course::Assessment::AssessmentsController::COURSE_USERS[:students],
          rating: 4
        }
      end

      context 'when publish auto feedback is called' do
        it 'publishes the post' do
          subject
          expect(post.reload.workflow_state).to eq('published')
          expect(post.reload.codaveri_feedback.reload.rating).to eq(4)
        end
      end
    end

    describe '#authenticate' do
      let(:started_assessment) do
        create(:assessment, :published_with_all_question_types, :view_password, course: course)
      end
      let(:not_started_assessment) do
        create(:assessment, :published_with_all_question_types, :view_password,
               start_at: 1.day.from_now, course: course)
      end

      let(:json) { JSON.parse(response.body) }

      context 'when the assessment is not started' do
        it 'does not unlock even with correct password' do
          post :authenticate, params: {
            course_id: course.id,
            id: not_started_assessment.id,
            assessment: {
              assessment: not_started_assessment,
              password: not_started_assessment.view_password
            }
          }
          expect(json['redirectUrl']).to eq(course_assessment_path(course, not_started_assessment))
        end
      end

      context 'when the assessment is started' do
        it 'unlocks with correct password' do
          post :authenticate, params: {
            course_id: course.id,
            id: started_assessment.id,
            assessment: {
              assessment: started_assessment,
              password: started_assessment.view_password
            }
          }
          expect(json['redirectUrl']).to eq(course_assessment_path(course, started_assessment))
        end

        it 'does not unlock with wrong password' do
          post :authenticate, params: {
            course_id: course.id,
            id: started_assessment.id,
            assessment: {
              assessment: started_assessment,
              password: 'WRONG_PASSWORD'
            }
          }
          expect(json['errors']).not_to be_nil
        end
      end
    end
  end
end
