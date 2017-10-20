# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Controller do
  controller(Course::Assessment::Controller) do
    def index
      render nothing: true
    end
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    before { sign_in(user) }

    describe '#add_assessment_breadcrumbs' do
      let(:breadcrumbs) { controller.send(:breadcrumb_names) }
      let(:assessment) { build_stubbed(:course_assessment_assessment, course: course) }
      let(:tabs) { 1 }
      before do
        create_list(:course_assessment_tab, tabs - 1,
                    category: course.assessment_categories.first)
        @controller.instance_variable_set(:@assessment, assessment)
        get :index, params: { course_id: course.id }
      end

      context 'when the category has one tab' do
        it 'only displays the category' do
          expect(breadcrumbs).to include(assessment.tab.category.title)
          expect(breadcrumbs).not_to include(assessment.tab.title)
        end
      end

      context 'when the category has more than one tab' do
        let(:tabs) { 2 }
        it 'also displays the tab' do
          expect(breadcrumbs).to include(assessment.tab.category.title)
          expect(breadcrumbs).to include(assessment.tab.title)
        end
      end
    end
  end
end
