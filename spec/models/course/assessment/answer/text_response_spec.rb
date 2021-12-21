# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::TextResponse, type: :model do
  it { is_expected.to act_as(Course::Assessment::Answer) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe 'validations' do
      subject do
        create(:course_assessment_answer_text_response, answer_text: '  content  ')
      end

      describe '#answer_text' do
        it 'strips whitespaces when validated' do
          expect(subject.valid?).to be(true)
          expect(subject.answer_text).to eq('content')
        end
      end
    end

    describe '#reset_answer' do
      let(:answer) { create(:course_assessment_answer_text_response) }
      subject { answer.reset_answer }

      it 'sets the text response answer to a blank' do
        expect(subject.specific.answer_text).to be_blank
      end

      it 'returns an Answer' do
        expect(subject).to be_a(Course::Assessment::Answer)
      end
    end

    describe '#normalized_answer_text' do
      subject { answer.normalized_answer_text }

      context 'with Windows newlines' do
        let(:answer) do
          create(:course_assessment_answer_text_response, :multiline_windows)
        end

        it 'normalizes newlines' do
          expect(subject).to eq("hello world\nsecond line")
        end
      end

      context 'with Linux newlines' do
        let(:answer) do
          create(:course_assessment_answer_text_response, :multiline_linux)
        end

        it 'normalizes newlines' do
          expect(subject).to eq("hello world\nsecond line")
        end
      end
    end

    describe '#compare_answer' do
      let(:answer1) do
        create(:course_assessment_answer_text_response, :keyword)
      end
      let(:answer2) do
        create(:course_assessment_answer_text_response, :exact_match)
      end
      let(:answer3) do
        create(:course_assessment_answer_text_response, :exact_match).tap do |answer3|
          attachment1 = create(:attachment_reference, name: 'att1.txt')
          attachment1.save!
          answer3.attachment_references << attachment1
        end
      end
      let(:answer4) do
        create(:course_assessment_answer_text_response, :exact_match).tap do |answer4|
          attachment1 = create(:attachment_reference, name: 'att1.txt')
          attachment1.save!
          attachment2 = create(:attachment_reference, name: 'att2.txt')
          attachment2.save!
          answer4.attachment_references << attachment1
          answer4.attachment_references << attachment2
        end
      end

      it 'compares if the answers are the same or not' do
        expect(answer1.compare_answer(answer1)).to be_truthy
        expect(answer1.compare_answer(answer2)).to be_falsey
        expect(answer1.compare_answer(answer3)).to be_falsey
        expect(answer1.compare_answer(answer4)).to be_falsey
        expect(answer2.compare_answer(answer3)).to be_falsey
        expect(answer2.compare_answer(answer4)).to be_falsey
        expect(answer3.compare_answer(answer4)).to be_falsey
        expect(answer4.compare_answer(answer4)).to be_truthy
      end
    end
  end
end
