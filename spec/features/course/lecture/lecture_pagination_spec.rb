# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Lectures' do
  describe 'Pagination' do
    subject { page }

    let!(:instance) { create(:instance, :with_lecture_component_enabled) }

    with_tenant(:instance) do
      let(:course) { create(:course, :with_lecture_component_enabled) }
      let(:user) { create(:course_manager, course: course).user }
      let!(:lectures) do
        create_list(:course_lecture, 30, course: course)
      end

      before do
        login_as(user, scope: :user)
      end

      it 'lists each lecture' do
        visit course_lectures_path(course)

        expect(page).to have_selector('nav.pagination')
        course.lectures.sorted_by_date.page(1).each do |lecture|
          expect(page).to have_selector('div', text: lecture.title)
          expect(page).to have_selector('div', text: lecture.content)
        end
      end

      context 'after clicked second page' do
        before { visit course_lectures_path(course, page: '2') }

        it 'lists each lecture' do
          course.lectures.sorted_by_date.page(2).each do |lecture|
            expect(page).to have_selector('div', text: lecture.title)
            expect(page).to have_selector('div', text: lecture.content)
          end
        end
      end
    end
  end
end
