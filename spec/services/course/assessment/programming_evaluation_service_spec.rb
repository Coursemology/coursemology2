require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingEvaluationService do
  subject { Course::Assessment::ProgrammingEvaluationService }

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
