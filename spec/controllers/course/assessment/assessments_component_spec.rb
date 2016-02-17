# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AssessmentsComponent do
  controller(Course::Controller) {}
  subject do
    controller.instance_variable_set(:@course, course)
    Course::AssessmentsComponent.new(controller)
  end

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { build(:course, instance: instance) }

    describe '#main_sidebar_items' do
      context 'when the user is defining a new category' do
        let(:new_category_title) { 'new category' }
        let!(:new_category) { course.assessment_categories.build(title: new_category_title) }

        it 'excludes the category from the list' do
          expect(subject.send(:main_sidebar_items).map(&:title)).not_to include(new_category_title)
        end
      end
    end
  end
end
