# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::Scribing, type: :model do
  it { is_expected.to act_as(Course::Assessment::Answer) }

  it 'has many scribbles' do
    expect(subject).to have_many(:scribbles).
      class_name(Course::Assessment::Answer::ScribingScribble.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:scribbles).allow_destroy(true) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#reset_answer' do
      let(:answer) { create(:course_assessment_answer_scribing) }
      let(:user) { create(:user) }

      subject { answer.reset_answer }

      it 'removes all scribbles' do
        answer.scribbles.create(creator: user)
        answer.save
        expect(answer.specific.reload.scribbles.count).to eq(1)

        answer.reset_answer
        expect(answer.specific.reload.scribbles.count).to eq(0)
      end

      it 'returns an Answer' do
        expect(subject).to be_a(Course::Assessment::Answer)
      end
    end
  end
end
