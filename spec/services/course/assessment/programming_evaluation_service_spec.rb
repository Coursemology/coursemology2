require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingEvaluationService do
  class self::StubbedEvaluationService < Course::Assessment::ProgrammingEvaluationService
    private

    def wait_for_evaluation(evaluation)
      tenant = ActsAsTenant.current_tenant
      Thread.new do
        ActsAsTenant.with_tenant(tenant) do
          populate_mock_result(evaluation)
        end
      end

      super
    end

    # Populates the evaluation with fake results.
    #
    # @param [Course::Assessment::ProgrammingEvaluation] evaluation The evaluation to populate
    #   mock results for.
    def populate_mock_result(evaluation)
      evaluation = Course::Assessment::ProgrammingEvaluation.find(evaluation.id)
      attributes = FactoryGirl.
                   attributes_for(:course_assessment_programming_evaluation, :completed).
                   slice(:stdout, :stderr, :test_report)
      evaluation.assign!(User.system)
      evaluation.assign_attributes(attributes)
      evaluation.complete!
      evaluation.save!
    end
  end
  subject { self.class::StubbedEvaluationService }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    it 'returns the result of evaluating' do
      result = subject.execute(course, Polyglot::Language::Python::Python2Point7.instance, 64,
                               5.seconds, File.join(Rails.root, 'spec', 'fixtures', 'course',
                                                    'programming_question_template.zip'))
      expect(result).to be_a(Course::Assessment::ProgrammingEvaluationService::Result)
    end

    context 'when the evaluation times out' do
      it 'raises a Timeout::Error' do
        expect do
          subject.execute(course, Polyglot::Language::Python::Python2Point7.instance, 64, 5.seconds,
                          File.join(Rails.root, 'spec', 'fixtures', 'course',
                                    'programming_question_template.zip'), 0.seconds)
        end.to raise_error(Timeout::Error)
      end
    end
  end
end
