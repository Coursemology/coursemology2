# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::SubmissionsHelper do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#max_step' do
      let(:course) { create(:course) }
      let(:student_user) { create(:course_student, course: course).user }
      let(:assessment) { build(:assessment, :autograded, :published_with_mcq_question) }
      let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
      before do
        helper.instance_variable_set(:@assessment, assessment)
        helper.instance_variable_set(:@submission, submission)
      end
      subject { helper.max_step }

      context 'when all questions have been answered' do
        before { allow(helper).to receive(:next_unanswered_question).and_return(nil) }

        it { is_expected.to eq(assessment.questions.length) }
      end
    end

    describe '#nav_class' do
      subject { helper.nav_class(step) }
      before do
        allow(helper).to receive(:max_step).and_return(5)
        allow(helper).to receive(:current_step).and_return(3)
      end

      context 'when step is greater than max_step' do
        let(:step) { 6 }
        it { is_expected.to eq('disabled') }
      end

      context 'when step is current_step' do
        let(:step) { 3 }
        it { is_expected.to eq('active') }
      end

      context 'when step less than current_step' do
        let(:step) { 2 }
        it { is_expected.to eq('completed') }
      end
    end
  end
end
