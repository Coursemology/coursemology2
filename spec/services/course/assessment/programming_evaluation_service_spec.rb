# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingEvaluationService do
  subject { Course::Assessment::ProgrammingEvaluationService }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    it 'returns the result of evaluating' do
      result = subject.execute(course,
                               Coursemology::Polyglot::Language::Python::Python2Point7.instance, 64,
                               5.seconds, File.join(Rails.root, 'spec', 'fixtures', 'course',
                                                    'programming_question_template.zip'))
      expect(result).to be_a(Course::Assessment::ProgrammingEvaluationService::Result)
    end

    context 'when the evaluation times out' do
      it 'raises a Timeout::Error' do
        expect do
          subject.execute(course, Coursemology::Polyglot::Language::Python::Python2Point7.instance,
                          64, 5.seconds, File.join(Rails.root, 'spec', 'fixtures', 'course',
                                                   'programming_question_template.zip'), 0.seconds)
        end.to raise_error(Timeout::Error)
      end
    end

    describe '#create_evaluation' do
      subject do
        Course::Assessment::ProgrammingEvaluationService.
          new(course, Coursemology::Polyglot::Language::Python::Python2Point7.instance, 64,
              5.seconds, File.join(Rails.root, 'spec', 'fixtures', 'course',
                                   'programming_question_template.zip'), 5.seconds)
      end

      it 'creates the package for the evaluator to download' do
        evaluation = subject.send(:create_evaluation)

        # Remove the leading / because Pathname treats it as an absolute path.
        expect(Rails.public_path + evaluation.package_path[1..-1]).to exist
      end

      it 'successfully creates the evaluation' do
        evaluation = subject.send(:create_evaluation)
        expect(evaluation).to be_persisted
      end
    end
  end
end
