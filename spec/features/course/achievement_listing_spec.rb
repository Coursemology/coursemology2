require 'rails_helper'

RSpec.describe 'Course: Achievements', type: :feature do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:user, role: :administrator) }
    let!(:course) { create(:course) }
    let!(:achievements) do
      create_list(:course_achievement, 10, course: course, creator: user, updater: user)
    end

    before do
      login_as(user, scope: :user)
    end

    before do
      visit course_achievements_path(course)
    end

    context 'management buttons' do
      it { is_expected.to have_link(I18n.t('course.achievements.index.new')) }
    end

    it 'shows all achievements' do
      achievements.each do |achievement|
        expect(page).to have_selector('div', text: achievement.title)
        expect(page).to have_selector('div', text: achievement.description)
      end
    end

    it 'shows all management buttons' do
      achievements.each do |achievement|
        expect(page).to have_link(nil, href: edit_course_achievement_path(course, achievement))
        expect(page).to have_link(nil, href: course_achievement_path(course, achievement))
      end
    end
  end
end
