require 'rails_helper'

RSpec.describe 'Course: Levels', type: :feature do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:user, role: :administrator) }
    let!(:course) { create(:course) }
    let!(:levels) do
      [create(:course_level, course: course, experience_points_threshold: 200),
       create(:course_level, course: course, experience_points_threshold: 300),
       create(:course_level, course: course, experience_points_threshold: 100)]
    end

    before do
      login_as(user, scope: :user)
      visit course_levels_path(course)
    end

    it 'shows all level thresholds' do
      levels.each do |level|
        expect(page).to have_selector('td', text: level.experience_points_threshold)
      end
    end

    it 'labels thresholds with correct level numbers' do
      expect(page.find('tr', text: 100)).to have_selector('td', text: 1)
      expect(page.find('tr', text: 200)).to have_selector('td', text: 2)
      expect(page.find('tr', text: 300)).to have_selector('td', text: 3)
    end
  end
end
