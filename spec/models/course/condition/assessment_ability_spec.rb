# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Assessment do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:condition) { create(:assessment_condition, course: course) }

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      it { is_expected.to be_able_to(:manage, condition) }
    end

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }

      context 'when the assessment is published but has not started' do
        let(:unopened_assessment) do
          create(:assessment, :published_with_mcq_question, :unopened, course: course)
        end

        it { is_expected.to_not be_able_to(:attempt, unopened_assessment) }
      end

      context 'when the assessment has started' do
        let(:assessment1) { create(:assessment, :published_with_mcq_question, course: course) }
        let(:assessment2) { create(:assessment, :published_with_mcq_question, course: course) }
        let!(:condition) do
          create(:assessment_condition,
                 course: course,
                 assessment: assessment2,
                 conditional: assessment1)
        end

        context 'when the assessment does not have any condition' do
          it { is_expected.to be_able_to(:attempt, assessment2) }
        end

        context "when the user does not satisfied the assessment's conditions" do
          it { is_expected.to_not be_able_to(:attempt, assessment1) }
        end

        context "when the user satisfied the assessment's conditions" do
          it 'is able to attempt the assessment' do
            allow(assessment1).to receive(:conditions_satisfied_by?).and_return(true)

            expect(subject.can?(:attempt, assessment1)).to be_truthy
          end
        end
      end
    end
  end
end
