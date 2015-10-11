require 'rails_helper'

RSpec.describe Course::Assessment::Question do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:assessment) }
  it { is_expected.to have_and_belong_to_many(:tags) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#attempt' do
      subject { build_stubbed(:course_assessment_question) }
      it 'fails' do
        expect { subject.attempt(nil) }.to raise_error(NotImplementedError)
      end

      context 'when the question is polymorphic' do
        class self::TestPolymorphicQuestion < ActiveRecord::Base
          acts_as :question, class_name: Course::Assessment::Question.name, inverse_of: :actable

          def self.table_name
            'course_assessment_questions'
          end
        end
        let(:question) { self.class::TestPolymorphicQuestion.new }
        subject { question.question }

        it "calls the polymorphic object's methods" do
          expect(question).to receive(:attempt).and_return([])
          subject.attempt(nil)
        end
      end
    end
  end
end
