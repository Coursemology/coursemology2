require 'rails_helper'

RSpec.describe 'Course: Assessments: Programming Evaluations Processing' do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:user, *user_traits) }
    let(:user_traits) { nil }
    before { login_as(user, scope: :user) }

    context 'when an auto grader is logged in' do
      let(:user_traits) { :auto_grader }

      it 'lists all outstanding evaluations' do
        pending 'Do we need this?'
        fail
      end

      context 'when there are available jobs' do
        it 'allows an evaluator to request for a job' do
          evaluation = create(:course_assessment_programming_evaluation, course: course)
          post allocate_assessment_programming_evaluations_path

          response_object = JSON.parse(response.body)[0]
          expect(response_object['id']).not_to be_nil
          evaluation.delete
        end
      end

      it 'allows the evaluation to be queried' do
        evaluation = create(:course_assessment_programming_evaluation,
                            course: course, memory_limit: 3, time_limit: 5)
        get assessment_programming_evaluation_path(evaluation)

        response_object = JSON.parse(response.body)
        expect(response_object['id']).to eq(evaluation.id)
        expect(response_object['memory_limit']).to eq(evaluation.memory_limit)
        expect(response_object['time_limit']).to eq(evaluation.time_limit)
      end

      it 'allows the evaluation package to be downloaded' do
        evaluation = create(:course_assessment_programming_evaluation,
                            course: course, memory_limit: 3, time_limit: 5)
        get assessment_programming_evaluation_package_path(evaluation)

        expect(URI.parse(response.location).path).to eq(evaluation.package_path)
      end

      it 'allows the evaluation result to be updated' do
        evaluation = create(:course_assessment_programming_evaluation, :assigned, course: course)
        attributes = attributes_for(:course_assessment_programming_evaluation, :completed)
        put assessment_programming_evaluation_result_path(evaluation),
            programming_evaluation: attributes.slice(:stdout, :stderr, :test_report)

        expect(response.status).to eq(200)
        evaluation.reload
        expect(evaluation.stdout).to eq(attributes[:stdout])
        expect(evaluation.stderr).to eq(attributes[:stderr])
        expect(evaluation.test_report).to eq(attributes[:test_report])
        expect(evaluation).to be_completed
      end

      context 'when the evaluation is not in the submitted state' do
        it 'fails with HTTP 422' do
          evaluation = create(:course_assessment_programming_evaluation, course: course)
          attributes = attributes_for(:course_assessment_programming_evaluation, :completed)
          put assessment_programming_evaluation_result_path(evaluation),
              programming_evaluation: attributes.slice(:stdout, :stderr, :test_report)

          expect(response.status).to eq(422)
        end
      end
    end

    context 'when a course-only auto grader is logged in' do
      let!(:course_user) { create(:course_user, :auto_grader, course: course, user: user) }
      it 'allows the evaluator to request for a job' do
        pending 'Cannot unscope from an active tenant'
        evaluation = create(:course_assessment_programming_evaluation, course: course)
        post allocate_programming_evaluations_path

        response_object = JSON.parse(response.body)[0]
        expect(response_object['id']).to eq(evaluation.id)

        evaluation.reload
        expect(evaluation).to be_assigned
        expect(evaluation.evaluator).to eq(user)

        put assessment_programming_evaluation_result_path(evaluation),
            programming_evaluation: { stdout: '', stderr: '', test_report: '' }
      end

      context 'when there are no jobs' do
        it 'returns an empty array of jobs' do
          post allocate_assessment_programming_evaluations_path

          expect(response.status).to eq(200)
          response_object = JSON.parse(response.body)
          expect(response_object.length).to eq(0)
        end
      end
    end
  end
end
