require 'rails_helper'

RSpec.describe 'Course: Leaderboard: View' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before do
      login_as(user, scope: :user)
    end

    context 'As a student' do
      let!(:students) { create_list(:course_student, 2, course: course) }
      let!(:phantom_user) { create(:course_student, :phantom, course: course) }
      let(:user) { students[0].user }

      scenario 'I can view the leaderboard sorted by level' do
        create(:course_experience_points_record, points_awarded: 200, course_user: students[0])
        visit course_leaderboard_path(course)

        within find('.leaderboard-level') do
          sorted_course_users = course.course_users.students.without_phantom_users.
                                ordered_by_experience_points

          sorted_course_users.each.with_index(1) do |student, index|
            within find(content_tag_selector(student)) do
              expect(page).to have_text(index)
              expect(page).to have_text(I18n.t('course.leaderboards.show.level'))
            end
          end
        end

        expect(page).not_to have_content_tag_for(phantom_user)
      end

      scenario 'I can view the leaderboard sorted by achievement count' do
        create(:course_user_achievement, course_user: students[0])
        visit course_leaderboard_path(course)

        within find('.leaderboard-achievement') do
          sorted_course_users = course.course_users.students.without_phantom_users.
                                ordered_by_achievement_count

          sorted_course_users.each.with_index(1) do |student, index|
            within find(content_tag_selector(student)) do
              expect(page).to have_text(index)
              student.achievements.ordered_by_date_obtained.take(5).each do |achievement|
                expect(page).to have_content_tag_for(achievement)
              end
            end
          end
        end

        expect(page).not_to have_content_tag_for(phantom_user)
      end

      context 'when the group leaderboard is enabled for the course' do
        let!(:groups) { create_list(:course_group, 2, course: course) }
        let!(:group_user1) do
          create(:course_group_user, course: course, course_user: students[0], group: groups[0])
        end
        let!(:group_user2) do
          create(:course_group_user, course: course, course_user: students[1], group: groups[1])
        end

        before do
          settings = Course::Settings::LeaderboardComponent.
                     new(course.settings(:course_leaderboard_component))
          settings.enable_group_leaderboard = true
          course.save
        end

        scenario 'I can view the group leaderboard by experience points' do
          create(:course_experience_points_record, points_awarded: 200, course_user: students[0])

          visit group_course_leaderboard_path(course)
          expect(page).to have_text(I18n.t('course.leaderboards.groups.header'))

          within find('.leaderboard-points') do
            sorted_course_groups = course.groups.ordered_by_experience_points

            sorted_course_groups.each.with_index(1) do |group, index|
              within find(content_tag_selector(group)) do
                expect(page).to have_text(index)
                expect(page).to have_text(group.name)
              end
            end
          end
        end

        scenario 'I can view the group leaderboard by achievement count' do
          create(:course_user_achievement, course_user: students[0])

          visit group_course_leaderboard_path(course)
          expect(page).to have_text(I18n.t('course.leaderboards.groups.header'))

          within find('.leaderboard-achievement') do
            sorted_course_groups = course.groups.ordered_by_average_achievement_count

            sorted_course_groups.each.with_index(1) do |group, index|
              within find(content_tag_selector(group)) do
                expect(page).to have_text(index)
                expect(page).to have_text(group.name)
              end
            end
          end
        end
      end
    end
  end
end
