require 'rails_helper'

RSpec.describe 'Course: Leaderboard: View' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before do
      login_as(user, scope: :user)
    end

    context 'As a student' do
      let(:students) { create_list(:course_student, 2, :approved, course: course) }
      let(:user) { students[0].user }

      scenario 'I can view the leaderboard sorted by level' do
        create(:course_experience_points_record, points_awarded: 200, course_user: students[0])
        visit course_leaderboard_path(course)

        within find('.leaderboard-level') do
          sorted_course_users = course.course_users.students.ordered_by_experience_points

          sorted_course_users.each.with_index(1) do |student, index|
            within find(content_tag_selector(student)) do
              expect(page).to have_text(index)
              expect(page).to have_text(I18n.t('course.leaderboards.show.level'))
            end
          end
        end
      end

      scenario 'I can view the leaderboard sorted by achievement count' do
        create(:course_user_achievement, course_user: students[0])
        visit course_leaderboard_path(course)

        within find('.leaderboard-achievement') do
          sorted_course_users = course.course_users.students.ordered_by_achievement_count

          sorted_course_users.each.with_index(1) do |student, index|
            within find(content_tag_selector(student)) do
              expect(page).to have_text(index)
              student.achievements.ordered_by_date_obtained.take(5).each do |achievement|
                expect(page).to have_content_tag_for(achievement)
              end
            end
          end
        end
      end
    end
  end
end
