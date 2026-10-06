# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::AnswersController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    context 'when the assessment is autograded' do
      let(:user) { create(:user) }
      let!(:course) { create(:course, creator: user) }
      let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
      let(:assessment) { create(:assessment, :autograded, :with_mrq_question, course: course) }
      let!(:current_answer) { submission.answers.first }

      before { controller_sign_in(controller, user) }
      describe '#submit_answer' do
        subject do
          patch :submit_answer,
                as: :json,
                params: {
                  course_id: course, assessment_id: assessment, submission_id: submission, id: current_answer.id,
                  answer: { id: current_answer.id }
                }
        end

        context 'when update fails' do
          before do
            allow(current_answer.specific).to receive(:save).and_return(false)
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

    context 'when a student submits an answer' do
      let(:course) { create(:course, :enrollable) }
      let(:submitter) { create(:course_student, course: course).user }
      let(:assessment) do
        create(:assessment, :published_with_mrq_question, course: course, start_at: 1.day.from_now)
      end
      let(:submission) { create(:submission, :published, assessment: assessment, creator: submitter) }
      let(:answer) { submission.answers.first }
      let!(:submission_question) do
        create(:submission_question, :with_post, submission_id: answer.submission_id, question_id: answer.question_id)
      end

      describe '#show' do
        render_views
        subject do
          get :show, format: :json, params: {
            course_id: course,
            assessment_id: assessment,
            submission_id: submission,
            id: answer.id
          }
        end

        context 'when the Normal User get the question answer details for the statistics' do
          let(:user) { create(:user) }
          before { controller_sign_in(controller, user) }
          it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
        end

        context 'when the submitter Student get the question answer details for the statistics' do
          before { controller_sign_in(controller, submitter) }

          it 'returns OK with right question id and answer grade being displayed' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['question']['id']).to eq(answer.question.id)
            expect(json_result['grading']['grade'].to_f).to eq(answer.grade)
          end
        end

        context 'when another Course Student get the question answer details for the statistics' do
          let(:user) { create(:course_student, course: course).user }
          before { controller_sign_in(controller, user) }
          it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
        end

        context 'when the Course Manager get the question answer details for the statistics' do
          let(:user) { create(:course_manager, course: course).user }
          before { controller_sign_in(controller, user) }

          it 'returns OK with right question id and answer grade being displayed' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['question']['id']).to eq(answer.question.id)
            expect(json_result['grading']['grade'].to_f).to eq(answer.grade)
          end
        end

        context 'when the administrator get the question answer details for the statistics' do
          let(:administrator) { create(:administrator) }
          before { controller_sign_in(controller, administrator) }

          it 'returns OK with right question id and answer grade being displayed' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['question']['id']).to eq(answer.question.id)
            expect(json_result['grading']['grade'].to_f).to eq(answer.grade)
          end
        end
      end
    end

    context 'when a text-response answer with a rubric is shown to the student' do
      let(:course) { create(:course, :enrollable) }
      let(:submitter) { create(:course_student, course: course).user }
      let(:assessment) do
        create(:assessment, :published_with_text_response_question, course: course,
                                                                    show_rubric_to_students: true)
      end
      let(:submission) { create(:submission, :published, assessment: assessment, creator: submitter) }
      let(:answer) { submission.answers.first }

      before do
        grading = answer.auto_grading || answer.build_auto_grading
        grading.update!(result: auto_grading_result)
        controller_sign_in(controller, submitter)
      end

      describe '#show' do
        render_views
        subject do
          get :show, format: :json, params: {
            course_id: course, assessment_id: assessment, submission_id: submission, id: answer.id
          }
        end

        # Answers graded before spreadsheet formula autograding (commit b6da95a4ad) stored an
        # auto_grading result without the `evaluation_results` key. Reading it unconditionally
        # raised a NoMethodError (nil.index_by) when the rubric was shown to students.
        context 'when the stored result predates evaluation_results' do
          let(:auto_grading_result) { { 'messages' => [] } }

          it 'renders successfully and omits the solution breakdown' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['fields']).to be_present
            expect(json_result).not_to have_key('solutionResults')
          end
        end

        context 'when the stored result includes evaluation_results' do
          let(:auto_grading_result) do
            {
              'messages' => [],
              'evaluation_results' => answer.question.specific.solutions.map do |solution|
                { 'solution_id' => solution.id, 'grade' => solution.grade }
              end
            }
          end

          it 'renders the solution breakdown' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['solutionResults']).to be_present
            expect(json_result['solutionResults'].map { |result| result['id'] }).
              to match_array(answer.question.specific.solutions.map(&:id))
          end
        end
      end
    end

    # Results are shown against the test cases they were graded against. After an edit re-imports the question,
    # those belong to a snapshot of its previous version, not to the live question.
    context 'when a programming answer was graded against a previous version of its question' do
      let(:user) { create(:user) }
      let!(:course) { create(:course, creator: user) }
      let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
      let(:question) { assessment.questions.first.specific }
      let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
      let(:answer) { submission.answers.first }
      let(:new_package) do
        path = File.join(Rails.root, 'spec/fixtures/course/programming_question_template_with_add_files.zip')
        create(:attachment_reference, binary: true, file_path: path)
      end
      let!(:graded_test_case_ids) do
        grading = Course::Assessment::Answer::ProgrammingAutoGrading.create!(answer: answer)
        question.test_cases.map do |test_case|
          create(:course_assessment_answer_programming_auto_grading_test_result,
                 auto_grading: grading, test_case: test_case).test_case_id
        end
      end

      before do
        Course::Assessment::Question::ProgrammingImportService.import(question, new_package)
        controller_sign_in(controller, user)
      end

      describe '#show' do
        render_views
        subject do
          get :show, format: :json, params: {
            course_id: course, assessment_id: assessment, submission_id: submission, id: answer.id
          }
        end

        it 'shows the results against the test cases they were graded against, flagged as a previous version' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          shown_test_case_ids = json_result['testCases'].values.flatten.map { |test_case| test_case['id'] }
          joined_result_ids = json_result['testResults'].values.flat_map(&:keys).map(&:to_i)

          expect(json_result['gradedOnPreviousVersion']).to be(true)
          expect(shown_test_case_ids).to match_array(graded_test_case_ids)
          expect(joined_result_ids).to match_array(graded_test_case_ids)
          expect(question.reload.test_cases.map(&:id)).not_to include(*graded_test_case_ids)
        end

        # The regrade an edit queues grades into a new run, which has no results until it finishes.
        context 'while a later run is still grading' do
          before { create(:course_assessment_answer_auto_grading, answer: answer) }

          it 'still shows the results of the run that finished' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['testResults'].values.flat_map(&:keys).map(&:to_i)).
              to match_array(graded_test_case_ids)
            expect(json_result['gradedOnPreviousVersion']).to be(true)
          end
        end
      end
    end
  end
end
