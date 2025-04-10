# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::Programming do
  it { is_expected.to act_as(Course::Assessment::Answer) }

  it 'has many files' do
    expect(subject).to have_many(:files).
      class_name(Course::Assessment::Answer::ProgrammingFile.name).dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:files).allow_destroy(true) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student_user) { create(:course_student, course: course).user }
    let(:assessment) { create(:assessment, course: course) }
    let(:attempt_limit) { 3 }
    let(:question) do
      create(:course_assessment_question_programming,
             assessment: assessment, template_file_count: 1, attempt_limit: attempt_limit)
    end
    let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
    let(:answer) do
      create(:course_assessment_answer_programming,
             submission: submission, question: question.question)
    end

    describe '#reset_answer' do
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

    describe '#grade_inline?' do
      it 'returns false' do
        expect(answer.acting_as.grade_inline?).to be_falsy
      end
    end

    describe 'attempting_times_left' do
      subject { answer.attempting_times_left }

      context 'with one existing attempt' do
        let!(:graded_answer) do
          create(:course_assessment_answer_programming, :graded,
                 submission: submission, question: question.question)
        end
        let!(:submitted_answer) do
          create(:course_assessment_answer_programming, :submitted,
                 submission: submission, question: question.question)
        end
        it 'returns the attempting times left' do
          expect(subject).to eq(question.attempt_limit - 1)
        end
      end

      context 'when question do not have an attempt limit' do
        let(:attempt_limit) { nil }

        it 'returns the max attempt limits' do
          expect(subject).to eq(answer.class::MAX_ATTEMPTING_TIMES)
        end
      end

      describe '#compare_answer' do
        let(:answer1) do
          create(:course_assessment_answer_programming,
                 question: question,
                 file_name_contents: [['name1', '123'],
                                      ['name3', '456']])
        end
        let(:answer2) do
          create(:course_assessment_answer_programming,
                 question: question,
                 file_name_contents: [['name1', '456']])
        end
        let(:answer3) do
          create(:course_assessment_answer_programming,
                 question: question,
                 file_name_contents: [['name1', '123'],
                                      ['name2', '456']])
        end
        let(:answer4) do
          create(:course_assessment_answer_programming,
                 question: question,
                 file_name_contents: [['name1', '123'],
                                      ['name2', '123'],
                                      ['name3', '456']])
        end
        let(:answer5) do
          create(:course_assessment_answer_programming,
                 question: question,
                 file_name_contents: [['name3', '456'],
                                      ['name1', '123']])
        end

        it 'compares if the answers are the same or not' do
          expect(answer1.compare_answer(answer1)).to be_truthy
          expect(answer1.compare_answer(answer2)).to be_falsey
          expect(answer1.compare_answer(answer3)).to be_falsey
          expect(answer1.compare_answer(answer4)).to be_falsey
          expect(answer1.compare_answer(answer5)).to be_truthy
          expect(answer2.compare_answer(answer3)).to be_falsey
          expect(answer2.compare_answer(answer4)).to be_falsey
          expect(answer2.compare_answer(answer5)).to be_falsey
          expect(answer3.compare_answer(answer4)).to be_falsey
          expect(answer3.compare_answer(answer5)).to be_falsey
          expect(answer4.compare_answer(answer5)).to be_falsey
        end
      end
    end

    describe 'validations' do
      context 'when the content exceeds the size limit' do
        let(:max_file_size) { 2.kilobytes }
        let(:invalid_content) { 'a' * (max_file_size + 1) }

        it 'is not valid' do
          stub_const('Course::Assessment::Answer::Programming::MAX_TOTAL_FILE_SIZE', max_file_size)
          answer = build(:course_assessment_answer_programming, file_contents: [invalid_content])
          expect(answer).not_to be_valid
        end
      end
    end
  end
end
