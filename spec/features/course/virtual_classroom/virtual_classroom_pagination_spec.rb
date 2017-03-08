# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: VirtualClassrooms' do
  describe 'Pagination' do
    subject { page }

    let!(:instance) { create(:instance, :with_virtual_classroom_component_enabled) }

    with_tenant(:instance) do
      let(:course) { create(:course, :with_virtual_classroom_component_enabled) }
      let(:user) { create(:course_manager, course: course).user }
      let!(:virtual_classrooms) do
        create_list(:course_virtual_classroom, 30, course: course)
      end

      before do
        login_as(user, scope: :user)
      end

      it 'lists each virtual_classroom' do
        visit course_virtual_classrooms_path(course)

        expect(page).to have_selector('nav.pagination')
        course.virtual_classrooms.sorted_by_date.page(1).each do |virtual_classroom|
          expect(page).to have_selector('div', text: virtual_classroom.title)
          expect(page).to have_selector('div', text: virtual_classroom.content)
        end
      end

      context 'after clicked second page' do
        before { visit course_virtual_classrooms_path(course, page: '2') }

        it 'lists each virtual_classroom' do
          course.virtual_classrooms.sorted_by_date.page(2).each do |virtual_classroom|
            expect(page).to have_selector('div', text: virtual_classroom.title)
            expect(page).to have_selector('div', text: virtual_classroom.content)
          end
        end
      end
    end
  end
end
