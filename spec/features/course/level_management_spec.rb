# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Levels' do
  subject { page }

  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:levels) do
      (1..3).map do |i|
        create(:course_level, course: course, experience_points_threshold: 100 * i)
      end
    end

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Administrator' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view the Level Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.levels.sidebar_title')
      end

      scenario 'I can view course levels', js: true do
        visit course_levels_path(course)

        (1..3).each do |i|
          # Check for level number
          expect(page.find('tbody')).to have_selector('td', text: i)
          # Check for threshold
          expect(page.find('tbody')).to have_xpath("//input[@value=#{i * 100}]")
        end
      end

      scenario 'I can create a course level', js: true do
        visit course_levels_path(course)
        find('#add-level').click
        find('#save-levels').click
        # Causes the test to wait for the server response.
        expect(page.find('#course-level')).to have_selector('span', text: 'Levels Saved')

        # 4 visible levels and the default 0 level.
        expect(course.reload.levels.count).to eq 5
      end

      scenario 'I can delete a course level', js: true do
        visit course_levels_path(course)
        find('#delete_2').click
        find('#save-levels').click
        expect(page.find('#course-level')).to have_selector('span', text: 'Levels Saved')

        # Level 2 with threshold 200 has been deleted.
        expect(course.reload.levels.map(&:experience_points_threshold)).not_to include(200)
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot view the Level Sidebar item' do
        visit course_path(course)

        expect(page).not_to have_selector('li', text: 'course.levels.sidebar_title')
      end
    end
  end
end
