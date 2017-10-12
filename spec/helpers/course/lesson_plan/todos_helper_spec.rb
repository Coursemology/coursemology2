# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::TodosHelper do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#todo_status_class' do
      let(:todo) do
        item = create(:course_lesson_plan_event, start_at: end_at - 1.day, end_at: end_at).acting_as
        create(:course_lesson_plan_todo, item: item)
      end
      subject { helper.todo_status_class(todo) }

      context 'when end_at has not passed' do
        let(:end_at) { 2.days.from_now }
        it { is_expected.to eq([]) }
      end

      context 'when end_at has passed' do
        let(:end_at) { 2.days.ago }
        it { is_expected.to contain_exactly('danger') }
      end
    end
  end
end
