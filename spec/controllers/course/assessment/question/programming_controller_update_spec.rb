# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingController do
  render_views
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:programming_question) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:question_programming_attributes) do
      attributes_for(:course_assessment_question_programming).
        slice(:title, :description, :maximum_grade, :language, :memory_limit,
              :time_limit).tap do |result|
        result[:language_id] = result.delete(:language).id
      end
    end
    let(:immutable_programming_question) do
      create(:course_assessment_question_programming, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
      controller.instance_variable_set(:@programming_question, programming_question)
    end

    describe '#update' do
      subject do
        request.accept = 'application/json'
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: programming_question,
          question_programming: question_programming_attributes
        }
      end

      let!(:existing_language) { Coursemology::Polyglot::Language.find_by(name: 'Python 3.10') }

      context 'when the programming question has data to snapshot' do
        let(:programming_question) do
          create(:course_assessment_question_programming, template_package: true,
                 assessment: assessment).tap do |question|

                  question.test_cases = [
          build(:course_assessment_question_programming_test_case, question: nil, expression: '1', expected: '1'),
          build(:course_assessment_question_programming_test_case, question: nil, expression: '2', expected: '2'),
                  ]
                 end
        end

        context 'when the evaluation fields are updated' do
          let(:question_programming_attributes) do
            attributes_for(:course_assessment_question_programming).slice(:time_limit).tap do |result|
              result[:time_limit] = 11
            end
          end

          it 'updates the question successfully, and clones test case data successfully' do
            prev_snapshot_of_state_at = programming_question.snapshot_of_state_at
            subject
            expect(response).to have_http_status(:ok)

            programming_question.reload
            snapshots = programming_question.snapshots
            expect(snapshots.size).to eq(2)
            current_snapshot, old_snapshot = snapshots.partition { |s| s.id == programming_question.id }.map(&:first)

            expect(old_snapshot.time_limit).to eq(10)
            expect(old_snapshot.snapshot_of_state_at).to eq(prev_snapshot_of_state_at)
            expect(old_snapshot.snapshot_index).to eq(0)

            expect(current_snapshot.time_limit).to eq(11)
            expect(current_snapshot.snapshot_of_state_at).to be > prev_snapshot_of_state_at
            expect(current_snapshot.snapshot_index).to eq(1)

            old_test_cases = old_snapshot.test_cases.group_by(&:expression)
            current_test_cases = current_snapshot.test_cases.group_by(&:expression)

            old_test_cases.each do |expr_key, expr_tests|
              expect(current_test_cases[expr_key].count).to eq(1)
              expect(current_test_cases[expr_key].first.id).to_not eq(expr_tests.first.id)
            end
          end
        end
      end
    end
  end
end
