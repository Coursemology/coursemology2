require 'rails_helper'

RSpec.describe Course::Assessment::Answer::TextResponse, type: :model do
  it { is_expected.to act_as(:answer) }

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
  end
end
