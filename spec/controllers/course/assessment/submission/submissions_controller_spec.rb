# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::SubmissionsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published, *assessment_traits, course: course) }
    let(:assessment_traits) { [:with_all_question_types] }

    let(:immutable_submission) do
      create(:submission, assessment: assessment, creator: user).tap do |stub|
        allow(stub).to receive(:save).and_return(false)
        allow(stub).to receive(:update).and_return(false)
        allow(stub).to receive(:destroy).and_return(false)
      end
    end
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
    let(:randomized_assessment) do
      create(:assessment, :published, :with_all_question_types, randomization: 'prepared', course: course).tap do |stub|
        group = stub.question_groups.create!(title: 'Test Group', weight: 1)
        bundle = group.question_bundles.create!(title: 'Test Bundle')
        bundle.question_bundle_questions.create!(question: stub.questions.first, weight: 1)
      end
    end
    let(:randomized_submission) do
      create(:submission, assessment: randomized_assessment, creator: user).tap do |stub|
        randomized_assessment.question_bundles.first.question_bundle_assignments.create(
          user: user,
          assessment: randomized_assessment,
          submission: stub
        )
      end
    end

    before { sign_in(user) }

    describe '#index' do
      subject do
        get :index, params: { course_id: course, assessment_id: assessment }
      end

      context 'when a student visits the page' do
        let(:course) { create(:course) }
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#create' do
      context 'when an there is already an existing submission for an assessment' do
        subject do
          post :create, params: { course_id: course, assessment_id: assessment }
        end

        before do
          controller.instance_variable_set(:@submission, submission)
          subject
        end

        it do
          is_expected.
            to redirect_to(edit_course_assessment_submission_path(course, assessment, submission))
        end
      end

      context 'when a submission of a randomized assesment creation fails' do
        subject do
          post :create, params: { course_id: course, assessment_id: randomized_assessment }
        end

        before do
          subject
        end

        it { is_expected.to redirect_to(course_assessments_path(course)) }
        it 'sets the proper flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.assessment.submission.submissions.create.'\
                                              'failure', error: ''))
        end
      end
    end

    describe '#edit' do
      context 'when randomization is nil' do
        render_views
        subject do
          get :edit, params: {
            course_id: course, assessment_id: assessment.id, id: submission.id, format: :json
          }
        end

        it 'renders all questions' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['questions'].count).to eq(5)
        end

        it 'renders the total grade' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['submission']['maximumGrade']).to eq(10)
        end
      end

      context 'when randomization is prepared' do
        render_views
        subject do
          get :edit, params: {
            course_id: course, assessment_id: randomized_assessment.id, id: randomized_submission.id, format: :json
          }
        end

        it 'renders only assigned questions' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['questions'].count).to eq(1)
        end

        it 'renders the total grade for assigned questions' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['submission']['maximumGrade']).to eq(2)
        end
      end
    end

    describe '#update' do
      subject do
        post :update, params: {
          course_id: course, assessment_id: assessment, id: immutable_submission,
          submission: { title: '' }
        }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@submission, immutable_submission)
          subject
        end

        it { is_expected.to have_http_status(400) }
      end
    end

    describe '#extract_instance_variables' do
      subject do
        get :edit, params: { course_id: course, assessment_id: assessment, id: immutable_submission }
      end

      it 'extracts instance variables from services' do
        subject

        expect(controller.instance_variable_get(:@questions_to_attempt)).to be_present
      end
    end

    describe '#reload_answer' do
      let!(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }

      context 'when answer_id does not exist' do
        subject do
          post :reload_answer, params: {
            course_id: course, assessment_id: assessment.id,
            id: submission.id, answer_id: -1, format: :json
          }
        end

        it { is_expected.to have_http_status(:bad_request) }
      end

      # The normal case when the user checks his answer with the autograder.
      context 'when answer_id exists' do
        render_views
        let(:answer) { submission.answers.first }
        subject do
          post :reload_answer, params: {
            course_id: course, assessment_id: assessment.id,
            id: submission.id, answer_id: answer.id, format: :json
          }
        end

        it 'returns the answer' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)
          expect(json_result['questionId']).to eq answer.question.id
        end
      end
    end

    context 'when the assessment does not show mcq answer' do
      let(:assessment) { create(:assessment, :not_show_mcq_answer, :with_mrq_question, course: course) }
      let!(:current_answer) { submission.answers.first }

      describe '#submit_answer' do
        subject do
          put :submit_answer,
              as: :json,
              params: {
                course_id: course, assessment_id: assessment, id: submission, answer_id: current_answer.id,
                answer: { id: current_answer.id }
              }
        end
      end
    end

    context 'when the assessment is autograded' do
      let(:assessment) { create(:assessment, :autograded, :with_mrq_question, course: course) }
      let!(:current_answer) { submission.answers.first }

      describe '#submit_answer' do
        subject do
          put :submit_answer,
              as: :json,
              params: {
                course_id: course, assessment_id: assessment, id: submission, answer_id: current_answer.id,
                answer: { id: current_answer.id }
              }
        end

        context 'when update fails' do
          before do
            allow(current_answer).to receive(:save).and_return(false)
            allow(submission.answers).to receive(:find).and_return(current_answer)
            controller.instance_variable_set(:@submission, submission)
            subject
          end

          it { is_expected.to have_http_status(400) }
        end

        context 'when update succeeds' do
          it 'creates a new answer and grades it' do
            original_answers = submission.answers
            expect { subject }.to change { submission.answers.count }.by(1)

            last_answer = submission.reload.answers.last
            expect(original_answers).not_to include(last_answer)
            expect(last_answer.current_answer).to be_falsey
            expect(last_answer.workflow_state).to eq 'graded'
          end

          it 'leaves current_answer in the attempting state' do
            subject

            # Reload the current_answer (there's only 1 question in this assessment)
            # after running submit_answer
            current_answer = submission.reload.current_answers.first
            expect(current_answer.current_answer).to be_truthy
            expect(current_answer.workflow_state).to eq 'attempting'
          end
        end
      end
    end

    describe 'submission_actions' do
      let!(:students) { create_list(:course_student, 5, course: course) }
      let!(:phantom_student) { create(:course_student, :phantom, course: course) }
      let!(:submitted_submission) do
        create(:submission, :submitted,
               assessment: assessment, course: course, creator: students[0].user)
      end
      let!(:attempting_submission) do
        create(:submission, :attempting,
               assessment: assessment, course: course, creator: students[1].user)
      end
      let!(:published_submission) do
        create(:submission, :published,
               assessment: assessment, course: course, creator: students[2].user)
      end
      let!(:graded_submission) do
        create(:submission, :graded, assessment: assessment, course: course,
                                     creator: students[3].user)
      end

      describe '#publish_all' do
        subject do
          put :publish_all, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: 'students', format: :json
          }
        end

        context 'when there is no graded submission' do
          before do
            graded_submission.destroy!
          end
          it { expect(subject).to have_http_status(:ok) }
        end

        context 'when there is a graded submission' do
          it 'publishes the submission' do
            subject
            wait_for_job

            expect(graded_submission.reload.published?).to be(true)
            json_result = JSON.parse(response.body)
            expect(json_result['redirect_url']).not_to be(nil)
          end
        end
      end

      describe '#force_submit_all' do
        subject do
          put :force_submit_all, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: course_users, format: :json
          }
        end

        context 'when there is no attempting submission' do
          let!(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
          let(:course_users)  { 'staff' }
          it { expect(subject).to have_http_status(:ok) }
        end

        context 'when there are empty and attempting submissions' do
          let(:course_users) { 'students_w_phantom' }

          it 'publishes the submissions' do
            subject
            wait_for_job

            expect(assessment.submissions.count).to eq(6) # 5 normal students + 1 phantom student
            expect(assessment.submissions.pluck(:workflow_state)).not_to include 'attempting'

            expect(attempting_submission.reload.draft_points_awarded).to eq(nil)
            expect(attempting_submission.reload.points_awarded).to eq(0)

            json_result = JSON.parse(response.body)
            expect(json_result['redirect_url']).not_to be(nil)
          end
        end

        context 'when the assessment has delayed grade publication setting' do
          let(:assessment_traits) { [:with_all_question_types, :delay_grade_publication] }
          let(:course_users) { 'students_w_phantom' }

          it 'grades the submissions' do
            subject
            wait_for_job

            expect(assessment.submissions.count).to eq(6)
            expect(assessment.submissions.pluck(:workflow_state)).to include 'graded'
            expect(assessment.submissions.pluck(:workflow_state)).not_to include 'attempting'

            expect(attempting_submission.reload.draft_points_awarded).to eq(0)
            expect(attempting_submission.reload.points_awarded).to eq(nil)

            json_result = JSON.parse(response.body)
            expect(json_result['redirect_url']).not_to be(nil)
          end
        end

        context 'when the assessment is autograded' do
          let(:assessment_traits) { [:with_mrq_question, :autograded] }
          let(:course_users) { 'students_w_phantom' }

          it 'grades the submissions' do
            subject
            wait_for_job

            expect(assessment.submissions.count).to eq(6)
            expect(assessment.submissions.pluck(:workflow_state)).not_to include 'attempting'

            expect(attempting_submission.reload.draft_points_awarded).to eq(nil)
            expect(attempting_submission.reload.points_awarded).to eq(0)

            json_result = JSON.parse(response.body)
            expect(json_result['redirect_url']).not_to be(nil)
          end
        end
      end

      describe '#unsubmit_all' do
        subject do
          put :unsubmit_all, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: 'students', format: :json
          }
        end

        context 'when there is no submission' do
          before do
            assessment.submissions.destroy_all
          end
          it { expect(subject).to have_http_status(:ok) }
        end

        context 'when there is a submitted submission' do
          it 'unsubmits the submission' do
            subject
            wait_for_job

            expect(submitted_submission.reload.attempting?).to be(true)
            json_result = JSON.parse(response.body)
            expect(json_result['redirect_url']).not_to be(nil)
          end
        end
      end

      describe '#delete_all' do
        subject do
          put :delete_all, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: course_users, format: :json
          }
        end

        context 'when there is no submission' do
          let(:course_users) { 'staff' }
          before do
            assessment.submissions.destroy_all
          end
          it { expect(subject).to have_http_status(:ok) }
        end

        context 'when there are some submissions' do
          let(:course_users) { 'students' }
          it 'deletes all the submission' do
            subject
            wait_for_job

            expect(assessment.submissions.empty?).to be(true)
            json_result = JSON.parse(response.body)
            expect(json_result['redirect_url']).not_to be(nil)
          end
        end
      end

      describe '#download_all' do
        subject do
          put :download_all, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: 'students', format: :json
          }
        end

        context 'when there is no submission' do
          before do
            assessment.submissions.destroy_all
          end
          it { expect(subject).to have_http_status(:bad_request) }
        end

        context 'when there are submissions' do
          it 'publishes the submission' do
            subject
            wait_for_job

            json_result = JSON.parse(response.body)
            expect(json_result['redirect_url']).not_to be(nil)
          end
        end
      end

      describe '#download_statistics' do
        subject do
          put :download_statistics, params: {
            course_id: course, assessment_id: assessment.id,
            course_users: 'students', format: :json
          }
        end

        context 'when there is no submission' do
          before do
            assessment.submissions.destroy_all
          end
          it { expect(subject).to have_http_status(:bad_request) }
        end

        context 'when there are submissions' do
          it 'publishes the submission' do
            subject
            wait_for_job

            json_result = JSON.parse(response.body)
            expect(json_result['redirect_url']).not_to be(nil)
          end
        end
      end
    end
  end
end
