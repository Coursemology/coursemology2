require 'rails_helper'

RSpec.describe 'Course: Assessments: Programming Evaluations Processing', type: :request do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    context 'when an auto grader is logged in' do
      let(:user) { create(:user, :auto_grader) }
      before { login_as(user, scope: :user) }

      it 'lists all outstanding evaluations' do
        pending 'Do we need this?'
        fail
      end

      it 'allows the evaluation result to be updated' do
        evaluation = create(:course_assessment_programming_evaluation, :assigned, course: course)
        attributes = attributes_for(:course_assessment_programming_evaluation, :completed)
        put programming_evaluation_result_path(evaluation),
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
          put programming_evaluation_result_path(evaluation),
              programming_evaluation: attributes.slice(:stdout, :stderr, :test_report)

          expect(response.status).to eq(422)
        end
      end
    end
  end
end
