# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::Programming do
  it { is_expected.to act_as(Course::Assessment::Answer) }

  it 'has many files' do
    expect(subject).to have_many(:files).
      class_name(Course::Assessment::Answer::ProgrammingFile.name).dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:files).allow_destroy(true) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#reset_answer' do
      let(:question) { create(:course_assessment_question_programming, template_file_count: 1) }
      let(:answer) { create(:course_assessment_answer_programming, question: question.question) }
      subject { answer.reset_answer }

      it 'replaces the answer with the original template files from the question' do
        question.template_files.each do |template_file|
          matching_answer_file = subject.specific.files.find do |answer_file|
            answer_file.filename == template_file.filename &&
              answer_file.content == template_file.content
          end
          expect(matching_answer_file).not_to be_nil
        end
        expect(question.template_files.count).to eq(subject.specific.files.size)
      end

      it 'returns an Answer' do
        expect(subject).to be_a(Course::Assessment::Answer)
      end
    end
  end
end
