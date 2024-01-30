# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Leaderboard: View', js: true do
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

        within find('#leaderboard-level') do
          sorted_course_users = course.course_users.students.without_phantom_users.
                                ordered_by_experience_points

          sorted_course_users.each do |student|
            within find(content_tag_selector(student)) do
              expect(page).to have_text(student.name)
              expect(page).to have_link(nil, href: course_user_path(course, student))
            end
          end
        end

        expect(page).to have_no_content_tag_for(phantom_user)
      end

      scenario 'I can view the leaderboard sorted by achievement count' do
        create(:course_user_achievement, course_user: students[0])
        visit course_leaderboard_path(course)
        find('button#achievement-tab').click if has_css?('button#achievement-tab', wait: 0)

        within find('#leaderboard-achievement') do
          sorted_course_users = course.course_users.students.without_phantom_users.
                                ordered_by_achievement_count

          sorted_course_users.each do |student|
            within find(content_tag_selector(student)) do
              expect(page).to have_text(student.name)
            end
            student.achievements.ordered_by_date_obtained.take(5).each do |achievement|
              expect(page).to have_content_tag_for(achievement)
              expect(page).to have_link(nil, href: course_achievement_path(course, achievement))
            end
          end
        end

        expect(page).to have_no_content_tag_for(phantom_user)
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
          context = OpenStruct.new(current_course: course, key: Course::LeaderboardComponent.key)
          settings = Course::Settings::LeaderboardComponent.new(context)
          settings.enable_group_leaderboard = true
          course.save
        end

        scenario 'I can view the group leaderboard by experience points' do
          create(:course_experience_points_record, points_awarded: 200, course_user: students[0])

          visit course_leaderboard_path(course)
          expect(page).to have_selector('button#group-leaderboard-tab')
          find('button#group-leaderboard-tab').click

          within find('#group-leaderboard-level') do
            sorted_course_groups = course.groups.ordered_by_experience_points

            sorted_course_groups.each do |group|
              within find(content_tag_selector(group)) do
                expect(page).to have_text(group.name)
              end
            end
          end
        end

        scenario 'I can view the group leaderboard by achievement count' do
          create(:course_user_achievement, course_user: students[0])

          visit course_leaderboard_path(course)
          expect(page).to have_selector('button#group-leaderboard-tab')
          find('button#group-leaderboard-tab').click
          find('button#achievement-tab').click if has_css?('button#achievement-tab', wait: 0)

          within find('#group-leaderboard-achievement') do
            sorted_course_groups = course.groups.ordered_by_average_achievement_count

            sorted_course_groups.each do |group|
              within find(content_tag_selector(group)) do
                expect(page).to have_text(group.name)
              end
            end
          end
        end
      end
    end
  end
end
