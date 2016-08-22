# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::TextResponse, type: :model do
  it { is_expected.to act_as(Course::Assessment::Answer) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe 'validations' do
      subject do
        build_stubbed(:course_assessment_answer_text_response, answer_text: '  content  ')
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
  end
end
