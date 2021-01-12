# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::SubmissionsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published, :with_all_question_types, course: course) }
    let(:immutable_submission) do
      create(:submission, assessment: assessment, creator: user).tap do |stub|
        allow(stub).to receive(:save).and_return(false)
        allow(stub).to receive(:update_attributes).and_return(false)
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
      subject do
        post :create, params: { course_id: course, assessment_id: assessment }
      end

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@submission, immutable_submission)
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
      let(:assessment) {create(:assessment, :not_show_mcq_answer, :with_mrq_question, course: course)}
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
  end
end
