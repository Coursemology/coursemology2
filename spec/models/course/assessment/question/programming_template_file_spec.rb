# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingTemplateFile do
  it 'belongs to a question' do
    expect(subject).to belong_to(:question).
      class_name(Course::Assessment::Question::Programming.name).
      without_validating_presence
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { build_stubbed(:course_assessment_question_programming_template_file) }

    describe 'validations' do
      describe '#filename' do
        it 'normalises the filename' do
          subject.filename = 'test\\b.txt'
          expect(subject.valid?).to be(true)
          expect(subject.filename).to eq('test/b.txt')
        end
      end
    end

    describe '#copy_template_to' do
      let(:answer) do
        build_stubbed(:course_assessment_answer_programming, question: subject.question)
      end
      let(:answer_file) { subject.copy_template_to(answer) }

      it 'creates a Course::Assessment::Answer::ProgrammingFile' do
        expect(answer_file).to be_a(Course::Assessment::Answer::ProgrammingFile)
      end

      it 'has the same file name as the template' do
        expect(answer_file.filename).to eq(subject.filename)
      end

      it 'has the same contents as the template' do
        expect(answer_file.content).to eq(subject.content)
      end
    end
  end
end
